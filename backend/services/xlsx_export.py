# backend/services/xlsx_export.py
"""Build an .xlsx workbook from a list of applications.

Pure function — no DB, no network — so it is trivially testable and the
same column layout is reused by the Google Sheets sync (Step 8).
"""
from io import BytesIO
from typing import List

from openpyxl import Workbook

from schemas.applications import Application

# Column order shared with the Google Sheets integration.
HEADERS = [
    "Date Added",
    "Company",
    "Role",
    "Category",
    "Status",
    "Applied At",
    "Job URL",
    "Resume ID",
    "Notes",
    "Application ID",
]


def _iso(value) -> str:
    return value.isoformat() if value is not None else ""


def application_row(app: Application) -> list:
    """One spreadsheet row for an application, in HEADERS order."""
    return [
        _iso(app.created_at),
        app.company,
        app.role,
        app.job_category or "",
        app.status,
        _iso(app.applied_at),
        app.job_url or "",
        app.resume_id or "",
        app.notes or "",
        app.id,
    ]


def build_applications_xlsx(applications: List[Application]) -> bytes:
    """Serialise applications to an .xlsx byte string."""
    workbook = Workbook()
    sheet = workbook.active
    sheet.title = "Applications"
    sheet.append(HEADERS)
    for app in applications:
        sheet.append(application_row(app))
    buffer = BytesIO()
    workbook.save(buffer)
    return buffer.getvalue()
