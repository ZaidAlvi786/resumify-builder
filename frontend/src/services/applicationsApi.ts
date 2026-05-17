// src/services/applicationsApi.ts
//
// CRUD + XLSX wrappers for /api/applications. JWT from the Supabase session.

import { supabase } from "@/lib/supabase";
import {
  applicationListResponseSchema,
  applicationSchema,
  type Application,
  type ApplicationBase,
  type ApplicationListResponse,
  type ApplicationStatus,
  type ApplicationUpdate,
} from "@/lib/schemas/applications";

function getApiRoot(): string {
  const raw = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/resume";
  return raw.replace(/\/api\/[^/]+\/?$/, "");
}

const BASE = `${getApiRoot()}/api/applications`;

async function authHeader(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error("Not signed in");
  return { Authorization: `Bearer ${token}` };
}

async function readError(res: Response): Promise<string> {
  try {
    const body = await res.json();
    if (typeof body?.detail === "string") return body.detail;
    return JSON.stringify(body?.detail ?? body);
  } catch {
    return `${res.status} ${res.statusText}`;
  }
}

export interface ListParams {
  status?: ApplicationStatus;
  category?: string;
  page?: number;
  page_size?: number;
}

export async function listApplications(params: ListParams = {}): Promise<ApplicationListResponse> {
  const qs = new URLSearchParams();
  if (params.status) qs.set("status", params.status);
  if (params.category) qs.set("category", params.category);
  qs.set("page", String(params.page ?? 1));
  qs.set("page_size", String(params.page_size ?? 25));
  const res = await fetch(`${BASE}/?${qs.toString()}`, { headers: await authHeader() });
  if (!res.ok) throw new Error(await readError(res));
  return applicationListResponseSchema.parse(await res.json());
}

export async function createApplication(data: ApplicationBase): Promise<Application> {
  const res = await fetch(`${BASE}/`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(await authHeader()) },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await readError(res));
  return applicationSchema.parse(await res.json());
}

export async function updateApplication(
  id: string,
  patch: ApplicationUpdate,
): Promise<Application> {
  const res = await fetch(`${BASE}/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...(await authHeader()) },
    body: JSON.stringify(patch),
  });
  if (!res.ok) throw new Error(await readError(res));
  return applicationSchema.parse(await res.json());
}

export async function deleteApplication(id: string): Promise<void> {
  const res = await fetch(`${BASE}/${id}`, {
    method: "DELETE",
    headers: await authHeader(),
  });
  if (!res.ok && res.status !== 204) throw new Error(await readError(res));
}

/** Fetch the XLSX export and trigger a browser download. */
export async function downloadApplicationsXlsx(): Promise<void> {
  const res = await fetch(`${BASE}/export.xlsx`, { headers: await authHeader() });
  if (!res.ok) throw new Error(await readError(res));
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "applications.xlsx";
  a.click();
  URL.revokeObjectURL(url);
}
