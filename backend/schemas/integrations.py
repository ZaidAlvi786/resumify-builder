# backend/schemas/integrations.py
"""Extension handoff + Google Sheets integration schemas."""
from datetime import datetime
from typing import List, Literal, Optional
from pydantic import BaseModel, Field


HandoffKind = Literal["tailor", "skeleton", "save"]


class ExtensionHandoffCreate(BaseModel):
    """Sent by the Chrome extension to /api/extension/handoff.

    user_id is derived from the verified HMAC-signed cookie token on the
    server, never trusted from the request body. This schema is what the
    server constructs internally before insert.
    """
    user_id: str = Field(min_length=1)
    kind: HandoffKind
    job_description: str = Field(min_length=1)
    job_url: Optional[str] = None
    company: Optional[str] = None
    role: Optional[str] = None


class ExtensionHandoffRequest(BaseModel):
    """The wire-format request body from the extension. user_id is NOT here;
    it comes from the signed cookie. Validated separately."""
    kind: HandoffKind
    job_description: str = Field(min_length=1)
    job_url: Optional[str] = None
    company: Optional[str] = None
    role: Optional[str] = None


class ExtensionHandoff(BaseModel):
    id: str
    user_id: str
    kind: HandoffKind
    job_description: str
    job_url: Optional[str] = None
    company: Optional[str] = None
    role: Optional[str] = None
    expires_at: datetime
    used_at: Optional[datetime] = None
    created_at: datetime


class ExtensionHandoffCreatedResponse(BaseModel):
    handoff_id: str
    expires_at: datetime


class GoogleConnectStart(BaseModel):
    user_id: str = Field(min_length=1)
    return_url: str = Field(min_length=1)


class GoogleConnectStartResponse(BaseModel):
    oauth_url: str
    state: str
    expires_at: datetime


class GoogleIntegration(BaseModel):
    user_id: str
    spreadsheet_id: str
    scopes: List[str]
    connected_at: datetime


class GoogleDisconnectRequest(BaseModel):
    user_id: str = Field(min_length=1)
