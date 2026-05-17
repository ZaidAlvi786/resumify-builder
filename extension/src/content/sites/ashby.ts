// extension/src/content/sites/ashby.ts
import { cleanText, pickCompany, pickJdElement, pickText, type SiteExtraction } from "./shared";

const ROLE = [
  ".ashby-job-posting-heading",
  '[class*="_jobPostingHeader"] h1',
  "h1",
];
const COMPANY = [
  ".ashby-job-posting-organization-name",
  '[class*="_organizationName"]',
];
const JD = [
  ".ashby-job-posting-content",
  '[class*="_descriptionText"]',
  '[class*="_jobPostingDescription"]',
  ".ashby-job-posting-right-pane",
];

/** Extract a JD from an Ashby (jobs.ashbyhq.com) posting; null if absent. */
export function extract(doc: Document): SiteExtraction | null {
  const jdEl = pickJdElement(doc, JD);
  if (!jdEl) return null;
  return {
    company: pickCompany(doc, COMPANY),
    role: pickText(doc, ROLE),
    jd_text: cleanText(jdEl.textContent || ""),
    confidence: 0.88,
  };
}
