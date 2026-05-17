# backend/utils/rate_limit.py
"""Token-bucket rate limiting, keyed by (user_id, route group).

The live limiter is in-process: correct and atomic on a single instance.
The `rate_limits` table is provisioned for a future multi-instance limiter
(it would need atomic Postgres ops or Redis); this module does not depend
on it. Per-plan multipliers scale the limits from `profiles.plan`.

Usage:
    @router.post("/expensive")
    @rate_limited(group="ai_heavy", cost=1)
    async def handler(..., user_id: str = Depends(get_current_user_id)):
        ...
"""
from __future__ import annotations

import functools
import math
import time
from dataclasses import dataclass

from fastapi import HTTPException, status

# group -> (burst capacity, refill rate in tokens/second) for a free user.
_GROUP_LIMITS: dict[str, tuple[float, float]] = {
    "ai_heavy": (10.0, 10.0 / 60.0),   # 10-request burst, +10/min
    "default": (60.0, 1.0),            # 60 burst, +60/min
}

# Higher plans get proportionally larger buckets.
_PLAN_MULTIPLIER: dict[str, float] = {"free": 1.0, "pro": 5.0, "ultra": 20.0}


@dataclass
class _Bucket:
    tokens: float
    last_refill: float


_buckets: dict[str, _Bucket] = {}


def _reset_buckets() -> None:
    """Clear all buckets — for tests only."""
    _buckets.clear()


async def _get_plan(user_id: str) -> str:
    """Resolve the user's plan; defaults to 'free' on any failure."""
    try:
        from utils.subscription_helper import get_user_subscription_status

        row = await get_user_subscription_status(user_id)
        return str(row.get("plan", "free"))
    except Exception:
        return "free"


def _limits_for(group: str, plan: str) -> tuple[float, float]:
    capacity, refill = _GROUP_LIMITS.get(group, _GROUP_LIMITS["default"])
    multiplier = _PLAN_MULTIPLIER.get(plan, 1.0)
    return capacity * multiplier, refill * multiplier


async def enforce_rate_limit(user_id: str, group: str, cost: int = 1) -> None:
    """Consume `cost` tokens for (user_id, group). Raise 429 if exhausted."""
    plan = await _get_plan(user_id)
    capacity, refill = _limits_for(group, plan)
    key = f"{user_id}:{group}"
    now = time.monotonic()

    bucket = _buckets.get(key)
    if bucket is None:
        bucket = _Bucket(tokens=capacity, last_refill=now)
        _buckets[key] = bucket
    else:
        elapsed = now - bucket.last_refill
        bucket.tokens = min(capacity, bucket.tokens + elapsed * refill)
        bucket.last_refill = now

    if bucket.tokens >= cost:
        bucket.tokens -= cost
        return

    deficit = cost - bucket.tokens
    retry_after = max(1, math.ceil(deficit / refill)) if refill > 0 else 60
    raise HTTPException(
        status_code=status.HTTP_429_TOO_MANY_REQUESTS,
        detail=f"Rate limit exceeded for '{group}'. Retry in {retry_after}s.",
        headers={"Retry-After": str(retry_after)},
    )


def rate_limited(group: str, cost: int = 1):
    """Decorator for FastAPI route handlers that have a `user_id` parameter
    (e.g. resolved via Depends(get_current_user_id)). functools.wraps keeps
    the original signature so FastAPI still injects the dependencies."""

    def decorator(func):
        @functools.wraps(func)
        async def wrapper(*args, **kwargs):
            user_id = kwargs.get("user_id")
            if isinstance(user_id, str) and user_id:
                await enforce_rate_limit(user_id, group, cost)
            return await func(*args, **kwargs)

        return wrapper

    return decorator
