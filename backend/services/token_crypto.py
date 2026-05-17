# backend/services/token_crypto.py
"""Symmetric encryption for Google refresh tokens at rest.

Fernet = AES-128-CBC + HMAC-SHA256. GOOGLE_TOKEN_ENC_KEY must be a urlsafe
base64-encoded 32-byte key; generate one with `Fernet.generate_key()`.
The key never leaves the server.
"""
import os

from cryptography.fernet import Fernet


def _fernet() -> Fernet:
    key = os.getenv("GOOGLE_TOKEN_ENC_KEY", "")
    if not key:
        raise RuntimeError("GOOGLE_TOKEN_ENC_KEY is not set")
    return Fernet(key.encode())


def encrypt(plaintext: str) -> str:
    """Encrypt a token. Output is a urlsafe string safe to store in Postgres."""
    return _fernet().encrypt(plaintext.encode()).decode()


def decrypt(ciphertext: str) -> str:
    """Decrypt a token previously produced by encrypt()."""
    return _fernet().decrypt(ciphertext.encode()).decode()
