// extension/src/content/extract.ts
//
// Content script — reads the page only, never mutates it. Dispatches to a
// per-site extractor by hostname, falling back to the generic density
// extractor for everything else.
import { type ExtractedJd } from "../lib/schema";
import { extract as ashby } from "./sites/ashby";
import { extractGeneric } from "./sites/generic";
import { extract as greenhouse } from "./sites/greenhouse";
import { extract as indeed } from "./sites/indeed";
import { extract as linkedin } from "./sites/linkedin";
import { extract as lever } from "./sites/lever";
import { extract as workday } from "./sites/workday";
import { MIN_JD_LENGTH, type SiteExtraction } from "./sites/shared";

const SITES: Array<{
  pattern: RegExp;
  extract: (doc: Document) => SiteExtraction | null;
}> = [
  { pattern: /linkedin\.com/i, extract: linkedin },
  { pattern: /indeed\./i, extract: indeed },
  { pattern: /greenhouse\.io|boards\.greenhouse/i, extract: greenhouse },
  { pattern: /lever\.co/i, extract: lever },
  { pattern: /myworkdayjobs\.com/i, extract: workday },
  { pattern: /ashbyhq\.com/i, extract: ashby },
];

/**
 * Extract a job description from a document. Picks a site-specific
 * extractor by URL, falls back to the generic one. Returns null when no
 * confident JD is found.
 */
export function extractJd(doc: Document, url: string): ExtractedJd | null {
  let result: SiteExtraction | null = null;
  for (const site of SITES) {
    if (site.pattern.test(url)) {
      result = site.extract(doc);
      break;
    }
  }
  if (!result) {
    result = extractGeneric(doc);
  }
  if (!result || result.jd_text.length < MIN_JD_LENGTH) {
    return null;
  }
  return { ...result, job_url: url };
}

// Register the content-script listener only in the extension runtime —
// guarded so this module can be imported by vitest without `chrome`.
if (typeof chrome !== "undefined" && chrome.runtime?.onMessage) {
  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if ((message as { type?: string })?.type !== "RESUMIFY_QUERY") {
      return false;
    }
    sendResponse({
      type: "RESUMIFY_EXTRACT_RESULT",
      jd: extractJd(document, location.href),
    });
    return true;
  });
}
