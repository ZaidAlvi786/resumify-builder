// extension/src/content/sites/workday.ts
import { cleanText, pickCompany, pickJdElement, pickText, type SiteExtraction } from "./shared";

const ROLE = [
  '[data-automation-id="jobPostingHeader"]',
  '[data-automation-id="jobTitle"]',
  "h1",
];
const COMPANY = [
  '[data-automation-id="company"]',
  '[data-automation-id="jobPostingCompany"]',
];
const JD = [
  '[data-automation-id="jobPostingDescription"]',
  '[data-automation-id="job-posting-details"]',
];

/** Extract a JD from a Workday (*.myworkdayjobs.com) posting; null if absent. */
export function extract(doc: Document): SiteExtraction | null {
  const jdEl = pickJdElement(doc, JD);
  if (!jdEl) return null;
  return {
    company: pickCompany(doc, COMPANY),
    role: pickText(doc, ROLE),
    jd_text: cleanText(jdEl.textContent || ""),
    confidence: 0.9,
  };
}
