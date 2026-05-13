// Mirrors backend/schemas/skeleton.py. Keep in sync.
import { z } from "zod";

export const checklistSourceSchema = z.enum([
  "jd_must_have",
  "jd_nice_to_have",
  "user_added",
]);
export const slotCoverageStatusSchema = z.enum([
  "uncovered",
  "mentioned",
  "demonstrated",
]);

export const skeletonInputSchema = z.object({
  user_id: z.string().optional(),
  job_description: z.string().min(10),
  job_url: z.string().optional(),
  target_seniority: z.string().optional(),
});

export const bulletPromptSchema = z.object({
  prompt: z.string().min(1),
  related_skills: z.array(z.string()).default([]),
});

export const experienceSlotSchema = z.object({
  slot_id: z.string().min(1),
  suggested_count_reason: z.string().optional(),
  company: z.string().default("[Company name]"),
  title: z.string().default("[Most recent role]"),
  dates: z.string().default("[Start date – End date]"),
  location: z.string().default("[City, Country or Remote]"),
  bullet_prompts: z.array(bulletPromptSchema).default([]),
  tech_stack_suggestions: z.array(z.string()).default([]),
});

export const projectSlotSchema = z.object({
  slot_id: z.string().min(1),
  name: z.string().default("[Project name]"),
  role: z.string().default("[Your role]"),
  bullet_prompts: z.array(bulletPromptSchema).default([]),
  tech_stack_suggestions: z.array(z.string()).default([]),
});

export const skillsChecklistItemSchema = z.object({
  name: z.string().min(1),
  source: checklistSourceSchema,
  checked: z.boolean().default(false),
  suggested_section: z.string().optional(),
});

export const coverageMapEntrySchema = z.object({
  status: slotCoverageStatusSchema.default("uncovered"),
  covered_by: z.string().nullable().optional(),
  where: z.string().nullable().optional(),
});

export const resumeSkeletonSchema = z.object({
  suggested_sections: z.array(z.string()).default([]),
  experience_slots: z.array(experienceSlotSchema).default([]),
  projects_slots: z.array(projectSlotSchema).default([]),
  skills_checklist: z.array(skillsChecklistItemSchema).default([]),
  coverage_map: z.record(z.string(), coverageMapEntrySchema).default({}),
  inferred_seniority: z.string().nullable().optional(),
});

export type SkeletonInput = z.infer<typeof skeletonInputSchema>;
export type BulletPrompt = z.infer<typeof bulletPromptSchema>;
export type ExperienceSlot = z.infer<typeof experienceSlotSchema>;
export type ProjectSlot = z.infer<typeof projectSlotSchema>;
export type SkillsChecklistItem = z.infer<typeof skillsChecklistItemSchema>;
export type CoverageMapEntry = z.infer<typeof coverageMapEntrySchema>;
export type ResumeSkeleton = z.infer<typeof resumeSkeletonSchema>;
