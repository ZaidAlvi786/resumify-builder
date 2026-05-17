// src/lib/coverage.ts
//
// Client-side JD-skill coverage matcher for the skeleton workspace.
// Pure functions — no React, no network — so the coverage sidebar can
// recompute live on every keystroke. The server recomputes
// authoritatively on save.

export type CoverageStatus = "uncovered" | "mentioned" | "demonstrated";

export interface WorkingBullet {
  prompt: string;
  text: string;
}

/** A working (editable) copy of a skeleton experience/project slot. */
export interface WorkingSlot {
  slot_id: string;
  // experience fields
  company?: string;
  title?: string;
  dates?: string;
  location?: string;
  // project fields
  name?: string;
  role?: string;
  // shared
  bullets: WorkingBullet[];
  tech: string[];
}

const BRACKET_RE = /\[[^\]]+\]/;

/** True if a value still contains an unfilled [bracketed placeholder]. */
export function hasPlaceholder(value: string | undefined | null): boolean {
  return !!value && BRACKET_RE.test(value);
}

/** Word-ish containment: case-insensitive, ignores surrounding punctuation. */
function mentions(haystack: string, skill: string): boolean {
  const needle = skill.trim().toLowerCase();
  if (!needle) return false;
  return haystack.toLowerCase().includes(needle);
}

/**
 * Compute coverage for every JD skill against the user's working slots.
 *  - demonstrated: the skill appears in a bullet's text or a slot's tech list
 *  - mentioned:    the skill is ticked in the skills checklist but not shown in a bullet
 *  - uncovered:    neither
 */
export function computeCoverage(
  skills: string[],
  experience: WorkingSlot[],
  projects: WorkingSlot[],
  checkedSkills: Set<string>,
): Record<string, CoverageStatus> {
  const slots = [...experience, ...projects];
  const bulletText = slots
    .flatMap((s) => s.bullets.map((b) => b.text))
    .join("\n");
  const techText = slots.flatMap((s) => s.tech).join("\n");

  const result: Record<string, CoverageStatus> = {};
  for (const skill of skills) {
    if (mentions(bulletText, skill) || mentions(techText, skill)) {
      result[skill] = "demonstrated";
    } else if (checkedSkills.has(skill.toLowerCase())) {
      result[skill] = "mentioned";
    } else {
      result[skill] = "uncovered";
    }
  }
  return result;
}

/** Collect every placeholder still present across the working slots. */
export function remainingPlaceholders(
  experience: WorkingSlot[],
  projects: WorkingSlot[],
): string[] {
  const hits: string[] = [];
  const check = (label: string, value?: string) => {
    if (hasPlaceholder(value)) hits.push(`${label}: ${value}`);
  };
  experience.forEach((s, i) => {
    check(`Experience ${i + 1} company`, s.company);
    check(`Experience ${i + 1} title`, s.title);
    check(`Experience ${i + 1} dates`, s.dates);
    check(`Experience ${i + 1} location`, s.location);
    s.bullets.forEach((b, j) => check(`Experience ${i + 1} bullet ${j + 1}`, b.text));
  });
  projects.forEach((s, i) => {
    check(`Project ${i + 1} name`, s.name);
    check(`Project ${i + 1} role`, s.role);
    s.bullets.forEach((b, j) => check(`Project ${i + 1} bullet ${j + 1}`, b.text));
  });
  return hits;
}
