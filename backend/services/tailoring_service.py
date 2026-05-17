# backend/services/tailoring_service.py
"""JD-driven resume tailoring from the user's base profile.

Flow: load base profile -> analyse JD -> one LLM call that reorders and
rephrases (never the company/title/dates) -> anti-hallucination validate ->
one stricter retry on failure -> deterministic match_score.
"""
import json

from pydantic import ValidationError

from schemas.base_profile import BaseProfile
from schemas.tailoring import JDAnalysis, TailorFromJDInput, TailoredResumeOutput
from services.ai_client import create_chat_completion_with_auto_fallback
from services.anti_hallucination import HallucinationError, validate_against_base_profile
from services.jd_extraction_service import extract_jd_requirements
from utils.supabase_client import supabase


class BaseProfileMissing(Exception):
    """Raised when the user has no base profile to tailor from."""


_SYSTEM_PROMPT = """You are a resume tailoring engine. You rewrite a user's
EXISTING resume to emphasise what a specific job description asks for.

ABSOLUTE RULES — never break these:
- Never invent a company, job title, employment date, degree, certification
  or metric. Use ONLY what is in the user's base profile.
- Keep every experience entry's company, title, start_date and end_date
  EXACTLY as given in the base profile. You may reorder entries and rewrite
  bullet points, but never alter the company/title/dates.
- Output placeholders (e.g. [Company name], [Start date - End date],
  [Quantify the impact: e.g. % improvement, $ saved, # users]) for any
  information not present in the user's base profile. Never invent
  companies, titles, dates, or metrics.
- If a bullet would need a metric the user did not provide, insert a
  placeholder like [Quantify the impact] rather than inventing a number.

Return strictly valid JSON."""


def _strict_suffix(profile: BaseProfile) -> str:
    rows = [
        f'- company="{e.company}" title="{e.title}" '
        f'start_date="{e.start_date}" end_date="{e.end_date or ""}"'
        for e in profile.experience
    ]
    listing = "\n".join(rows) if rows else "(no experience entries in the base profile)"
    return (
        "\n\nSTRICT MODE: a previous attempt fabricated an entry. You may emit "
        "experience entries with ONLY these exact identity tuples:\n"
        + listing
        + "\nAny experience entry not in this list MUST be fully bracketed "
        "placeholders for every field."
    )


def _build_user_prompt(profile: BaseProfile, analysis: JDAnalysis, jd_text: str) -> str:
    return f"""Tailor this resume to the job description.

USER BASE PROFILE (the only source of truth — never go beyond it):
{profile.model_dump_json()}

JD ANALYSIS:
{analysis.model_dump_json()}

RAW JOB DESCRIPTION:
\"\"\"
{jd_text}
\"\"\"

Return a JSON object with these keys ONLY:
- summary: string — 2-3 sentences tuned to the JD, drawn only from real profile facts.
- experience: array — the base profile's experience reordered most-relevant-first.
  Each entry: company, title, location, start_date, end_date, is_current,
  bullets[] (rephrased for the JD; use [placeholders] for any missing metric),
  tech_stack[]. company/title/start_date/end_date COPIED EXACTLY from the base profile.
- projects: array — base-profile projects only; each name, role, description,
  bullets[], tech_stack[]. name COPIED EXACTLY.
- skills: array of strings — the user's skills ordered by JD relevance.
- matched_keywords: array of strings — JD keywords the resume genuinely satisfies.
- gaps: array — JD requirements the user does NOT meet; each requirement,
  severity (critical|important|nice), suggested_learning_path {{duration,
  resources: [{{title, url, type}}]}}.
- rationale: array — per-section notes; each {{section, rationale}}.
"""


def _str_list(value: object) -> list[str]:
    if not isinstance(value, list):
        return []
    return [str(v) for v in value if isinstance(v, (str, int, float))]


def _assemble(llm: dict, profile: BaseProfile) -> TailoredResumeOutput:
    """Build the full output. personal / education / certifications /
    languages pass through from the base profile verbatim — the LLM never
    touches them, so it cannot fabricate a degree or certification."""
    return TailoredResumeOutput(
        match_score=0,  # computed deterministically by the caller
        matched_keywords=_str_list(llm.get("matched_keywords")),
        gaps=llm.get("gaps") or [],
        rationale=llm.get("rationale") or [],
        personal=profile.personal.model_dump(mode="json"),
        summary=llm.get("summary"),
        experience=llm.get("experience") or [],
        skills=_str_list(llm.get("skills")),
        projects=llm.get("projects") or [],
        education=[e.model_dump(mode="json") for e in profile.education],
        certifications=[c.model_dump(mode="json") for c in profile.certifications],
        languages=[lang.model_dump(mode="json") for lang in profile.languages],
    )


def _generate(
    profile: BaseProfile, analysis: JDAnalysis, jd_text: str, strict: bool = False
) -> TailoredResumeOutput:
    system = _SYSTEM_PROMPT + (_strict_suffix(profile) if strict else "")
    response = create_chat_completion_with_auto_fallback(
        messages=[
            {"role": "system", "content": system},
            {"role": "user", "content": _build_user_prompt(profile, analysis, jd_text)},
        ],
        response_format={"type": "json_object"},
        temperature=0.0 if strict else 0.3,
    )
    raw = response.choices[0].message.content or "{}"
    try:
        llm = json.loads(raw)
    except json.JSONDecodeError as exc:
        raise ValueError(f"Tailoring returned invalid JSON: {exc}") from exc
    try:
        return _assemble(llm, profile)
    except ValidationError as exc:
        raise ValueError(f"Tailoring output failed schema validation: {exc}") from exc


def _resume_haystack(output: TailoredResumeOutput) -> str:
    parts: list[str] = [output.summary or ""]
    parts += output.skills
    parts += output.matched_keywords
    for exp in output.experience:
        parts += exp.bullets + exp.tech_stack
    for proj in output.projects:
        parts += proj.bullets + proj.tech_stack
        if proj.description:
            parts.append(proj.description)
    return "\n".join(parts).lower()


def compute_match_score(output: TailoredResumeOutput, analysis: JDAnalysis) -> int:
    """Deterministic 0-100 score: must-have coverage weighted 80%,
    nice-to-have coverage 20%."""
    must = analysis.must_have_skills
    nice = analysis.nice_to_have_skills
    if not must and not nice:
        return 50
    haystack = _resume_haystack(output)
    must_cov = (
        sum(1 for s in must if s.lower() in haystack) / len(must) if must else 1.0
    )
    nice_cov = (
        sum(1 for s in nice if s.lower() in haystack) / len(nice) if nice else 1.0
    )
    return round(must_cov * 80 + nice_cov * 20)


def _load_base_profile(user_id: str) -> BaseProfile:
    if supabase is None:
        raise RuntimeError("Database not configured")
    resp = (
        supabase.table("base_profiles")
        .select("content")
        .eq("user_id", user_id)
        .limit(1)
        .execute()
    )
    if not resp.data:
        raise BaseProfileMissing("No base profile for this user")
    return BaseProfile.model_validate(resp.data[0]["content"])


def tailor_from_jd(data: TailorFromJDInput) -> TailoredResumeOutput:
    """Tailor the user's base profile to a job description.

    Raises BaseProfileMissing (-> 404), HallucinationError (-> 422 after a
    failed strict retry), ValueError (-> 502), RuntimeError (-> 503).
    """
    profile = _load_base_profile(data.user_id)
    analysis = extract_jd_requirements(data.job_description)

    output = _generate(profile, analysis, data.job_description, strict=False)
    try:
        validate_against_base_profile(output, profile)
    except HallucinationError:
        # One stricter retry; if it fails again the error propagates.
        output = _generate(profile, analysis, data.job_description, strict=True)
        validate_against_base_profile(output, profile)

    output.match_score = compute_match_score(output, analysis)
    return output
