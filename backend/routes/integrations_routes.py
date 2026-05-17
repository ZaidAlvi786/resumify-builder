# backend/routes/integrations_routes.py
"""Google Sheets integration: OAuth connect / callback / status / disconnect.

Mounted at /api/integrations. The callback is unauthenticated by design —
Google redirects the browser there; security comes from the single-use,
server-stored state nonce that ties the flow back to a user_id.
"""
import os
import secrets
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import RedirectResponse

from schemas.integrations import GoogleConnectStartResponse, GoogleIntegration
from services import google_oauth, google_sheets_service, integrations_service
from services.integrations_service import STATE_TTL_SECONDS
from services.token_crypto import decrypt, encrypt
from utils.auth import get_current_user_id

router = APIRouter()


def _frontend_url() -> str:
    return os.getenv("FRONTEND_URL", "http://localhost:3000").rstrip("/")


def _safe_return_url(candidate: str | None) -> str:
    """Honour a stored return_url only if it points at our own frontend —
    otherwise the callback would be an open redirect."""
    fe = _frontend_url()
    if candidate and candidate.startswith(fe):
        return candidate
    return f"{fe}/applications"


@router.get("/google/start", response_model=GoogleConnectStartResponse)
async def google_start(
    return_url: str | None = Query(default=None),
    user_id: str = Depends(get_current_user_id),
) -> GoogleConnectStartResponse:
    """Begin the OAuth flow: mint a state nonce + PKCE pair, return the URL."""
    state = secrets.token_urlsafe(32)
    verifier, challenge = google_oauth.generate_pkce()
    try:
        integrations_service.save_oauth_state(state, user_id, verifier, return_url)
        oauth_url = google_oauth.build_authorization_url(state, challenge)
    except RuntimeError as exc:
        raise HTTPException(status.HTTP_503_SERVICE_UNAVAILABLE, str(exc))
    expires = datetime.now(timezone.utc) + timedelta(seconds=STATE_TTL_SECONDS)
    return GoogleConnectStartResponse(oauth_url=oauth_url, state=state, expires_at=expires)


@router.get("/google/callback")
async def google_callback(
    code: str | None = Query(default=None),
    state: str | None = Query(default=None),
    error: str | None = Query(default=None),
) -> RedirectResponse:
    """OAuth redirect target. Exchanges the code, creates the sheet, stores
    the encrypted refresh token, then bounces the browser back to the app."""
    fe = _frontend_url()
    if error or not code or not state:
        return RedirectResponse(f"{fe}/applications?google=error")

    row = integrations_service.consume_oauth_state(state)
    if row is None:
        return RedirectResponse(f"{fe}/applications?google=error&reason=state")

    return_url = _safe_return_url(row.get("return_url"))
    try:
        tokens = google_oauth.exchange_code(code, row["code_verifier"])
        refresh_token = tokens.get("refresh_token")
        access_token = tokens.get("access_token")
        if not refresh_token or not access_token:
            return RedirectResponse(f"{return_url}?google=error&reason=token")
        spreadsheet_id = google_sheets_service.create_applications_sheet(access_token)
        integrations_service.save_integration(
            row["user_id"], spreadsheet_id, encrypt(refresh_token), google_oauth.SCOPES
        )
    except Exception:
        return RedirectResponse(f"{return_url}?google=error&reason=exchange")

    sep = "&" if "?" in return_url else "?"
    return RedirectResponse(f"{return_url}{sep}google=connected")


@router.get("/google", response_model=GoogleIntegration)
async def google_status(user_id: str = Depends(get_current_user_id)) -> GoogleIntegration:
    """Return the caller's Google integration, or 404 if not connected."""
    row = integrations_service.get_integration(user_id)
    if not row:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "No Google integration")
    return GoogleIntegration(
        user_id=row["user_id"],
        spreadsheet_id=row["spreadsheet_id"],
        scopes=row["scopes"],
        connected_at=row["connected_at"],
    )


@router.post("/google/disconnect")
async def google_disconnect(user_id: str = Depends(get_current_user_id)) -> dict:
    """Revoke the token at Google and delete the stored integration."""
    row = integrations_service.get_integration(user_id)
    if row:
        try:
            google_oauth.revoke_token(decrypt(row["refresh_token_encrypted"]))
        except Exception:
            pass  # revocation is best-effort; we delete locally regardless
        integrations_service.delete_integration(user_id)
    return {"status": "disconnected"}
