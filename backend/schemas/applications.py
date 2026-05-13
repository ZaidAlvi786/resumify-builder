# backend/schemas/applications.py
"""Application tracker schemas."""
from datetime import datetime
from typing import List, Literal, Optional
from pydantic import BaseModel, Field


ApplicationStatus = Literal[
    "saved", "applied", "interviewing", "offer", "rejected", "withdrawn",
]


class ApplicationBase(BaseModel):
    company: str = Field(min_length=1)
    role: str = Field(min_length=1)
    job_category: Optional[str] = None
    job_url: Optional[str] = None
    resume_id: Optional[str] = None
    status: ApplicationStatus = "saved"
    applied_at: Optional[datetime] = None
    notes: Optional[str] = None
    jd_hash: Optional[str] = None


class ApplicationCreate(ApplicationBase):
    user_id: str = Field(min_length=1)


class ApplicationUpdate(BaseModel):
    company: Optional[str] = None
    role: Optional[str] = None
    job_category: Optional[str] = None
    job_url: Optional[str] = None
    resume_id: Optional[str] = None
    status: Optional[ApplicationStatus] = None
    applied_at: Optional[datetime] = None
    notes: Optional[str] = None
    jd_hash: Optional[str] = None


class Application(ApplicationBase):
    id: str
    user_id: str
    created_at: datetime
    updated_at: datetime
    deleted_at: Optional[datetime] = None


class ApplicationListResponse(BaseModel):
    items: List[Application]
    page: int = Field(ge=1)
    page_size: int = Field(ge=1, le=200)
    total: int = Field(ge=0)


class ApplicationListQuery(BaseModel):
    status: Optional[ApplicationStatus] = None
    category: Optional[str] = None
    page: int = Field(default=1, ge=1)
    page_size: int = Field(default=25, ge=1, le=200)
