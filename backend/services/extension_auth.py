# backend/services/extension_auth.py
"""Auth for the Chrome extension channel.

Design: the server holds one EXTENSION_SIGNING_KEY. At login the web app
gets a signed token `{user_id}.{expiry}.{sig}` plus a per-user HMAC secret
derived as HMAC(KEY, "secret:"+user_id). No per-user secret is stored —
the backend recomputes everything from the key and user_id.

Every extension -> backend request carries:
  X-Resumify-Token       the signed token (proves user_id)
  X-Resumify-Timestamp   unix seconds (rejected if >60s skew)
  X-Resumify-Nonce       random; rejected on replay (5-min cache)
  X-Resumify-Signature   HMAC(hmac_secret, "METHOD\\npath\\nts\\nnonce\\nbody")
"""
import hashlib
import hmac
import os
import time

TOKEN_TTL_SECONDS = 86_400      # 24h
_TIMESTAMP_SKEW_SECONDS = 60
_NONCE_TTL_SECONDS = 300        # 5 min

# In-process replay cache: nonce -> expiry epoch. A multi-instance deploy
# would need shared storage (see Step 11's rate_limits table); single
# instance is correct as-is.
_nonce_cache: dict[str, float] = {}


class ExtensionAuthError(Exception):
    """Raised when extension request authentication fails."""


def _signing_key() -> bytes:
    key = os.getenv("EXTENSION_SIGNING_KEY", "")
    if not key:
        raise RuntimeError("EXTENSION_SIGNING_KEY is not set")
    return key.encode()


def _hmac_hex(key: bytes, message: str) -> str:
    return hmac.new(key, message.encode(), hashlib.sha256).hexdigest()


def derive_hmac_secret(user_id: str) -> str:
    """Per-user HMAC secret. Deterministic — recomputed, never stored."""
    return _hmac_hex(_signing_key(), f"secret:{user_id}")


def issue_token(user_id: str, ttl_seconds: int = TOKEN_TTL_SECONDS) -> dict:
    """Mint a signed token + HMAC secret for the extension cookie."""
    expiry = int(time.time()) + ttl_seconds
    payload = f"{user_id}.{expiry}"
    token = f"{payload}.{_hmac_hex(_signing_key(), payload)}"
    return {
        "token": token,
        "hmac_secret": derive_hmac_secret(user_id),
        "expires_at": expiry,
    }


def verify_token(token: str) -> str:
    """Return the user_id from a valid, unexpired token; else raise."""
    parts = token.split(".")
    if len(parts) != 3:
        raise ExtensionAuthError("malformed token")
    user_id, expiry_str, signature = parts
    expected = _hmac_hex(_signing_key(), f"{user_id}.{expiry_str}")
    if not hmac.compare_digest(expected, signature):
        raise ExtensionAuthError("bad token signature")
    try:
        expiry = int(expiry_str)
    except ValueError:
        raise ExtensionAuthError("malformed token expiry")
    if expiry < time.time():
        raise ExtensionAuthError("token expired")
    return user_id


def canonical_string(
    method: str, path: str, timestamp: int, nonce: str, body: str
) -> str:
    return "\n".join([method.upper(), path, str(timestamp), nonce, body])


def _prune_nonces(now: float) -> None:
    expired = [n for n, exp in _nonce_cache.items() if exp < now]
    for n in expired:
        _nonce_cache.pop(n, None)


def verify_signed_request(
    *,
    token: str,
    timestamp: int,
    nonce: str,
    signature: str,
    method: str,
    path: str,
    body: str,
) -> str:
    """Verify an HMAC-signed extension request. Return user_id, or raise."""
    user_id = verify_token(token)

    now = time.time()
    if abs(now - timestamp) > _TIMESTAMP_SKEW_SECONDS:
        raise ExtensionAuthError("stale timestamp")

    _prune_nonces(now)
    if nonce in _nonce_cache:
        raise ExtensionAuthError("replayed nonce")

    secret = derive_hmac_secret(user_id).encode()
    expected = _hmac_hex(secret, canonical_string(method, path, timestamp, nonce, body))
    if not hmac.compare_digest(expected, signature):
        raise ExtensionAuthError("bad request signature")

    # Record the nonce only after a fully successful verification.
    _nonce_cache[nonce] = now + _NONCE_TTL_SECONDS
    return user_id
