# backend/utils/auth.py
"""JWT verification dependency.

Routes that need a verified user identity should depend on
`get_current_user_id`. It verifies the supplied Supabase JWT and returns
the authenticated user_id. Never trust a user_id in the request body for
read/write of user-owned data.
"""
from typing import Optional

from fastapi import Header, HTTPException, status

from utils.logging import set_request_user
from utils.supabase_client import supabase


async def get_current_user_id(
    authorization: Optional[str] = Header(default=None),
) -> str:
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing Authorization header",
        )
    if not authorization.lower().startswith("bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization header must be 'Bearer <jwt>'",
        )
    if supabase is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Auth backend not configured",
        )
    token = authorization.split(" ", 1)[1].strip()
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Empty bearer token",
        )
    try:
        resp = supabase.auth.get_user(token)
    except Exception:  # network / library errors map to 401
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )
    user = getattr(resp, "user", None)
    user_id = getattr(user, "id", None) if user else None
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )
    set_request_user(user_id)  # attach to the structured request log
    return user_id
