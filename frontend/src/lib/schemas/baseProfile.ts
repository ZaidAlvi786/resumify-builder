// Mirrors backend/schemas/base_profile.py. Keep in sync.
import { z } from "zod";

export const ymOrIsoDate = z
  .string()
  .regex(
    /^(\d{4}|\d{4}-\d{2}|\d{4}-\d{2}-\d{2})$/,
    "Expected YYYY, YYYY-MM, or YYYY-MM-DD",
  );

export const personalInfoSchema = z.object({
  full_name: z.string().min(1, "Full name is required"),
  email: z.string().email(),
  phone: z.string().optional(),
  location: z.string().optional(),
  headline: z.string().optional(),
  summary: z.string().optional(),
});

export const linkSchema = z.object({
  label: z.string().min(1),
  url: z.string().min(1),
});

export const experienceSchema = z.object({
  company: z.string().min(1, "Company is required"),
  title: z.string().min(1, "Title is required"),
  location: z.string().optional(),
  start_date: ymOrIsoDate,
  end_date: ymOrIsoDate.nullable().optional(),
  is_current: z.boolean(),
  bullets: z.array(z.string()),
  tech_stack: z.array(z.string()),
});

export const educationSchema = z.object({
  school: z.string().min(1, "School is required"),
  degree: z.string().min(1, "Degree is required"),
  field_of_study: z.string().optional(),
  location: z.string().optional(),
  start_date: ymOrIsoDate.optional(),
  end_date: ymOrIsoDate.optional(),
  is_current: z.boolean(),
  gpa: z.string().optional(),
  notes: z.string().optional(),
});

export const skillItemSchema = z.object({
  name: z.string().min(1),
  category: z.string().optional(),
  level: z.string().optional(),
  years: z.number().int().min(0).max(80).optional(),
});

export const projectSchema = z.object({
  name: z.string().min(1),
  role: z.string().optional(),
  description: z.string().optional(),
  bullets: z.array(z.string()),
  tech_stack: z.array(z.string()),
  url: z.string().optional(),
  start_date: ymOrIsoDate.optional(),
  end_date: ymOrIsoDate.optional(),
});

export const certificationSchema = z.object({
  name: z.string().min(1),
  issuer: z.string().optional(),
  issued_date: ymOrIsoDate.optional(),
  expiration_date: ymOrIsoDate.optional(),
  credential_id: z.string().optional(),
  url: z.string().optional(),
});

export const languageSchema = z.object({
  name: z.string().min(1),
  proficiency: z.string().optional(),
});

export const baseProfileSchema = z.object({
  personal: personalInfoSchema,
  links: z.array(linkSchema),
  experience: z.array(experienceSchema),
  education: z.array(educationSchema),
  skills: z.array(skillItemSchema),
  projects: z.array(projectSchema),
  certifications: z.array(certificationSchema),
  languages: z.array(languageSchema),
});

export const baseProfilePatchSchema = z.object({
  personal: personalInfoSchema.optional(),
  links: z.array(linkSchema).optional(),
  experience: z.array(experienceSchema).optional(),
  education: z.array(educationSchema).optional(),
  skills: z.array(skillItemSchema).optional(),
  projects: z.array(projectSchema).optional(),
  certifications: z.array(certificationSchema).optional(),
  languages: z.array(languageSchema).optional(),
});

export type PersonalInfo = z.infer<typeof personalInfoSchema>;
export type Link = z.infer<typeof linkSchema>;
export type Experience = z.infer<typeof experienceSchema>;
export type Education = z.infer<typeof educationSchema>;
export type SkillItem = z.infer<typeof skillItemSchema>;
export type Project = z.infer<typeof projectSchema>;
export type Certification = z.infer<typeof certificationSchema>;
export type Language = z.infer<typeof languageSchema>;
export type BaseProfile = z.infer<typeof baseProfileSchema>;
export type BaseProfilePatch = z.infer<typeof baseProfilePatchSchema>;
