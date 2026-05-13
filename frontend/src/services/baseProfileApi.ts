// src/services/baseProfileApi.ts
//
// Fetch wrappers for /api/base-profile. JWT is read from the active
// Supabase session; never trust the user_id from client state on the
// server — the backend re-derives it from the JWT.

import { supabase } from "@/lib/supabase";
import {
  baseProfileSchema,
  baseProfilePatchSchema,
  type BaseProfile,
  type BaseProfilePatch,
} from "@/lib/schemas/baseProfile";

function getApiRoot(): string {
  // NEXT_PUBLIC_API_URL is set to ".../api/resume" in the rest of the app.
  // Strip the trailing /api/<group> so we can route to other groups too.
  const raw = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/resume";
  return raw.replace(/\/api\/[^/]+\/?$/, "");
}

const BASE = `${getApiRoot()}/api/base-profile`;

async function authHeader(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) {
    throw new Error("Not signed in");
  }
  return { Authorization: `Bearer ${token}` };
}

async function readError(res: Response): Promise<string> {
  try {
    const body = await res.json();
    if (typeof body?.detail === "string") return body.detail;
    if (body?.detail?.message) return String(body.detail.message);
    return JSON.stringify(body);
  } catch {
    return `${res.status} ${res.statusText}`;
  }
}

export class BaseProfileMissingError extends Error {
  constructor() {
    super("BASE_PROFILE_MISSING");
    this.name = "BaseProfileMissingError";
  }
}

/** Returns null when the user has no base profile yet (HTTP 404). */
export async function getBaseProfile(): Promise<BaseProfile | null> {
  const res = await fetch(`${BASE}/`, { headers: await authHeader() });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(await readError(res));
  return baseProfileSchema.parse(await res.json());
}

export async function putBaseProfile(profile: BaseProfile): Promise<BaseProfile> {
  const body = baseProfileSchema.parse(profile);
  const res = await fetch(`${BASE}/`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...(await authHeader()) },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await readError(res));
  return baseProfileSchema.parse(await res.json());
}

export async function patchBaseProfile(patch: BaseProfilePatch): Promise<BaseProfile> {
  const body = baseProfilePatchSchema.parse(patch);
  const res = await fetch(`${BASE}/`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...(await authHeader()) },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await readError(res));
  return baseProfileSchema.parse(await res.json());
}
