// src/services/integrationsApi.ts
//
// Google Sheets integration: start OAuth, read status, disconnect.

import { supabase } from "@/lib/supabase";
import {
  googleConnectStartResponseSchema,
  googleIntegrationSchema,
  type GoogleConnectStartResponse,
  type GoogleIntegration,
} from "@/lib/schemas/integrations";

function getApiRoot(): string {
  const raw = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/resume";
  return raw.replace(/\/api\/[^/]+\/?$/, "");
}

const BASE = `${getApiRoot()}/api/integrations`;

async function authHeader(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error("Not signed in");
  return { Authorization: `Bearer ${token}` };
}

/** Begin the OAuth flow; returns the consent-screen URL to navigate to. */
export async function startGoogleConnect(returnUrl: string): Promise<GoogleConnectStartResponse> {
  const qs = new URLSearchParams({ return_url: returnUrl });
  const res = await fetch(`${BASE}/google/start?${qs.toString()}`, {
    headers: await authHeader(),
  });
  if (!res.ok) throw new Error(`Failed to start Google connect: ${res.status}`);
  return googleConnectStartResponseSchema.parse(await res.json());
}

/** Current integration, or null when the user has not connected a sheet. */
export async function getGoogleIntegration(): Promise<GoogleIntegration | null> {
  const res = await fetch(`${BASE}/google`, { headers: await authHeader() });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Failed to read integration: ${res.status}`);
  return googleIntegrationSchema.parse(await res.json());
}

export async function disconnectGoogle(): Promise<void> {
  const res = await fetch(`${BASE}/google/disconnect`, {
    method: "POST",
    headers: await authHeader(),
  });
  if (!res.ok) throw new Error(`Failed to disconnect: ${res.status}`);
}

/** Public URL of a spreadsheet, for the "Open in Sheets" link. */
export function spreadsheetUrl(spreadsheetId: string): string {
  return `https://docs.google.com/spreadsheets/d/${spreadsheetId}`;
}
