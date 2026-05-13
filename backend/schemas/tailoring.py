# backend/schemas/tailoring.py
"""Schemas for JD analysis + tailored-resume output.

The TailoredResumeOutput is the target of the anti-hallucination validator
(implemented in services/anti_hallucination.py during Step 5): every
(company, title, start_date, end_date) tuple must either match the user's
base profile exactly, or every such field must be a bracketed placeholder
matching PLACEHOLDER_RE. Mixed real/invented entries are rejected.
"""
import re
from typing import List, Optional, Literal
from pydantic import BaseModel, Field


PLACEHOLDER_RE = re.compile(r"^\[.+\]$")


Severity = Literal["critical", "important", "nice"]
Seniority = Literal[
    "intern", "junior", "mid", "senior", "staff",
    "principal", "lead", "manager", "director",
]


class JDAnalysis(BaseModel):
    """Structured extraction from a single job description.

    Cached by sha256(jd_text) in the jd_cache table.
    """
    company_hint: Optional[str] = None
    role_title: Optional[str] = None
    seniority: Optional[Seniority] = None
    must_have_skills: List[str] = []
    nice_to_have_skills: List[str] = []
    responsibilities: List[str] = []
    years_experience_required: Optional[int] = Field(default=None, ge=0, le=60)
    keywords: List[str] = []
    domain_signals: List[str] = []
    red_flags: List[str] = []


class TailorFromJDInput(BaseModel):
    user_id: str = Field(min_length=1)
    job_description: str = Field(min_length=10)
    job_url: Optional[str] = None
    company: Optional[str] = None
    role: Optional[str] = None


class LearningResourceMini(BaseModel):
    title: str = Field(min_length=1)
    url: Optional[str] = None
    type: Optional[str] = None  # "course" | "doc" | "book" | "project"


class LearningPathMini(BaseModel):
    duration: Optional[str] = None  # e.g. "2-3 weeks"
    resources: List[LearningResourceMini] = []


class GapItem(BaseModel):
    requirement: str = Field(min_length=1)
    severity: Severity
    suggested_learning_path: Optional[LearningPathMini] = None


class SectionRationale(BaseModel):
    section: str
    rationale: str


class RelevanceScore(BaseModel):
    item_id: str
    score: int = Field(ge=0, le=100)
    matched_keywords: List[str] = []
    rationale: Optional[str] = None


class TailoredExperience(BaseModel):
    """An experience entry rewritten for emphasis. The (company, title,
    start_date, end_date) tuple is checked by the anti-hallucination
    validator against the user's base profile.
    """
    company: str = Field(min_length=1)
    title: str = Field(min_length=1)
    location: Optional[str] = None
    start_date: str = Field(min_length=1)
    end_date: Optional[str] = None
    is_current: bool = False
    bullets: List[str] = []
    tech_stack: List[str] = []
    base_profile_ref: Optional[str] = None


class TailoredProject(BaseModel):
    name: str = Field(min_length=1)
    role: Optional[str] = None
    description: Optional[str] = None
    bullets: List[str] = []
    tech_stack: List[str] = []
    base_profile_ref: Optional[str] = None


class TailoredResumeOutput(BaseModel):
    match_score: int = Field(ge=0, le=100)
    matched_keywords: List[str] = []
    gaps: List[GapItem] = []
    rationale: List[SectionRationale] = []

    # Reconstructed resume content. `personal` and the static lists pass
    # through from the base profile verbatim; `experience` and `projects`
    # are the rewritten ones validated against base profile.
    personal: dict
    summary: Optional[str] = None
    experience: List[TailoredExperience] = []
    education: List[dict] = []
    skills: List[str] = []  # ordered by JD relevance
    projects: List[TailoredProject] = []
    certifications: List[dict] = []
    languages: List[dict] = []


class AntiHallucinationError(BaseModel):
    """Structured payload returned with HTTP 422 when validation rejects."""
    code: Literal["FABRICATED_ENTRY", "MIXED_PLACEHOLDER"]
    section: str  # "experience" | "projects" | ...
    index: int
    offending_tuple: dict
    detail: str


def is_placeholder(value: Optional[str]) -> bool:
    """True iff the value is a bracketed placeholder like [Company name]."""
    if not value:
        return False
    return bool(PLACEHOLDER_RE.match(value.strip()))
