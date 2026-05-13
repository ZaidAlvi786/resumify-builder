// Mirrors backend/schemas/tailoring.py. Keep in sync.
import { z } from "zod";

export const PLACEHOLDER_RE = /^\[.+\]$/;

export const severitySchema = z.enum(["critical", "important", "nice"]);
export const senioritySchema = z.enum([
  "intern",
  "junior",
  "mid",
  "senior",
  "staff",
  "principal",
  "lead",
  "manager",
  "director",
]);

export const jdAnalysisSchema = z.object({
  company_hint: z.string().nullable().optional(),
  role_title: z.string().nullable().optional(),
  seniority: senioritySchema.nullable().optional(),
  must_have_skills: z.array(z.string()).default([]),
  nice_to_have_skills: z.array(z.string()).default([]),
  responsibilities: z.array(z.string()).default([]),
  years_experience_required: z.number().int().min(0).max(60).nullable().optional(),
  keywords: z.array(z.string()).default([]),
  domain_signals: z.array(z.string()).default([]),
  red_flags: z.array(z.string()).default([]),
});

export const tailorFromJDInputSchema = z.object({
  user_id: z.string().min(1),
  job_description: z.string().min(10),
  job_url: z.string().optional(),
  company: z.string().optional(),
  role: z.string().optional(),
});

export const learningResourceMiniSchema = z.object({
  title: z.string().min(1),
  url: z.string().optional(),
  type: z.string().optional(),
});

export const learningPathMiniSchema = z.object({
  duration: z.string().optional(),
  resources: z.array(learningResourceMiniSchema).default([]),
});

export const gapItemSchema = z.object({
  requirement: z.string().min(1),
  severity: severitySchema,
  suggested_learning_path: learningPathMiniSchema.optional(),
});

export const sectionRationaleSchema = z.object({
  section: z.string(),
  rationale: z.string(),
});

export const tailoredExperienceSchema = z.object({
  company: z.string().min(1),
  title: z.string().min(1),
  location: z.string().optional(),
  start_date: z.string().min(1),
  end_date: z.string().optional(),
  is_current: z.boolean().default(false),
  bullets: z.array(z.string()).default([]),
  tech_stack: z.array(z.string()).default([]),
  base_profile_ref: z.string().optional(),
});

export const tailoredProjectSchema = z.object({
  name: z.string().min(1),
  role: z.string().optional(),
  description: z.string().optional(),
  bullets: z.array(z.string()).default([]),
  tech_stack: z.array(z.string()).default([]),
  base_profile_ref: z.string().optional(),
});

export const tailoredResumeOutputSchema = z.object({
  match_score: z.number().int().min(0).max(100),
  matched_keywords: z.array(z.string()).default([]),
  gaps: z.array(gapItemSchema).default([]),
  rationale: z.array(sectionRationaleSchema).default([]),
  personal: z.record(z.string(), z.unknown()),
  summary: z.string().optional(),
  experience: z.array(tailoredExperienceSchema).default([]),
  education: z.array(z.record(z.string(), z.unknown())).default([]),
  skills: z.array(z.string()).default([]),
  projects: z.array(tailoredProjectSchema).default([]),
  certifications: z.array(z.record(z.string(), z.unknown())).default([]),
  languages: z.array(z.record(z.string(), z.unknown())).default([]),
});

export const isPlaceholder = (v: string | null | undefined): boolean =>
  !!v && PLACEHOLDER_RE.test(v.trim());

export type Severity = z.infer<typeof severitySchema>;
export type Seniority = z.infer<typeof senioritySchema>;
export type JDAnalysis = z.infer<typeof jdAnalysisSchema>;
export type TailorFromJDInput = z.infer<typeof tailorFromJDInputSchema>;
export type GapItem = z.infer<typeof gapItemSchema>;
export type SectionRationale = z.infer<typeof sectionRationaleSchema>;
export type TailoredExperience = z.infer<typeof tailoredExperienceSchema>;
export type TailoredProject = z.infer<typeof tailoredProjectSchema>;
export type TailoredResumeOutput = z.infer<typeof tailoredResumeOutputSchema>;
