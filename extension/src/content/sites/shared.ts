// extension/src/content/sites/shared.ts
//
// Shared helpers for the per-site extractors.
import type { ExtractedJd } from "../../lib/schema";

/** What a site/generic extractor returns; the content script adds job_url. */
export type SiteExtraction = Omit<ExtractedJd, "job_url">;

/** Minimum text length for something to count as a JD body. */
export const MIN_JD_LENGTH = 200;

/** Collapse whitespace runs and trim. */
export function cleanText(raw: string): string {
  return raw.replace(/\s+/g, " ").trim();
}

/** First non-empty trimmed textContent among the selectors, else "". */
export function pickText(doc: Document, selectors: string[]): string {
  for (const sel of selectors) {
    const text = doc.querySelector(sel)?.textContent?.trim();
    if (text) return text;
  }
  return "";
}

/** First element with enough text to be a JD body, else null. */
export function pickJdElement(doc: Document, selectors: string[]): Element | null {
  for (const sel of selectors) {
    const el = doc.querySelector(sel);
    if (el && (el.textContent || "").trim().length >= MIN_JD_LENGTH) {
      return el;
    }
  }
  return null;
}

/** The og:site_name meta — a near-universal company fallback. */
export function ogSiteName(doc: Document): string {
  return (
    doc
      .querySelector('meta[property="og:site_name"]')
      ?.getAttribute("content")
      ?.trim() || ""
  );
}

/** Company from site selectors, falling back to og:site_name. */
export function pickCompany(doc: Document, selectors: string[]): string {
  return pickText(doc, selectors) || ogSiteName(doc);
}
