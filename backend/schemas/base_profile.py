# backend/schemas/base_profile.py
"""Source-of-truth career profile.

Every tailored or skeleton output reads from this. Never invent fields
here — only the authenticated user writes to their own row.
"""
from typing import List, Optional
from pydantic import BaseModel, EmailStr, Field, field_validator


_DATE_RE_HINT = "Expected YYYY, YYYY-MM, or YYYY-MM-DD"


def _validate_date_loose(v: Optional[str]) -> Optional[str]:
    if v is None or v == "":
        return None
    if len(v) == 4 and v.isdigit():
        return v
    if len(v) in (7, 10) and v[4] == "-" and v[:4].isdigit() and v[5:7].isdigit():
        month = int(v[5:7])
        if not 1 <= month <= 12:
            raise ValueError(_DATE_RE_HINT)
        if len(v) == 10:
            if v[7] != "-" or not v[8:10].isdigit():
                raise ValueError(_DATE_RE_HINT)
            day = int(v[8:10])
            if not 1 <= day <= 31:
                raise ValueError(_DATE_RE_HINT)
        return v
    raise ValueError(_DATE_RE_HINT)


class PersonalInfo(BaseModel):
    full_name: str = Field(min_length=1)
    email: EmailStr
    phone: Optional[str] = None
    location: Optional[str] = None
    headline: Optional[str] = None
    summary: Optional[str] = None


class Link(BaseModel):
    label: str = Field(min_length=1)
    url: str = Field(min_length=1)


class Experience(BaseModel):
    company: str = Field(min_length=1)
    title: str = Field(min_length=1)
    location: Optional[str] = None
    start_date: str
    end_date: Optional[str] = None
    is_current: bool = False
    bullets: List[str] = []
    tech_stack: List[str] = []

    @field_validator("start_date")
    @classmethod
    def _start_date_format(cls, v: str) -> str:
        out = _validate_date_loose(v)
        if out is None:
            raise ValueError("start_date is required")
        return out

    @field_validator("end_date")
    @classmethod
    def _end_date_format(cls, v: Optional[str]) -> Optional[str]:
        return _validate_date_loose(v)


class Education(BaseModel):
    school: str = Field(min_length=1)
    degree: str = Field(min_length=1)
    field_of_study: Optional[str] = None
    location: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    is_current: bool = False
    gpa: Optional[str] = None
    notes: Optional[str] = None

    @field_validator("start_date", "end_date")
    @classmethod
    def _dates(cls, v: Optional[str]) -> Optional[str]:
        return _validate_date_loose(v)


class SkillItem(BaseModel):
    name: str = Field(min_length=1)
    category: Optional[str] = None
    level: Optional[str] = None
    years: Optional[int] = Field(default=None, ge=0, le=80)


class Project(BaseModel):
    name: str = Field(min_length=1)
    role: Optional[str] = None
    description: Optional[str] = None
    bullets: List[str] = []
    tech_stack: List[str] = []
    url: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None

    @field_validator("start_date", "end_date")
    @classmethod
    def _dates(cls, v: Optional[str]) -> Optional[str]:
        return _validate_date_loose(v)


class Certification(BaseModel):
    name: str = Field(min_length=1)
    issuer: Optional[str] = None
    issued_date: Optional[str] = None
    expiration_date: Optional[str] = None
    credential_id: Optional[str] = None
    url: Optional[str] = None

    @field_validator("issued_date", "expiration_date")
    @classmethod
    def _dates(cls, v: Optional[str]) -> Optional[str]:
        return _validate_date_loose(v)


class Language(BaseModel):
    name: str = Field(min_length=1)
    proficiency: Optional[str] = None


class BaseProfile(BaseModel):
    personal: PersonalInfo
    links: List[Link] = []
    experience: List[Experience] = []
    education: List[Education] = []
    skills: List[SkillItem] = []
    projects: List[Project] = []
    certifications: List[Certification] = []
    languages: List[Language] = []


class BaseProfilePatch(BaseModel):
    """JSON-Merge-Patch style partial update. Any present key replaces the
    full corresponding key on the stored profile; absent keys are untouched."""
    personal: Optional[PersonalInfo] = None
    links: Optional[List[Link]] = None
    experience: Optional[List[Experience]] = None
    education: Optional[List[Education]] = None
    skills: Optional[List[SkillItem]] = None
    projects: Optional[List[Project]] = None
    certifications: Optional[List[Certification]] = None
    languages: Optional[List[Language]] = None
