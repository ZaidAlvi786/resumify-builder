# backend/services/handoff_service.py
"""Extension handoff tokens: move a JD from the extension to the web app.

A handoff is created (HMAC-authed) by the extension, then consumed once
(JWT-authed) by the /tailor or /skeleton page. Single-use and 10-min TTL
are enforced atomically in the consume UPDATE.
"""
from datetime import datetime, timedelta, timezone
from typing import Optional

from utils.supabase_client import supabase

HANDOFF_TTL_SECONDS = 600  # 10 minutes


def _require_db() -> None:
    if supabase is None:
        raise RuntimeError("Database not configured")


def _utc_now() -> datetime:
    return datetime.now(timezone.utc)


def create_handoff(
    user_id: str,
    kind: str,
    job_description: str,
    job_url: Optional[str],
    company: Optional[str],
    role: Optional[str],
) -> dict:
    """Insert a handoff row. Returns {handoff_id, expires_at}."""
    _require_db()
    expires_at = _utc_now() + timedelta(seconds=HANDOFF_TTL_SECONDS)
    resp = (
        supabase.table("extension_handoffs")
        .insert(
            {
                "user_id": user_id,
                "kind": kind,
                "job_description": job_description,
                "job_url": job_url,
                "company": company,
                "role": role,
                "expires_at": expires_at.isoformat(),
            }
        )
        .execute()
    )
    if not resp.data:
        raise RuntimeError("Handoff insert returned no row")
    return {"handoff_id": resp.data[0]["id"], "expires_at": resp.data[0]["expires_at"]}


def consume_handoff(user_id: str, handoff_id: str) -> Optional[dict]:
    """Atomically claim a handoff: mark used only if unused, unexpired and
    owned by this user. Returns the row on first claim, else None."""
    _require_db()
    now = _utc_now().isoformat()
    resp = (
        supabase.table("extension_handoffs")
        .update({"used_at": now})
        .eq("id", handoff_id)
        .eq("user_id", user_id)
        .is_("used_at", "null")
        .gt("expires_at", now)
        .execute()
    )
    if not resp.data:
        return None
    return resp.data[0]
