# backend/routes/applications_routes.py
"""Application-tracker CRUD + XLSX export. Mounted at /api/applications.

user_id always comes from the verified JWT. Google Sheets mirroring is
wired in Step 8 — the create/update/delete handlers are the hook points.
"""
from io import BytesIO
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import StreamingResponse

from schemas.applications import (
    Application,
    ApplicationBase,
    ApplicationListResponse,
    ApplicationUpdate,
)
from services import applications_service as svc
from services.sheets_mirror import mirror_application
from services.xlsx_export import build_applications_xlsx
from utils.auth import get_current_user_id

router = APIRouter()

_XLSX_MEDIA = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"


def _service_error(exc: Exception) -> HTTPException:
    if isinstance(exc, svc.ApplicationNotFound):
        return HTTPException(status.HTTP_404_NOT_FOUND, "Application not found")
    if isinstance(exc, ValueError):
        return HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, str(exc))
    if isinstance(exc, RuntimeError):
        return HTTPException(status.HTTP_503_SERVICE_UNAVAILABLE, str(exc))
    return HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR, str(exc))


@router.post("/", response_model=Application, status_code=status.HTTP_201_CREATED)
async def create_application(
    data: ApplicationBase,
    user_id: str = Depends(get_current_user_id),
) -> Application:
    try:
        created = svc.create(user_id, data)
    except Exception as exc:  # noqa: BLE001 - normalised below
        raise _service_error(exc)
    mirror_application(user_id, created)  # best-effort Google Sheets mirror
    return created


@router.get("/", response_model=ApplicationListResponse)
async def list_applications(
    user_id: str = Depends(get_current_user_id),
    status_filter: Optional[str] = Query(default=None, alias="status"),
    category: Optional[str] = Query(default=None),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=25, ge=1, le=200),
) -> ApplicationListResponse:
    try:
        items, total = svc.list_page(user_id, status_filter, category, page, page_size)
    except Exception as exc:  # noqa: BLE001
        raise _service_error(exc)
    return ApplicationListResponse(
        items=items, page=page, page_size=page_size, total=total
    )


@router.get("/export.xlsx")
async def export_applications_xlsx(
    user_id: str = Depends(get_current_user_id),
) -> StreamingResponse:
    try:
        apps = svc.list_all(user_id)
    except Exception as exc:  # noqa: BLE001
        raise _service_error(exc)
    content = build_applications_xlsx(apps)
    return StreamingResponse(
        BytesIO(content),
        media_type=_XLSX_MEDIA,
        headers={"Content-Disposition": 'attachment; filename="applications.xlsx"'},
    )


@router.patch("/{application_id}", response_model=Application)
async def update_application(
    application_id: str,
    data: ApplicationUpdate,
    user_id: str = Depends(get_current_user_id),
) -> Application:
    try:
        updated = svc.update(user_id, application_id, data)
    except Exception as exc:  # noqa: BLE001
        raise _service_error(exc)
    mirror_application(user_id, updated)  # best-effort Google Sheets mirror
    return updated


@router.delete("/{application_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_application(
    application_id: str,
    user_id: str = Depends(get_current_user_id),
) -> None:
    try:
        svc.soft_delete(user_id, application_id)
    except Exception as exc:  # noqa: BLE001
        raise _service_error(exc)
    return None
