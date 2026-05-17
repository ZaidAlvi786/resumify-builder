# backend/services/applications_service.py
"""Application-tracker data access.

DB operations live here (not in the route) so routes stay thin and the
HTTP layer is testable by mocking these functions. Every query is scoped
to user_id explicitly — the backend uses the service-role key, which
bypasses RLS, so ownership must be enforced in code.
"""
from datetime import datetime, timezone
from typing import List, Optional, Tuple

from schemas.applications import Application, ApplicationBase, ApplicationUpdate
from utils.supabase_client import supabase


class ApplicationNotFound(Exception):
    """Raised when an application id is absent or not owned by the user."""


def _require_db() -> None:
    if supabase is None:
        raise RuntimeError("Database not configured")


def create(user_id: str, data: ApplicationBase) -> Application:
    _require_db()
    payload = data.model_dump(mode="json")
    payload["user_id"] = user_id
    resp = supabase.table("applications").insert(payload).execute()
    if not resp.data:
        raise RuntimeError("Insert returned no row")
    return Application.model_validate(resp.data[0])


def list_page(
    user_id: str,
    status: Optional[str],
    category: Optional[str],
    page: int,
    page_size: int,
) -> Tuple[List[Application], int]:
    """Return (items, total) for one page, newest first, soft-deleted excluded."""
    _require_db()
    query = (
        supabase.table("applications")
        .select("*", count="exact")
        .eq("user_id", user_id)
        .is_("deleted_at", "null")
    )
    if status:
        query = query.eq("status", status)
    if category:
        query = query.eq("job_category", category)
    start = (page - 1) * page_size
    resp = (
        query.order("created_at", desc=True)
        .range(start, start + page_size - 1)
        .execute()
    )
    items = [Application.model_validate(row) for row in (resp.data or [])]
    total = resp.count if resp.count is not None else len(items)
    return items, total


def update(user_id: str, application_id: str, data: ApplicationUpdate) -> Application:
    _require_db()
    updates = data.model_dump(exclude_unset=True, mode="json")
    if not updates:
        raise ValueError("No fields to update")
    resp = (
        supabase.table("applications")
        .update(updates)
        .eq("id", application_id)
        .eq("user_id", user_id)
        .execute()
    )
    if not resp.data:
        raise ApplicationNotFound(application_id)
    return Application.model_validate(resp.data[0])


def soft_delete(user_id: str, application_id: str) -> None:
    _require_db()
    now = datetime.now(timezone.utc).isoformat()
    resp = (
        supabase.table("applications")
        .update({"deleted_at": now})
        .eq("id", application_id)
        .eq("user_id", user_id)
        .is_("deleted_at", "null")
        .execute()
    )
    if not resp.data:
        raise ApplicationNotFound(application_id)


def list_all(user_id: str) -> List[Application]:
    """Every non-deleted application for a user — used by the XLSX export."""
    _require_db()
    resp = (
        supabase.table("applications")
        .select("*")
        .eq("user_id", user_id)
        .is_("deleted_at", "null")
        .order("created_at", desc=True)
        .execute()
    )
    return [Application.model_validate(row) for row in (resp.data or [])]
