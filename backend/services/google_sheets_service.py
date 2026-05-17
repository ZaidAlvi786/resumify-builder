# backend/services/google_sheets_service.py
"""Google Sheets API v4 — create the tracker sheet and upsert rows.

Raw HTTP via httpx with exponential backoff on 429/5xx. Row upsert is
idempotent, keyed by the Application ID in the last column.
"""
import time

import httpx

from schemas.applications import Application

SHEET_API = "https://sheets.googleapis.com/v4/spreadsheets"
SPREADSHEET_TITLE = "Resumify — Job Applications"
TAB_TITLE = "Applications"

# 9 columns, A..I. Column I (index 8) holds the Application ID key.
HEADERS = [
    "Date Added", "Company", "Role", "Category", "Status",
    "JD URL", "Resume Link", "Notes", "Application ID",
]
_ID_COLUMN = "I"
_ROW_RANGE = "A{row}:I{row}"

_MAX_RETRIES = 3
_RETRYABLE = {429, 500, 502, 503, 504}


def _request(method: str, url: str, token: str, **kwargs) -> httpx.Response:
    """HTTP call with exponential backoff on rate limits / 5xx."""
    headers = {"Authorization": f"Bearer {token}", **kwargs.pop("headers", {})}
    last_exc: Exception | None = None
    for attempt in range(_MAX_RETRIES):
        try:
            resp = httpx.request(method, url, headers=headers, timeout=30.0, **kwargs)
        except httpx.HTTPError as exc:  # network failure
            last_exc = exc
        else:
            if resp.status_code not in _RETRYABLE:
                resp.raise_for_status()
                return resp
            last_exc = httpx.HTTPStatusError(
                f"retryable {resp.status_code}", request=resp.request, response=resp
            )
        if attempt < _MAX_RETRIES - 1:
            time.sleep(2 ** attempt)  # 1s, 2s
    raise RuntimeError(f"Google Sheets request failed after retries: {last_exc}")


def sheet_row(app: Application) -> list:
    """One spreadsheet row for an application, in HEADERS order."""
    return [
        app.created_at.isoformat() if app.created_at else "",
        app.company,
        app.role,
        app.job_category or "",
        app.status,
        app.job_url or "",
        app.resume_id or "",
        app.notes or "",
        app.id,
    ]


def create_applications_sheet(access_token: str) -> str:
    """Create the tracker spreadsheet with a header row. Returns its id."""
    resp = _request(
        "POST",
        SHEET_API,
        access_token,
        json={
            "properties": {"title": SPREADSHEET_TITLE},
            "sheets": [{"properties": {"title": TAB_TITLE}}],
        },
    )
    spreadsheet_id = resp.json()["spreadsheetId"]
    _request(
        "PUT",
        f"{SHEET_API}/{spreadsheet_id}/values/{TAB_TITLE}!A1:I1",
        access_token,
        params={"valueInputOption": "RAW"},
        json={"values": [HEADERS]},
    )
    return spreadsheet_id


def _find_row_number(access_token: str, spreadsheet_id: str, application_id: str) -> int | None:
    """1-based row number of an application id, or None if absent."""
    resp = _request(
        "GET",
        f"{SHEET_API}/{spreadsheet_id}/values/{TAB_TITLE}!{_ID_COLUMN}:{_ID_COLUMN}",
        access_token,
    )
    values = resp.json().get("values", [])
    for idx, cell in enumerate(values):
        if cell and cell[0] == application_id:
            return idx + 1  # sheet rows are 1-based
    return None


def upsert_row(access_token: str, spreadsheet_id: str, app: Application) -> None:
    """Insert or update the row for one application, keyed by Application ID."""
    row = sheet_row(app)
    existing = _find_row_number(access_token, spreadsheet_id, app.id)
    if existing is not None:
        _request(
            "PUT",
            f"{SHEET_API}/{spreadsheet_id}/values/"
            f"{TAB_TITLE}!{_ROW_RANGE.format(row=existing)}",
            access_token,
            params={"valueInputOption": "RAW"},
            json={"values": [row]},
        )
    else:
        _request(
            "POST",
            f"{SHEET_API}/{spreadsheet_id}/values/{TAB_TITLE}!A:I:append",
            access_token,
            params={"valueInputOption": "RAW", "insertDataOption": "INSERT_ROWS"},
            json={"values": [row]},
        )
