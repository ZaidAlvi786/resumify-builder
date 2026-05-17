// extension/src/content/sites/linkedin.ts
import { cleanText, pickCompany, pickJdElement, pickText, type SiteExtraction } from "./shared";

const ROLE = [
  ".top-card-layout__title",
  ".job-details-jobs-unified-top-card__job-title",
  ".jobs-unified-top-card__job-title",
  "h1",
];
const COMPANY = [
  ".topcard__org-name-link",
  ".job-details-jobs-unified-top-card__company-name",
  ".jobs-unified-top-card__company-name",
  ".topcard__flavor",
];
const JD = [
  ".description__text",
  ".jobs-description__content",
  ".jobs-box__html-content",
  "#job-details",
];

/** Extract a JD from a LinkedIn job page; null if the structure is absent. */
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
