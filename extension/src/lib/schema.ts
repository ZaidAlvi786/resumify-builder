// extension/src/lib/schema.ts
//
// Zod schemas for every message crossing a trust boundary: content script
// <-> popup <-> background, and the auth cookie written by the web app.
import { z } from "zod";

/** A job description extracted from the current page. */
export const extractedJdSchema = z.object({
  company: z.string(),
  role: z.string(),
  jd_text: z.string(),
  job_url: z.string(),
  confidence: z.number(),
});
export type ExtractedJd = z.infer<typeof extractedJdSchema>;

export const handoffKindSchema = z.enum(["tailor", "skeleton", "save"]);
export type HandoffKind = z.infer<typeof handoffKindSchema>;

/** popup -> content script: "extract the JD on this page". */
export const queryMessageSchema = z.object({
  type: z.literal("RESUMIFY_QUERY"),
});

/** content script -> popup: extraction result. */
export const extractResultSchema = z.object({
  type: z.literal("RESUMIFY_EXTRACT_RESULT"),
  jd: extractedJdSchema.nullable(),
});

/** popup -> background: the user picked an action. */
export const actionMessageSchema = z.object({
  type: z.literal("RESUMIFY_ACTION"),
  kind: handoffKindSchema,
  jd: extractedJdSchema,
});
export type ActionMessage = z.infer<typeof actionMessageSchema>;

/** background -> popup: outcome of an action. */
export const actionResultSchema = z.object({
  ok: z.boolean(),
  url: z.string().optional(),
  error: z.string().optional(),
});
export type ActionResult = z.infer<typeof actionResultSchema>;

/** The `resumify_ext` cookie payload the web app writes at login. */
export const cookiePayloadSchema = z.object({
  token: z.string(),
  hmac_secret: z.string(),
});
export type CookiePayload = z.infer<typeof cookiePayloadSchema>;
