# backend/utils/logging.py
"""Structured per-request JSON logging.

One log line per request with: request_id, user_id, route, latency_ms,
model_used, fallback_count, status. A contextvar carries the in-flight
context so the route layer (user_id) and the AI layer (model_used,
fallback_count) can contribute to the line the middleware ultimately emits.

NEVER log JD text, resume content, or personal info — only IDs (opaque
UUIDs), the route path (no query string), and counts.
"""
from __future__ import annotations

import contextvars
import json
import logging
import time
import uuid
from typing import Optional, TypedDict


class RequestContext(TypedDict):
    request_id: str
    route: str
    user_id: Optional[str]
    model_used: Optional[str]
    fallback_count: int
    _start: float


_request_ctx: contextvars.ContextVar[Optional[RequestContext]] = contextvars.ContextVar(
    "resumify_request_ctx", default=None
)

_logger = logging.getLogger("resumify")
if not _logger.handlers:
    _handler = logging.StreamHandler()
    _handler.setFormatter(logging.Formatter("%(message)s"))
    _logger.addHandler(_handler)
    _logger.setLevel(logging.INFO)


def new_request_context(route: str) -> RequestContext:
    """Start a fresh context for an incoming request."""
    ctx: RequestContext = {
        "request_id": uuid.uuid4().hex,
        "route": route,
        "user_id": None,
        "model_used": None,
        "fallback_count": 0,
        "_start": time.monotonic(),
    }
    _request_ctx.set(ctx)
    return ctx


def get_request_context() -> Optional[RequestContext]:
    return _request_ctx.get()


def set_request_user(user_id: str) -> None:
    """Record the authenticated user on the active request (noop if none)."""
    ctx = _request_ctx.get()
    if ctx is not None:
        ctx["user_id"] = user_id


def record_model_use(model: str, fallback_count: int) -> None:
    """Record which LLM served the request and how many fallbacks it took."""
    ctx = _request_ctx.get()
    if ctx is not None:
        ctx["model_used"] = model
        ctx["fallback_count"] = fallback_count


def emit_request_log(status: int) -> None:
    """Emit the single structured log line for the active request."""
    ctx = _request_ctx.get()
    if ctx is None:
        return
    record = {
        "request_id": ctx["request_id"],
        "user_id": ctx["user_id"],
        "route": ctx["route"],
        "latency_ms": round((time.monotonic() - ctx["_start"]) * 1000, 1),
        "model_used": ctx["model_used"],
        "fallback_count": ctx["fallback_count"],
        "status": status,
    }
    _logger.info(json.dumps(record))
