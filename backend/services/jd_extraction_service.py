# backend/services/jd_extraction_service.py
"""Shared job-description analysis.

One service, three callers: tailoring, skeleton, and the Chrome extension.
Results are cached by sha256 of the normalised JD text in the jd_cache
table — the same JD recurs across users, and analysis is deterministic-ish.
"""
import hashlib
import json
from typing import Optional

from schemas.tailoring import JDAnalysis
from services.ai_client import create_chat_completion_with_auto_fallback
from utils.supabase_client import supabase


_SENIORITY_VALUES = {
    "intern", "junior", "mid", "senior", "staff",
    "principal", "lead", "manager", "director",
}

_LIST_KEYS = (
    "must_have_skills", "nice_to_have_skills", "responsibilities",
    "keywords", "domain_signals", "red_flags",
)

_SYSTEM_PROMPT = (
    "You are a precise job-description analyst. Extract only what the JD "
    "actually states — never infer or invent a company, requirement, or "
    "metric. Return strictly valid JSON matching the requested schema."
)


def jd_hash(jd_text: str) -> str:
    """Stable cache key for a JD.

    Trailing whitespace per line is stripped so trivially different copies
    of the same posting share a cache entry.
    """
    normalised = "\n".join(line.rstrip() for line in jd_text.strip().splitlines())
    return hashlib.sha256(normalised.encode("utf-8")).hexdigest()


def _build_user_prompt(jd_text: str) -> str:
    return f"""Analyse this job description. Return a JSON object with EXACTLY these keys:
- company_hint: string or null (only if the JD explicitly names the company)
- role_title: string or null
- seniority: one of intern|junior|mid|senior|staff|principal|lead|manager|director, or null
- must_have_skills: string[]  (hard requirements)
- nice_to_have_skills: string[]  (preferred / bonus)
- responsibilities: string[]
- years_experience_required: integer or null
- keywords: string[]  (deduped, lowercased, ATS-relevant terms)
- domain_signals: string[]  (e.g. "b2b-saas", "fintech-regulated", "early-stage-startup")
- red_flags: string[]  (e.g. unpaid, vague compensation, unrealistic scope)

Job description:
\"\"\"
{jd_text}
\"\"\"
"""


def _normalise(data: dict) -> dict:
    """Defensive cleanup before Pydantic validation: coerce None lists to [],
    dedupe + lowercase keywords, lowercase seniority (drop if not in the
    allowed set), and coerce a stringy years value to int."""
    out = dict(data)

    for key in _LIST_KEYS:
        val = out.get(key)
        out[key] = val if isinstance(val, list) else []

    seen: set[str] = set()
    keywords: list[str] = []
    for kw in out["keywords"]:
        if not isinstance(kw, str):
            continue
        low = kw.strip().lower()
        if low and low not in seen:
            seen.add(low)
            keywords.append(low)
    out["keywords"] = keywords

    sen = out.get("seniority")
    if isinstance(sen, str) and sen.strip().lower() in _SENIORITY_VALUES:
        out["seniority"] = sen.strip().lower()
    else:
        out["seniority"] = None

    yrs = out.get("years_experience_required")
    if isinstance(yrs, bool):
        out["years_experience_required"] = None
    elif isinstance(yrs, str):
        digits = "".join(c for c in yrs if c.isdigit())
        out["years_experience_required"] = int(digits) if digits else None
    elif not isinstance(yrs, int):
        out["years_experience_required"] = None

    return out


def _cache_get(h: str) -> Optional[JDAnalysis]:
    if supabase is None:
        return None
    try:
        resp = (
            supabase.table("jd_cache")
            .select("analysis")
            .eq("hash", h)
            .limit(1)
            .execute()
        )
    except Exception:
        return None
    if not resp.data:
        return None
    try:
        return JDAnalysis.model_validate(resp.data[0]["analysis"])
    except Exception:
        # Stale / schema-drifted cache row — treat as a miss.
        return None


def _cache_put(h: str, analysis: JDAnalysis) -> None:
    if supabase is None:
        return
    try:
        supabase.table("jd_cache").upsert(
            {"hash": h, "analysis": analysis.model_dump(mode="json")},
            on_conflict="hash",
        ).execute()
    except Exception:
        # Caching is best-effort; never fail the request over it.
        pass


def extract_jd_requirements(jd_text: str, use_cache: bool = True) -> JDAnalysis:
    """Extract structured requirements from a raw job description.

    Cache-first: identical JDs (by normalised sha256) reuse a prior analysis.
    Raises ValueError on an empty JD or an unparseable LLM response.
    """
    if not jd_text or not jd_text.strip():
        raise ValueError("job_description is empty")

    h = jd_hash(jd_text)
    if use_cache:
        cached = _cache_get(h)
        if cached is not None:
            return cached

    response = create_chat_completion_with_auto_fallback(
        messages=[
            {"role": "system", "content": _SYSTEM_PROMPT},
            {"role": "user", "content": _build_user_prompt(jd_text)},
        ],
        response_format={"type": "json_object"},
        temperature=0.2,
    )
    raw = response.choices[0].message.content or "{}"
    try:
        data = json.loads(raw)
    except json.JSONDecodeError as exc:
        raise ValueError(f"JD analysis returned invalid JSON: {exc}") from exc

    analysis = JDAnalysis.model_validate(_normalise(data))
    if use_cache:
        _cache_put(h, analysis)
    return analysis
