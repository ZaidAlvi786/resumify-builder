// src/services/extensionApi.ts
//
// Web-app side of the Chrome extension handshake:
//  - syncExtensionCookie(): mint the signed token at login, write the cookie
//    the extension reads via chrome.cookies.get.
//  - getHandoff(): consume a handoff (single-use) to prefill /tailor or /skeleton.

import { supabase } from "@/lib/supabase";

function getApiRoot(): string {
  const raw = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/resume";
  return raw.replace(/\/api\/[^/]+\/?$/, "");
}

const BASE = `${getApiRoot()}/api/extension`;
const COOKIE_NAME = "resumify_ext";

async function authHeader(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error("Not signed in");
  return { Authorization: `Bearer ${token}` };
}

interface IssuedToken {
  token: string;
  hmac_secret: string;
  expires_at: number;
}

export interface Handoff {
  id: string;
  kind: "tailor" | "skeleton" | "save";
  job_description: string;
  job_url?: string | null;
  company?: string | null;
  role?: string | null;
}

/**
 * Issue an extension token and write it to a cookie on the Resumify domain.
 * Called after login. The cookie is NOT httpOnly (it must be set from JS and
 * read by the extension); it is short-lived and same-site.
 */
export async function syncExtensionCookie(): Promise<void> {
  try {
    const res = await fetch(`${BASE}/issue-token`, {
      method: "POST",
      headers: await authHeader(),
    });
    if (!res.ok) return; // best-effort — never block the login flow
    const issued = (await res.json()) as IssuedToken;
    const value = encodeURIComponent(
      JSON.stringify({ token: issued.token, hmac_secret: issued.hmac_secret }),
    );
    const maxAge = Math.max(0, issued.expires_at - Math.floor(Date.now() / 1000));
    document.cookie = `${COOKIE_NAME}=${value}; path=/; max-age=${maxAge}; samesite=lax`;
  } catch {
    // Extension integration is optional; a failure here must not break login.
  }
}

/** Consume a handoff by id. Single-use — a second call 404s. */
export async function getHandoff(id: string): Promise<Handoff | null> {
  const res = await fetch(`${BASE}/handoff/${encodeURIComponent(id)}`, {
    headers: await authHeader(),
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Failed to load handoff: ${res.status}`);
  return (await res.json()) as Handoff;
}
