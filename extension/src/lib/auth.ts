// extension/src/lib/auth.ts
//
// Reads the short-lived `resumify_ext` cookie the web app writes at login.
// Host permission is limited to the Resumify origin only.
import { COOKIE_NAME, RESUMIFY_ORIGIN } from "./config";
import { cookiePayloadSchema, type CookiePayload } from "./schema";

/** Return the auth payload, or null if the user is not signed in to Resumify. */
export async function getAuth(): Promise<CookiePayload | null> {
  const cookie = await chrome.cookies.get({
    url: RESUMIFY_ORIGIN,
    name: COOKIE_NAME,
  });
  if (!cookie?.value) return null;
  try {
    const parsed = JSON.parse(decodeURIComponent(cookie.value));
    return cookiePayloadSchema.parse(parsed);
  } catch {
    return null;
  }
}
