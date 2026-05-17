// extension/src/content/sites/generic.ts
//
// Fallback extractor: scores DOM blocks by job-description keyword density
// and picks the highest-scoring contiguous block.
import { cleanText, ogSiteName, type SiteExtraction } from "./shared";

const JD_SIGNALS = [
  "responsibilities", "requirements", "qualifications", "about the role",
  "you will", "we're looking for", "what you'll do", "who you are",
  "minimum qualifications", "preferred qualifications", "what we offer",
];

/** How strongly a block of text reads as a job description. */
export function scoreBlock(text: string): number {
  const lower = text.toLowerCase();
  let score = 0;
  for (const signal of JD_SIGNALS) {
    if (lower.includes(signal)) score += 1;
  }
  if (text.length > 600) score += 1;
  if (text.length > 2000) score += 1;
  return score;
}

function firstSegment(value: string): string {
  return (value.split(/[|–—·-]/)[0] ?? "").trim();
}

function lastSegment(value: string): string {
  const parts = value.split(/[|–—·-]/);
  return parts.length > 1 ? (parts[parts.length - 1] ?? "").trim() : "";
}

export function extractGeneric(doc: Document): SiteExtraction | null {
  const candidates = Array.from(
    doc.querySelectorAll("article, main, section, div"),
  );
  let bestText = "";
  let bestScore = 0;
  for (const el of candidates) {
    const text = (el.textContent || "").trim();
    if (text.length < 300 || text.length > 20000) continue;
    const score = scoreBlock(text);
    if (score > bestScore) {
      bestScore = score;
      bestText = text;
    }
  }
  if (bestText.length < 300) return null;

  const h1 = doc.querySelector("h1")?.textContent?.trim();
  const title = doc.title || "";
  return {
    company: ogSiteName(doc) || lastSegment(title),
    role: h1 || firstSegment(title),
    jd_text: cleanText(bestText),
    confidence: Math.min(1, bestScore / 6),
  };
}
