// extension/src/background.ts
//
// MV3 service worker. Receives an action from the popup, calls the backend
// (HMAC-signed), and opens the relevant Resumify page.
import { signedPost } from "./lib/api";
import { RESUMIFY_ORIGIN } from "./lib/config";
import {
  actionMessageSchema,
  type ActionResult,
  type ExtractedJd,
  type HandoffKind,
} from "./lib/schema";

async function handleAction(kind: HandoffKind, jd: ExtractedJd): Promise<ActionResult> {
  if (kind === "save") {
    await signedPost("/api/extension/save-application", {
      company: jd.company || "Unknown company",
      role: jd.role || "Unknown role",
      status: "saved",
      job_url: jd.job_url || undefined,
      notes: jd.jd_text.slice(0, 1000),
    });
    return { ok: true };
  }

  const result = await signedPost<{ handoff_id: string }>("/api/extension/handoff", {
    kind,
    job_description: jd.jd_text,
    job_url: jd.job_url || undefined,
    company: jd.company || undefined,
    role: jd.role || undefined,
  });
  const page = kind === "tailor" ? "tailor" : "skeleton";
  const url = `${RESUMIFY_ORIGIN}/${page}?handoff=${encodeURIComponent(result.handoff_id)}`;
  await chrome.tabs.create({ url });
  return { ok: true, url };
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  const parsed = actionMessageSchema.safeParse(message);
  if (!parsed.success) {
    return false; // not ours — let other listeners handle it
  }
  handleAction(parsed.data.kind, parsed.data.jd)
    .then(sendResponse)
    .catch((err: unknown) =>
      sendResponse({
        ok: false,
        error: err instanceof Error ? err.message : String(err),
      } satisfies ActionResult),
    );
  return true; // keep the message channel open for the async response
});
