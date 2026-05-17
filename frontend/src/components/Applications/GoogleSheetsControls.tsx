// src/components/Applications/GoogleSheetsControls.tsx
"use client";
import { useEffect, useState } from "react";
import {
  disconnectGoogle,
  getGoogleIntegration,
  spreadsheetUrl,
  startGoogleConnect,
} from "@/services/integrationsApi";
import type { GoogleIntegration } from "@/lib/schemas/integrations";

/** Connect / Open-in-Sheets / Disconnect controls for the Google integration.
 *  Self-contained: reads its own status on mount. After the OAuth callback
 *  redirects back to /applications, this remounts and shows the connected
 *  state automatically. */
export default function GoogleSheetsControls() {
  const [integration, setIntegration] = useState<GoogleIntegration | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getGoogleIntegration()
      .then(setIntegration)
      .catch(() => undefined)
      .finally(() => setLoaded(true));
  }, []);

  async function connect() {
    setBusy(true);
    setError(null);
    try {
      const { oauth_url } = await startGoogleConnect(
        `${window.location.origin}/applications`,
      );
      window.location.href = oauth_url;
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setBusy(false);
    }
  }

  async function disconnect() {
    setBusy(true);
    setError(null);
    try {
      await disconnectGoogle();
      setIntegration(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  if (!loaded) {
    return <span className="text-xs text-slate-400">…</span>;
  }

  if (integration) {
    return (
      <div className="flex items-center gap-2">
        <a
          href={spreadsheetUrl(integration.spreadsheet_id)}
          target="_blank"
          rel="noreferrer"
          className="px-3 py-1.5 rounded-md border border-emerald-300 text-sm text-emerald-700"
        >
          Open in Sheets
        </a>
        <button
          type="button"
          onClick={disconnect}
          disabled={busy}
          className="px-3 py-1.5 rounded-md border border-slate-300 text-sm text-slate-500 disabled:opacity-50"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={connect}
        disabled={busy}
        className="px-3 py-1.5 rounded-md border border-slate-300 text-sm disabled:opacity-50"
      >
        {busy ? "Connecting…" : "Connect Google Sheets"}
      </button>
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  );
}
