# backend/services/integrations_service.py
"""Storage for Google OAuth state nonces and per-user integrations.

OAuth states are single-use and short-lived. Refresh tokens are stored
encrypted (token_crypto). Both tables are written with the service-role
key; google_oauth_states has no RLS, google_integrations is owner-read.
"""
from datetime import datetime, timedelta, timezone
from typing import Optional

from utils.supabase_client import supabase

STATE_TTL_SECONDS = 600  # 10 minutes


def _require_db() -> None:
    if supabase is None:
        raise RuntimeError("Database not configured")


def _utc_now() -> datetime:
    return datetime.now(timezone.utc)


# ---------- OAuth state ----------


def save_oauth_state(
    state: str, user_id: str, code_verifier: str, return_url: Optional[str]
) -> None:
    _require_db()
    expires = _utc_now() + timedelta(seconds=STATE_TTL_SECONDS)
    supabase.table("google_oauth_states").insert(
        {
            "state": state,
            "user_id": user_id,
            "code_verifier": code_verifier,
            "return_url": return_url,
            "expires_at": expires.isoformat(),
        }
    ).execute()


def consume_oauth_state(state: str) -> Optional[dict]:
    """Fetch and delete a state row. Returns None if missing, used, or expired."""
    _require_db()
    resp = (
        supabase.table("google_oauth_states")
        .select("*")
        .eq("state", state)
        .limit(1)
        .execute()
    )
    if not resp.data:
        return None
    row = resp.data[0]
    # Single-use: delete regardless of validity.
    supabase.table("google_oauth_states").delete().eq("state", state).execute()
    if row.get("used_at"):
        return None
    expires_at = datetime.fromisoformat(row["expires_at"])
    if expires_at < _utc_now():
        return None
    return row


# ---------- integration ----------


def save_integration(
    user_id: str,
    spreadsheet_id: str,
    refresh_token_encrypted: str,
    scopes: list[str],
) -> None:
    _require_db()
    supabase.table("google_integrations").upsert(
        {
            "user_id": user_id,
            "spreadsheet_id": spreadsheet_id,
            "refresh_token_encrypted": refresh_token_encrypted,
            "scopes": scopes,
        },
        on_conflict="user_id",
    ).execute()


def get_integration(user_id: str) -> Optional[dict]:
    _require_db()
    resp = (
        supabase.table("google_integrations")
        .select("*")
        .eq("user_id", user_id)
        .limit(1)
        .execute()
    )
    return resp.data[0] if resp.data else None


def delete_integration(user_id: str) -> None:
    _require_db()
    supabase.table("google_integrations").delete().eq("user_id", user_id).execute()
