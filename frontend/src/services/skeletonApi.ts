// src/services/skeletonApi.ts
//
// Wrapper for POST /api/resume/skeleton-from-jd. No auth required — the
// skeleton generator works for users without a base profile.

import {
  resumeSkeletonSchema,
  skeletonInputSchema,
  type ResumeSkeleton,
  type SkeletonInput,
} from "@/lib/schemas/skeleton";

const RESUME_API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/resume";

async function readError(res: Response): Promise<string> {
  try {
    const body = await res.json();
    if (typeof body?.detail === "string") return body.detail;
    return JSON.stringify(body?.detail ?? body);
  } catch {
    return `${res.status} ${res.statusText}`;
  }
}

export async function generateSkeleton(input: SkeletonInput): Promise<ResumeSkeleton> {
  const body = skeletonInputSchema.parse(input);
  const res = await fetch(`${RESUME_API}/skeleton-from-jd`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await readError(res));
  return resumeSkeletonSchema.parse(await res.json());
}
