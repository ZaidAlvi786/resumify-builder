# backend/routes/base_profile_routes.py
"""Base profile CRUD.

The base profile is the user's source-of-truth career history. Every
tailoring / skeleton / extension feature reads from it. Per-user RLS plus
JWT-verified user_id ensures one user can never touch another's row.
"""
from fastapi import APIRouter, Depends, HTTPException, status

from schemas.base_profile import BaseProfile, BaseProfilePatch
from utils.auth import get_current_user_id
from utils.supabase_client import supabase


router = APIRouter()


def _require_db() -> None:
    if supabase is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database not configured",
        )


def _load_row(user_id: str) -> dict | None:
    resp = (
        supabase.table("base_profiles")
        .select("content")
        .eq("user_id", user_id)
        .limit(1)
        .execute()
    )
    if not resp.data:
        return None
    return resp.data[0]["content"]


def _upsert_row(user_id: str, content: dict) -> None:
    supabase.table("base_profiles").upsert(
        {"user_id": user_id, "content": content},
        on_conflict="user_id",
    ).execute()


@router.get(
    "/",
    response_model=BaseProfile,
    responses={404: {"description": "No base profile exists for this user yet"}},
)
async def get_base_profile(user_id: str = Depends(get_current_user_id)) -> BaseProfile:
    _require_db()
    row = _load_row(user_id)
    if row is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"code": "BASE_PROFILE_MISSING", "message": "Base profile not found"},
        )
    return BaseProfile.model_validate(row)


@router.put("/", response_model=BaseProfile)
async def put_base_profile(
    profile: BaseProfile,
    user_id: str = Depends(get_current_user_id),
) -> BaseProfile:
    """Full upsert. The whole BaseProfile replaces any existing one."""
    _require_db()
    _upsert_row(user_id, profile.model_dump(mode="json"))
    return profile


@router.patch("/", response_model=BaseProfile)
async def patch_base_profile(
    patch: BaseProfilePatch,
    user_id: str = Depends(get_current_user_id),
) -> BaseProfile:
    """JSON-Merge-Patch style: any present top-level key replaces the
    corresponding key on the stored profile; absent keys are untouched.
    A non-existent profile is treated as `{}` for merge purposes — the
    patch must still validate to a complete BaseProfile after merge.
    """
    _require_db()
    current = _load_row(user_id) or {}
    updates = patch.model_dump(exclude_unset=True, mode="json")
    if not updates:
        # No keys present: surface a 422 rather than silently no-op
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="PATCH body has no fields to update",
        )
    merged = {**current, **updates}
    try:
        validated = BaseProfile.model_validate(merged)
    except Exception as exc:
        # Merge result violates BaseProfile shape (e.g. patch removed
        # required `personal` and no prior row existed).
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(exc),
        )
    _upsert_row(user_id, validated.model_dump(mode="json"))
    return validated
