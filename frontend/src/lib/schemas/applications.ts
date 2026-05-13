// Mirrors backend/schemas/applications.py. Keep in sync.
import { z } from "zod";

export const applicationStatusSchema = z.enum([
  "saved",
  "applied",
  "interviewing",
  "offer",
  "rejected",
  "withdrawn",
]);

export const applicationBaseSchema = z.object({
  company: z.string().min(1),
  role: z.string().min(1),
  job_category: z.string().optional(),
  job_url: z.string().optional(),
  resume_id: z.string().optional(),
  status: applicationStatusSchema.default("saved"),
  applied_at: z.string().datetime().optional(),
  notes: z.string().optional(),
  jd_hash: z.string().optional(),
});

export const applicationCreateSchema = applicationBaseSchema.extend({
  user_id: z.string().min(1),
});

export const applicationUpdateSchema = z.object({
  company: z.string().optional(),
  role: z.string().optional(),
  job_category: z.string().optional(),
  job_url: z.string().optional(),
  resume_id: z.string().optional(),
  status: applicationStatusSchema.optional(),
  applied_at: z.string().datetime().optional(),
  notes: z.string().optional(),
  jd_hash: z.string().optional(),
});

export const applicationSchema = applicationBaseSchema.extend({
  id: z.string(),
  user_id: z.string(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  deleted_at: z.string().datetime().nullable().optional(),
});

export const applicationListResponseSchema = z.object({
  items: z.array(applicationSchema),
  page: z.number().int().min(1),
  page_size: z.number().int().min(1).max(200),
  total: z.number().int().min(0),
});

export const applicationListQuerySchema = z.object({
  status: applicationStatusSchema.optional(),
  category: z.string().optional(),
  page: z.number().int().min(1).default(1),
  page_size: z.number().int().min(1).max(200).default(25),
});

export type ApplicationStatus = z.infer<typeof applicationStatusSchema>;
export type ApplicationBase = z.infer<typeof applicationBaseSchema>;
export type ApplicationCreate = z.infer<typeof applicationCreateSchema>;
export type ApplicationUpdate = z.infer<typeof applicationUpdateSchema>;
export type Application = z.infer<typeof applicationSchema>;
export type ApplicationListResponse = z.infer<typeof applicationListResponseSchema>;
export type ApplicationListQuery = z.infer<typeof applicationListQuerySchema>;
