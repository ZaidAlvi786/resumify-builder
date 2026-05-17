// extension/src/content/sites/indeed.ts
import { cleanText, pickCompany, pickJdElement, pickText, type SiteExtraction } from "./shared";

const ROLE = [
  "h1.jobsearch-JobInfoHeader-title",
  ".jobsearch-JobInfoHeader-title",
  '[data-testid="jobsearch-JobInfoHeader-title"]',
  "h1",
];
const COMPANY = [
  '[data-testid="inlineHeader-companyName"]',
  '[data-company-name="true"]',
  ".jobsearch-CompanyInfoContainer a",
  ".jobsearch-InlineCompanyRating div",
];
const JD = [
  "#jobDescriptionText",
  ".jobsearch-JobComponent-description",
  ".jobsearch-BodyContainer #jobDescriptionText",
];

/** Extract a JD from an Indeed job page; null if the structure is absent. */
export function extract(doc: Document): SiteExtraction | null {
  const jdEl = pickJdElement(doc, JD);
  if (!jdEl) return null;
  return {
    company: pickCompany(doc, COMPANY),
    role: pickText(doc, ROLE),
    jd_text: cleanText(jdEl.textContent || ""),
    confidence: 0.95,
  };
}
