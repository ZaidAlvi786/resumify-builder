# backend/services/anti_hallucination.py
"""Anti-hallucination validator for tailored / skeleton output.

Rule: every tailored experience or project entry must EITHER match the
user's base profile exactly, OR have every identity field be a clearly
bracketed placeholder (`^\\[.+\\]$`). A mixed entry — a real employer with
invented dates, say — is exactly the shape a hallucination takes, so it is
rejected too.
"""
from typing import List

from schemas.base_profile import BaseProfile
from schemas.tailoring import (
    AntiHallucinationError,
    TailoredResumeOutput,
    is_placeholder,
)

# end_date synonyms that all mean "no end date".
_ONGOING = {"", "present", "current", "now", "ongoing", "n/a"}


class HallucinationError(Exception):
    """Raised when a tailored output contains fabricated career entries."""

    def __init__(self, errors: List[AntiHallucinationError]):
        self.errors = errors
        super().__init__(f"{len(errors)} fabricated/mixed entr(y/ies) detected")


def _norm(value: object) -> str:
    return (str(value) if value is not None else "").strip().lower()


def _norm_end(value: object) -> str:
    s = _norm(value)
    return "" if s in _ONGOING else s


def _exp_key(company: object, title: object, start: object, end: object) -> tuple:
    return (_norm(company), _norm(title), _norm(start), _norm_end(end))


def _exp_is_all_placeholder(exp) -> bool:
    """True when company/title/start are placeholders and end is a
    placeholder or empty (an explicitly blank, to-be-filled entry)."""
    if not (
        is_placeholder(exp.company)
        and is_placeholder(exp.title)
        and is_placeholder(exp.start_date)
    ):
        return False
    return (
        exp.end_date is None
        or exp.end_date == ""
        or is_placeholder(exp.end_date)
    )


def _exp_has_any_placeholder(exp) -> bool:
    return any(
        [
            is_placeholder(exp.company),
            is_placeholder(exp.title),
            is_placeholder(exp.start_date),
            is_placeholder(exp.end_date or ""),
        ]
    )


def validate_against_base_profile(
    output: TailoredResumeOutput, profile: BaseProfile
) -> None:
    """Raise HallucinationError if any tailored entry is fabricated.

    Note: `personal`, `education`, `certifications` and `languages` are not
    checked here — the tailoring service copies them verbatim from the base
    profile and never lets the LLM near them, so they cannot be fabricated.
    """
    errors: List[AntiHallucinationError] = []

    base_exp = {
        _exp_key(e.company, e.title, e.start_date, e.end_date)
        for e in profile.experience
    }
    base_projects = {_norm(p.name) for p in profile.projects}

    for i, exp in enumerate(output.experience):
        if _exp_is_all_placeholder(exp):
            continue
        if _exp_key(exp.company, exp.title, exp.start_date, exp.end_date) in base_exp:
            continue
        code = (
            "MIXED_PLACEHOLDER"
            if _exp_has_any_placeholder(exp)
            else "FABRICATED_ENTRY"
        )
        errors.append(
            AntiHallucinationError(
                code=code,
                section="experience",
                index=i,
                offending_tuple={
                    "company": exp.company,
                    "title": exp.title,
                    "start_date": exp.start_date,
                    "end_date": exp.end_date,
                },
                detail=(
                    "Experience entry matches no base-profile entry and is "
                    "not a fully-placeholder entry."
                ),
            )
        )

    for i, proj in enumerate(output.projects):
        if is_placeholder(proj.name):
            continue
        if _norm(proj.name) in base_projects:
            continue
        errors.append(
            AntiHallucinationError(
                code="FABRICATED_ENTRY",
                section="projects",
                index=i,
                offending_tuple={"name": proj.name},
                detail="Project is not present in the base profile.",
            )
        )

    if errors:
        raise HallucinationError(errors)
