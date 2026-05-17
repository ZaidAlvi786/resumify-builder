// extension/src/content/sites/greenhouse.ts
import { cleanText, pickCompany, pickJdElement, pickText, type SiteExtraction } from "./shared";

const ROLE = [
  ".app-title",
  ".job__title h1",
  ".job-post h1",
  "h1.section-header",
  "h1",
];
const COMPANY = [
  ".company-name",
  ".company-name span",
  '[itemprop="hiringOrganization"]',
];
const JD = [
  "#content",
  ".job__description",
  ".job-post__content",
  ".job-post div.body",
  ".body",
];

/** Extract a JD from a Greenhouse job board page; null if absent. */
export function extract(doc: Document): SiteExtraction | null {
  const jdEl = pickJdElement(doc, JD);
  if (!jdEl) return null;
  return {
    company: pickCompany(doc, COMPANY),
    role: pickText(doc, ROLE),
    jd_text: cleanText(jdEl.textContent || ""),
    confidence: 0.92,
  };
}
