# backend/routes/tailoring_routes.py
"""JD-driven tailoring endpoints. Mounted under /api/resume.

The user_id is always taken from the verified JWT, never the request body —
so one user can never tailor from another user's base profile.
"""
import json

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse

from schemas.tailoring import TailorFromJDInput, TailoredResumeOutput
from services.anti_hallucination import HallucinationError
from services.tailoring_service import BaseProfileMissing, tailor_from_jd
from services.tailoring_stream import tailor_events
from utils.auth import get_current_user_id

router = APIRouter()


@router.post("/tailor-from-jd", response_model=TailoredResumeOutput)
async def tailor_from_jd_route(
    data: TailorFromJDInput,
    user_id: str = Depends(get_current_user_id),
) -> TailoredResumeOutput:
    """Tailor the caller's base profile to a job description."""
    verified = data.model_copy(update={"user_id": user_id})
    try:
        return tailor_from_jd(verified)
    except BaseProfileMissing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "code": "BASE_PROFILE_MISSING",
                "message": "Create a base profile before tailoring.",
            },
        )
    except HallucinationError as exc:
        # Strict retry still produced fabricated entries — surface them.
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail={
                "code": "FABRICATED_CONTENT",
                "message": "Tailoring produced fabricated entries after a retry.",
                "errors": [e.model_dump() for e in exc.errors],
            },
        )
    except RuntimeError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(exc)
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY, detail=str(exc)
        )


@router.post("/tailor-from-jd/stream")
async def tailor_from_jd_stream(
    data: TailorFromJDInput,
    user_id: str = Depends(get_current_user_id),
) -> StreamingResponse:
    """Progressive tailoring as an NDJSON stream.

    Emits `jd_analyzed`, then one `section` event per resume section, then
    `done` — or a single `error` event. Validation runs in full before any
    section is emitted, so fabricated content is never streamed.
    """
    verified = data.model_copy(update={"user_id": user_id})

    def ndjson():
        for event in tailor_events(verified):
            yield json.dumps(event) + "\n"

    return StreamingResponse(ndjson(), media_type="application/x-ndjson")
