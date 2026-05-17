// extension/tests/extractors.test.ts
//
// Each extractor is exercised against a saved HTML fixture. Fixtures are
// hand-built minimal pages carrying the DOM structure each extractor
// targets — they test the extraction logic, not live-site HTML.
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, test } from "vitest";

import { extractJd } from "../src/content/extract";
import { extract as ashby } from "../src/content/sites/ashby";
import { extractGeneric } from "../src/content/sites/generic";
import { extract as greenhouse } from "../src/content/sites/greenhouse";
import { extract as indeed } from "../src/content/sites/indeed";
import { extract as linkedin } from "../src/content/sites/linkedin";
import { extract as lever } from "../src/content/sites/lever";
import type { SiteExtraction } from "../src/content/sites/shared";
import { extract as workday } from "../src/content/sites/workday";

const FIXTURES = join(dirname(fileURLToPath(import.meta.url)), "fixtures");

function load(name: string): Document {
  const html = readFileSync(join(FIXTURES, name), "utf-8");
  return new DOMParser().parseFromString(html, "text/html");
}

interface SiteCase {
  name: string;
  fixture: string;
  extract: (doc: Document) => SiteExtraction | null;
  url: string;
  role: string;
  company: string;
}

const SITE_CASES: SiteCase[] = [
  {
    name: "linkedin", fixture: "linkedin.html", extract: linkedin,
    url: "https://www.linkedin.com/jobs/view/123",
    role: "Senior Backend Engineer", company: "Acme Corp",
  },
  {
    name: "indeed", fixture: "indeed.html", extract: indeed,
    url: "https://www.indeed.com/viewjob?jk=abc",
    role: "Data Analyst", company: "Globex",
  },
  {
    name: "greenhouse", fixture: "greenhouse.html", extract: greenhouse,
    url: "https://boards.greenhouse.io/initech/jobs/1",
    role: "Product Designer", company: "Initech",
  },
  {
    name: "lever", fixture: "lever.html", extract: lever,
    url: "https://jobs.lever.co/umbrella/abc",
    role: "DevOps Engineer", company: "Umbrella",
  },
  {
    name: "workday", fixture: "workday.html", extract: workday,
    url: "https://stark.wd1.myworkdayjobs.com/job/123",
    role: "Frontend Engineer", company: "Stark Industries",
  },
  {
    name: "ashby", fixture: "ashby.html", extract: ashby,
    url: "https://jobs.ashbyhq.com/wayne/abc",
    role: "Machine Learning Engineer", company: "Wayne Enterprises",
  },
];

describe("site extractors", () => {
  for (const c of SITE_CASES) {
    test(`${c.name}: pulls role, company and JD from its fixture`, () => {
      const result = c.extract(load(c.fixture));
      expect(result).not.toBeNull();
      expect(result?.role).toBe(c.role);
      expect(result?.company).toBe(c.company);
      expect(result?.jd_text.toLowerCase()).toContain("responsibilities");
      expect(result?.jd_text.length).toBeGreaterThan(200);
      // cleanText must have collapsed the fixture's indentation whitespace.
      expect(result?.jd_text).not.toContain("\n");
    });

    test(`${c.name}: returns null on a page without its structure`, () => {
      expect(c.extract(load("empty.html"))).toBeNull();
    });
  }
});

describe("generic extractor", () => {
  for (const fixture of ["generic-1.html", "generic-2.html", "generic-3.html"]) {
    test(`${fixture}: finds the highest-density JD block`, () => {
      const result = extractGeneric(load(fixture));
      expect(result).not.toBeNull();
      expect(result?.jd_text.toLowerCase()).toContain("responsibilities");
      expect((result?.role.length ?? 0)).toBeGreaterThan(0);
    });
  }

  test("returns null when the page has no JD", () => {
    expect(extractGeneric(load("empty.html"))).toBeNull();
  });
});

describe("extractJd dispatcher", () => {
  test("routes to the site extractor matching the URL", () => {
    const result = extractJd(
      load("linkedin.html"),
      "https://www.linkedin.com/jobs/view/9",
    );
    expect(result?.role).toBe("Senior Backend Engineer");
    expect(result?.job_url).toBe("https://www.linkedin.com/jobs/view/9");
  });

  test("falls back to the generic extractor for unknown hosts", () => {
    const result = extractJd(load("generic-1.html"), "https://careers.hooli.com/9");
    expect(result?.role).toBe("Platform Engineer");
  });

  test("falls back to generic when a known host lacks site structure", () => {
    // A LinkedIn URL but a generic-shaped document: the site extractor
    // returns null and the dispatcher recovers via the generic extractor.
    const result = extractJd(load("generic-2.html"), "https://www.linkedin.com/x");
    expect(result).not.toBeNull();
    expect(result?.jd_text.toLowerCase()).toContain("responsibilities");
  });

  test("returns null when no JD is present anywhere", () => {
    expect(extractJd(load("empty.html"), "https://example.com")).toBeNull();
  });
});
