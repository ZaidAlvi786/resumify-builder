# backend/schemas/skeleton.py
"""JD-aware resume skeleton: every career field is a placeholder string.

Used when the user has no base profile yet (or wants a structured starting
point). Field defaults are bracketed placeholders so an unfilled skeleton
trivially fails the anti-hallucination validator's "real OR placeholder"
check — nothing here pretends to be the user's actual history.
"""
from typing import Dict, List, Optional, Literal
from pydantic import BaseModel, Field


ChecklistSource = Literal["jd_must_have", "jd_nice_to_have", "user_added"]
SlotCoverageStatus = Literal["uncovered", "mentioned", "demonstrated"]


class SkeletonInput(BaseModel):
    user_id: Optional[str] = None
    job_description: str = Field(min_length=10)
    job_url: Optional[str] = None
    target_seniority: Optional[str] = None  # overrides JD-inferred seniority


class BulletPrompt(BaseModel):
    prompt: str = Field(min_length=1)
    related_skills: List[str] = []


class ExperienceSlot(BaseModel):
    slot_id: str = Field(min_length=1)
    suggested_count_reason: Optional[str] = None
    company: str = "[Company name]"
    title: str = "[Most recent role]"
    dates: str = "[Start date – End date]"
    location: str = "[City, Country or Remote]"
    bullet_prompts: List[BulletPrompt] = []
    tech_stack_suggestions: List[str] = []


class ProjectSlot(BaseModel):
    slot_id: str = Field(min_length=1)
    name: str = "[Project name]"
    role: str = "[Your role]"
    bullet_prompts: List[BulletPrompt] = []
    tech_stack_suggestions: List[str] = []


class SkillsChecklistItem(BaseModel):
    name: str = Field(min_length=1)
    source: ChecklistSource
    checked: bool = False
    suggested_section: Optional[str] = None  # "experience"|"projects"|"skills"


class CoverageMapEntry(BaseModel):
    status: SlotCoverageStatus = "uncovered"
    covered_by: Optional[str] = None  # slot_id of the demonstrating entry
    where: Optional[str] = None  # "experience.slot-1.bullets[2]" path


class ResumeSkeleton(BaseModel):
    suggested_sections: List[str] = []
    experience_slots: List[ExperienceSlot] = []
    projects_slots: List[ProjectSlot] = []
    skills_checklist: List[SkillsChecklistItem] = []
    coverage_map: Dict[str, CoverageMapEntry] = {}  # skill_name -> entry
    inferred_seniority: Optional[str] = None
