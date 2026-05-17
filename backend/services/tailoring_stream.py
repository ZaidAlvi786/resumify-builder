# backend/services/tailoring_stream.py
"""NDJSON event stream for progressive tailoring.

Wraps the tailoring pipeline so the frontend can render section by section.
Validation runs in full BEFORE any section is emitted — fabricated content
is never streamed to the client. The event order is:

    jd_analyzed  ->  section* (10 sections)  ->  done

or a single `error` event if anything fails.
"""
from typing import Iterator

from schemas.tailoring import TailorFromJDInput
from services.anti_hallucination import HallucinationError, validate_against_base_profile
from services.jd_extraction_service import extract_jd_requirements
from services.tailoring_service import (
    BaseProfileMissing,
    _generate,
    _load_base_profile,
    compute_match_score,
)


def _dump_list(items) -> list:
    return [item.model_dump(mode="json") for item in items]


def tailor_events(data: TailorFromJDInput) -> Iterator[dict]:
    """Yield NDJSON-able event dicts for progressive tailoring."""
    try:
        profile = _load_base_profile(data.user_id)
    except BaseProfileMissing:
        yield {
            "event": "error",
            "code": "BASE_PROFILE_MISSING",
            "message": "Create a base profile before tailoring.",
        }
        return
    except RuntimeError as exc:
        yield {"event": "error", "code": "SERVICE_UNAVAILABLE", "message": str(exc)}
        return

    try:
        analysis = extract_jd_requirements(data.job_description)
    except Exception as exc:  # JD extraction / upstream LLM failure
        yield {"event": "error", "code": "JD_ANALYSIS_FAILED", "message": str(exc)}
        return
    yield {"event": "jd_analyzed", "data": analysis.model_dump(mode="json")}

    try:
        output = _generate(profile, analysis, data.job_description, strict=False)
        try:
            validate_against_base_profile(output, profile)
        except HallucinationError:
            output = _generate(profile, analysis, data.job_description, strict=True)
            validate_against_base_profile(output, profile)
    except HallucinationError as exc:
        yield {
            "event": "error",
            "code": "FABRICATED_CONTENT",
            "message": "Tailoring produced fabricated entries after a retry.",
            "errors": [e.model_dump() for e in exc.errors],
        }
        return
    except ValueError as exc:
        yield {"event": "error", "code": "TAILORING_FAILED", "message": str(exc)}
        return

    output.match_score = compute_match_score(output, analysis)

    yield {"event": "section", "section": "personal", "data": output.personal}
    yield {"event": "section", "section": "summary", "data": output.summary}
    yield {"event": "section", "section": "experience", "data": _dump_list(output.experience)}
    yield {"event": "section", "section": "skills", "data": output.skills}
    yield {"event": "section", "section": "projects", "data": _dump_list(output.projects)}
    yield {"event": "section", "section": "education", "data": output.education}
    yield {"event": "section", "section": "certifications", "data": output.certifications}
    yield {"event": "section", "section": "languages", "data": output.languages}
    yield {"event": "section", "section": "gaps", "data": _dump_list(output.gaps)}
    yield {"event": "section", "section": "rationale", "data": _dump_list(output.rationale)}

    yield {
        "event": "done",
        "match_score": output.match_score,
        "matched_keywords": output.matched_keywords,
    }
