# backend/services/google_oauth.py
"""Google OAuth 2.0 authorization-code flow with PKCE.

Scope-minimal: only spreadsheets + drive.file. Raw HTTP (httpx) is used
instead of the heavy google-auth libraries so the flow stays small and
unit-testable by mocking `google_oauth.httpx`.
"""
import base64
import hashlib
import os

import httpx

AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"
TOKEN_URL = "https://oauth2.googleapis.com/token"  # noqa: S105 - public endpoint
REVOKE_URL = "https://oauth2.googleapis.com/revoke"

# Minimal scopes — create/edit only spreadsheets this app made.
SCOPES = [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive.file",
]


def _client_id() -> str:
    value = os.getenv("GOOGLE_CLIENT_ID", "")
    if not value:
        raise RuntimeError("GOOGLE_CLIENT_ID is not set")
    return value


def _client_secret() -> str:
    value = os.getenv("GOOGLE_CLIENT_SECRET", "")
    if not value:
        raise RuntimeError("GOOGLE_CLIENT_SECRET is not set")
    return value


def _redirect_uri() -> str:
    value = os.getenv("GOOGLE_REDIRECT_URI", "")
    if not value:
        raise RuntimeError("GOOGLE_REDIRECT_URI is not set")
    return value


def generate_pkce() -> tuple[str, str]:
    """Return (code_verifier, code_challenge) for the S256 PKCE method."""
    verifier = base64.urlsafe_b64encode(os.urandom(32)).rstrip(b"=").decode()
    digest = hashlib.sha256(verifier.encode()).digest()
    challenge = base64.urlsafe_b64encode(digest).rstrip(b"=").decode()
    return verifier, challenge


def build_authorization_url(state: str, code_challenge: str) -> str:
    """Build the consent-screen URL. `state` is the server-side nonce."""
    params = {
        "client_id": _client_id(),
        "redirect_uri": _redirect_uri(),
        "response_type": "code",
        "scope": " ".join(SCOPES),
        "state": state,
        "code_challenge": code_challenge,
        "code_challenge_method": "S256",
        "access_type": "offline",  # request a refresh token
        "prompt": "consent",       # force refresh token on re-consent
    }
    return f"{AUTH_URL}?{httpx.QueryParams(params)}"


def exchange_code(code: str, code_verifier: str) -> dict:
    """Exchange an authorization code for tokens.

    Returns the raw token document: access_token, refresh_token, expires_in.
    """
    resp = httpx.post(
        TOKEN_URL,
        data={
            "code": code,
            "client_id": _client_id(),
            "client_secret": _client_secret(),
            "redirect_uri": _redirect_uri(),
            "grant_type": "authorization_code",
            "code_verifier": code_verifier,
        },
        timeout=20.0,
    )
    resp.raise_for_status()
    return resp.json()


def refresh_access_token(refresh_token: str) -> str:
    """Exchange a stored refresh token for a fresh access token."""
    resp = httpx.post(
        TOKEN_URL,
        data={
            "client_id": _client_id(),
            "client_secret": _client_secret(),
            "refresh_token": refresh_token,
            "grant_type": "refresh_token",
        },
        timeout=20.0,
    )
    resp.raise_for_status()
    token = resp.json().get("access_token")
    if not token:
        raise RuntimeError("Google did not return an access_token on refresh")
    return token


def revoke_token(token: str) -> None:
    """Best-effort revocation of a refresh/access token."""
    try:
        httpx.post(REVOKE_URL, params={"token": token}, timeout=20.0)
    except Exception:
        pass
