// src/services/tailoringApi.ts
//
// Client for the tailoring stream and the PDF-extraction helper.

import { supabase } from "@/lib/supabase";
import type { JDAnalysis } from "@/lib/schemas/tailoring";

const RESUME_API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/resume";

/** NDJSON events emitted by POST /tailor-from-jd/stream. */
export type TailorEvent =
  | { event: "jd_analyzed"; data: JDAnalysis }
  | { event: "section"; section: string; data: unknown }
  | { event: "done"; match_score: number; matched_keywords: string[] }
  | { event: "error"; code: string; message: string; errors?: unknown[] };

export interface TailorRequest {
  user_id: string;
  job_description: string;
  job_url?: string;
  company?: string;
  role?: string;
}

async function authToken(): Promise<string> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error("Not signed in");
  return token;
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

/** Stream tailoring events. Yields each NDJSON event as it arrives. */
export async function* streamTailor(req: TailorRequest): AsyncGenerator<TailorEvent> {
  const token = await authToken();
  const res = await fetch(`${RESUME_API}/tailor-from-jd/stream`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(req),
  });
  if (!res.ok || !res.body) {
    throw new Error(await readError(res));
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed) yield JSON.parse(trimmed) as TailorEvent;
    }
  }
  const tail = buffer.trim();
  if (tail) yield JSON.parse(tail) as TailorEvent;
}

/** Extract plain text from an uploaded PDF via the existing /extract-text route. */
export async function extractPdfText(file: File): Promise<string> {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${RESUME_API}/extract-text`, { method: "POST", body: form });
  if (!res.ok) throw new Error(await readError(res));
  // The endpoint returns the raw string as a JSON-encoded value.
  return res.json();
}
