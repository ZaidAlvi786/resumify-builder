// extension/src/content/sites/lever.ts
import { cleanText, pickCompany, pickJdElement, pickText, type SiteExtraction } from "./shared";

const ROLE = [
  ".posting-headline h2",
  ".posting-header h2",
  ".posting-headline",
  "h2",
];
const COMPANY = [
  ".main-header-logo img",   // alt text resolved below
  ".posting-categories .location",
];
const JD = [
  '[data-qa="job-description"]',
  ".section-wrapper.page-full-width",
  ".content .section-wrapper",
  ".posting-page .content",
];

function leverCompany(doc: Document): string {
  const logoAlt = doc
    .querySelector(".main-header-logo img")
    ?.getAttribute("alt")
    ?.trim();
  return logoAlt || pickCompany(doc, COMPANY);
}

/** Extract a JD from a Lever (jobs.lever.co) posting; null if absent. */
export function extract(doc: Document): SiteExtraction | null {
  const jdEl = pickJdElement(doc, JD);
  if (!jdEl) return null;
  return {
    company: leverCompany(doc),
    role: pickText(doc, ROLE),
    jd_text: cleanText(jdEl.textContent || ""),
    confidence: 0.9,
  };
}
