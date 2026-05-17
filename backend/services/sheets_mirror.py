# backend/services/sheets_mirror.py
"""Best-effort mirroring of applications into a user's Google Sheet.

Called after a successful create/update. Any failure here is swallowed —
mirroring must never break the underlying CRUD operation.
"""
from schemas.applications import Application
from services import google_oauth, google_sheets_service, integrations_service
from services.token_crypto import decrypt


def mirror_application(user_id: str, app: Application) -> bool:
    """Upsert one application into the user's sheet, if they connected one.

    Returns True if the row was mirrored, False otherwise. Never raises.
    """
    try:
        integration = integrations_service.get_integration(user_id)
        if not integration:
            return False
        refresh_token = decrypt(integration["refresh_token_encrypted"])
        access_token = google_oauth.refresh_access_token(refresh_token)
        google_sheets_service.upsert_row(
            access_token, integration["spreadsheet_id"], app
        )
        return True
    except Exception:
        # Sheets is a convenience mirror; the DB remains the source of truth.
        return False
