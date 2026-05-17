# backend/routes/skeleton_routes.py
"""JD-aware skeleton endpoint. Mounted under /api/resume.

No authentication and no base profile required — the skeleton is for
users who don't have a profile yet. user_id in the body is optional and
used only for telemetry / future quota accounting.
"""
from fastapi import APIRouter, HTTPException, status

from schemas.skeleton import ResumeSkeleton, SkeletonInput
from services.skeleton_service import generate_skeleton

router = APIRouter()


@router.post("/skeleton-from-jd", response_model=ResumeSkeleton)
async def skeleton_from_jd(data: SkeletonInput) -> ResumeSkeleton:
    """Generate a resume skeleton from a job description.

    Every career field in the response is a bracketed placeholder; the
    skeleton never invents a company, title, or date.
    """
    try:
        return generate_skeleton(data)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(exc)
        )
    except HTTPException:
        raise
    except Exception as exc:  # upstream LLM / parsing failure
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Skeleton generation failed: {exc}",
        )
