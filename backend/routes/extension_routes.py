# backend/routes/extension_routes.py
"""Chrome extension channel. Mounted at /api/extension.

- POST /issue-token        JWT-authed; web app calls this at login.
- POST /handoff            HMAC-authed; extension creates a JD handoff.
- POST /save-application   HMAC-authed; extension's "Just save" action.
- GET  /handoff/{id}       JWT-authed; web app consumes a handoff (once).
"""
from fastapi import APIRouter, Depends, HTTPException, Request, status

from schemas.applications import Application, ApplicationBase
from schemas.integrations import (
    ExtensionHandoff,
    ExtensionHandoffCreatedResponse,
    ExtensionHandoffRequest,
)
from services import applications_service, handoff_service
from services.extension_auth import (
    ExtensionAuthError,
    issue_token,
    verify_signed_request,
)
from utils.auth import get_current_user_id

router = APIRouter()


async def require_extension_user(request: Request) -> str:
    """FastAPI dependency: verify an HMAC-signed extension request."""
    token = request.headers.get("x-resumify-token", "")
    timestamp = request.headers.get("x-resumify-timestamp", "")
    nonce = request.headers.get("x-resumify-nonce", "")
    signature = request.headers.get("x-resumify-signature", "")
    if not all([token, timestamp, nonce, signature]):
        raise HTTPException(
            status.HTTP_401_UNAUTHORIZED, "Missing extension auth headers"
        )
    try:
        ts = int(timestamp)
    except ValueError:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Bad timestamp header")
    body = (await request.body()).decode("utf-8")
    try:
        return verify_signed_request(
            token=token,
            timestamp=ts,
            nonce=nonce,
            signature=signature,
            method=request.method,
            path=request.url.path,
            body=body,
        )
    except ExtensionAuthError as exc:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, str(exc))


@router.post("/issue-token")
async def issue_extension_token(user_id: str = Depends(get_current_user_id)) -> dict:
    """Mint the signed token + HMAC secret for the extension cookie."""
    try:
        return issue_token(user_id)
    except RuntimeError as exc:
        # EXTENSION_SIGNING_KEY not configured — degrade cleanly to 503.
        raise HTTPException(
            status.HTTP_503_SERVICE_UNAVAILABLE,
            f"Extension integration not configured: {exc}",
        )


@router.post("/handoff", response_model=ExtensionHandoffCreatedResponse)
async def create_handoff(
    data: ExtensionHandoffRequest,
    user_id: str = Depends(require_extension_user),
) -> ExtensionHandoffCreatedResponse:
    """Extension creates a JD handoff; the popup then opens the web app."""
    try:
        result = handoff_service.create_handoff(
            user_id, data.kind, data.job_description,
            data.job_url, data.company, data.role,
        )
    except RuntimeError as exc:
        raise HTTPException(status.HTTP_503_SERVICE_UNAVAILABLE, str(exc))
    return ExtensionHandoffCreatedResponse(**result)


@router.post("/save-application", response_model=Application, status_code=201)
async def save_application(
    data: ApplicationBase,
    user_id: str = Depends(require_extension_user),
) -> Application:
    """The extension's 'Just save the JD' action — create an application."""
    try:
        return applications_service.create(user_id, data)
    except RuntimeError as exc:
        raise HTTPException(status.HTTP_503_SERVICE_UNAVAILABLE, str(exc))


@router.get("/handoff/{handoff_id}", response_model=ExtensionHandoff)
async def consume_handoff(
    handoff_id: str,
    user_id: str = Depends(get_current_user_id),
) -> ExtensionHandoff:
    """Web app consumes a handoff (single-use) to prefill /tailor or /skeleton."""
    row = handoff_service.consume_handoff(user_id, handoff_id)
    if row is None:
        raise HTTPException(
            status.HTTP_404_NOT_FOUND,
            "Handoff not found, already used, or expired",
        )
    return ExtensionHandoff.model_validate(row)
