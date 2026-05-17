# backend/services/skeleton_service.py
"""JD-aware resume skeleton generator.

For users without a base profile (or who want a structured starting point).
The skeleton is built *deterministically* from a JDAnalysis — the only LLM
call is the (cached) JD extraction. Every career field stays a bracketed
placeholder; the skeleton never claims to be the user's real history.
"""
from schemas.skeleton import (
    BulletPrompt,
    CoverageMapEntry,
    ExperienceSlot,
    ProjectSlot,
    ResumeSkeleton,
    SkeletonInput,
    SkillsChecklistItem,
)
from schemas.tailoring import JDAnalysis
from services.jd_extraction_service import extract_jd_requirements


# How many experience slots to scaffold, by seniority.
SLOT_COUNT_BY_SENIORITY = {
    "intern": 1, "junior": 2, "mid": 3, "senior": 4,
    "staff": 5, "principal": 5, "lead": 5, "manager": 5, "director": 5,
}


def _slot_bullet_prompts(slot_index: int, analysis: JDAnalysis) -> list[BulletPrompt]:
    """Bullet prompts for one experience slot. The most recent slot
    (index 0) gets the most JD-targeted prompts."""
    must = analysis.must_have_skills
    resp = analysis.responsibilities
    prompts: list[BulletPrompt] = []

    if slot_index == 0:
        if must:
            top = must[:3]
            prompts.append(BulletPrompt(
                prompt=(
                    f"Describe a system you built or improved using "
                    f"[{' / '.join(top)}] — include the measurable result "
                    f"(latency, throughput, % improvement, $ saved)."
                ),
                related_skills=top,
            ))
        if resp:
            prompts.append(BulletPrompt(
                prompt=(
                    f'The JD lists this responsibility: "{resp[0]}". Describe a '
                    f"time you did exactly that — the scope, your decisions, the outcome."
                ),
                related_skills=[],
            ))
        prompts.append(BulletPrompt(
            prompt=(
                "Describe a project you owned end-to-end — what you decided, "
                "what shipped, and the quantified impact."
            ),
            related_skills=[],
        ))
    else:
        remaining = must[slot_index * 2:] or must
        if remaining:
            pair = remaining[:2]
            prompts.append(BulletPrompt(
                prompt=(
                    f"Describe work that used [{' / '.join(pair)}] — what you "
                    f"achieved and how you measured it."
                ),
                related_skills=pair,
            ))
        prompts.append(BulletPrompt(
            prompt="Describe a measurable improvement you drove (cost, time, quality, scale).",
            related_skills=[],
        ))
        prompts.append(BulletPrompt(
            prompt="Describe a time you collaborated across teams to deliver something.",
            related_skills=[],
        ))
    return prompts


def _experience_slots(n: int, analysis: JDAnalysis) -> list[ExperienceSlot]:
    role = analysis.role_title or "the target role"
    slots: list[ExperienceSlot] = []
    for i in range(n):
        if i == 0:
            title = f"[Most recent role aligned to: {role}]"
            reason = "Your most recent role — put your strongest JD match here."
        else:
            title = f"[Earlier role #{i + 1}]"
            reason = "An earlier role, in reverse-chronological order."
        slots.append(ExperienceSlot(
            slot_id=f"exp-{i + 1}",
            suggested_count_reason=reason,
            title=title,  # company/dates/location keep schema placeholders
            bullet_prompts=_slot_bullet_prompts(i, analysis),
            tech_stack_suggestions=analysis.must_have_skills[:6],
        ))
    return slots


def _project_slots(seniority: str, analysis: JDAnalysis) -> list[ProjectSlot]:
    n = 2 if seniority in ("intern", "junior") else 1
    primary = analysis.must_have_skills[:2]
    tech_phrase = " / ".join(primary) if primary else "a relevant technology"
    slots: list[ProjectSlot] = []
    for i in range(n):
        slots.append(ProjectSlot(
            slot_id=f"proj-{i + 1}",
            bullet_prompts=[
                BulletPrompt(
                    prompt=(
                        f"Describe a project using [{tech_phrase}] — the problem, "
                        f"your approach, and the outcome."
                    ),
                    related_skills=primary,
                ),
                BulletPrompt(
                    prompt="What was the measurable result, or what did you learn?",
                    related_skills=[],
                ),
            ],
            tech_stack_suggestions=analysis.must_have_skills[:6],
        ))
    return slots


def _skills_checklist(analysis: JDAnalysis) -> list[SkillsChecklistItem]:
    items: list[SkillsChecklistItem] = []
    seen: set[str] = set()
    for skill in analysis.must_have_skills:
        key = skill.lower()
        if key in seen:
            continue
        seen.add(key)
        items.append(SkillsChecklistItem(
            name=skill, source="jd_must_have", suggested_section="skills",
        ))
    for skill in analysis.nice_to_have_skills:
        key = skill.lower()
        if key in seen:
            continue
        seen.add(key)
        items.append(SkillsChecklistItem(
            name=skill, source="jd_nice_to_have", suggested_section="skills",
        ))
    return items


def _coverage_map(analysis: JDAnalysis) -> dict[str, CoverageMapEntry]:
    cmap: dict[str, CoverageMapEntry] = {}
    for skill in analysis.must_have_skills + analysis.nice_to_have_skills:
        if skill not in cmap:
            cmap[skill] = CoverageMapEntry(status="uncovered")
    return cmap


def _suggested_sections(seniority: str) -> list[str]:
    if seniority in ("intern", "junior"):
        return ["summary", "education", "projects", "experience", "skills", "certifications"]
    return ["summary", "experience", "projects", "skills", "education", "certifications"]


def generate_skeleton(data: SkeletonInput) -> ResumeSkeleton:
    """Build a JD-aware resume skeleton. The JD extraction is cached;
    everything below is deterministic given the resulting JDAnalysis."""
    analysis = extract_jd_requirements(data.job_description)

    seniority = (data.target_seniority or analysis.seniority or "mid").strip().lower()
    if seniority not in SLOT_COUNT_BY_SENIORITY:
        seniority = "mid"
    n_slots = SLOT_COUNT_BY_SENIORITY[seniority]

    return ResumeSkeleton(
        suggested_sections=_suggested_sections(seniority),
        experience_slots=_experience_slots(n_slots, analysis),
        projects_slots=_project_slots(seniority, analysis),
        skills_checklist=_skills_checklist(analysis),
        coverage_map=_coverage_map(analysis),
        inferred_seniority=seniority,
    )
