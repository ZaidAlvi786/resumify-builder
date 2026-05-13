// Mirrors backend/schemas/integrations.py. Keep in sync.
import { z } from "zod";

export const handoffKindSchema = z.enum(["tailor", "skeleton", "save"]);

export const extensionHandoffRequestSchema = z.object({
  kind: handoffKindSchema,
  job_description: z.string().min(1),
  job_url: z.string().optional(),
  company: z.string().optional(),
  role: z.string().optional(),
});

export const extensionHandoffSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  kind: handoffKindSchema,
  job_description: z.string(),
  job_url: z.string().nullable().optional(),
  company: z.string().nullable().optional(),
  role: z.string().nullable().optional(),
  expires_at: z.string().datetime(),
  used_at: z.string().datetime().nullable().optional(),
  created_at: z.string().datetime(),
});

export const extensionHandoffCreatedResponseSchema = z.object({
  handoff_id: z.string(),
  expires_at: z.string().datetime(),
});

export const googleConnectStartSchema = z.object({
  user_id: z.string().min(1),
  return_url: z.string().min(1),
});

export const googleConnectStartResponseSchema = z.object({
  oauth_url: z.string(),
  state: z.string(),
  expires_at: z.string().datetime(),
});

export const googleIntegrationSchema = z.object({
  user_id: z.string(),
  spreadsheet_id: z.string(),
  scopes: z.array(z.string()),
  connected_at: z.string().datetime(),
});

export const googleDisconnectRequestSchema = z.object({
  user_id: z.string().min(1),
});

export type HandoffKind = z.infer<typeof handoffKindSchema>;
export type ExtensionHandoffRequest = z.infer<typeof extensionHandoffRequestSchema>;
export type ExtensionHandoff = z.infer<typeof extensionHandoffSchema>;
export type ExtensionHandoffCreatedResponse = z.infer<
  typeof extensionHandoffCreatedResponseSchema
>;
export type GoogleConnectStart = z.infer<typeof googleConnectStartSchema>;
export type GoogleConnectStartResponse = z.infer<typeof googleConnectStartResponseSchema>;
export type GoogleIntegration = z.infer<typeof googleIntegrationSchema>;
export type GoogleDisconnectRequest = z.infer<typeof googleDisconnectRequestSchema>;
