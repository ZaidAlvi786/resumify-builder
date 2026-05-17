// extension/src/lib/api.ts
//
// HMAC-signed POSTs to the Resumify backend. The canonical string and the
// signing scheme mirror backend/services/extension_auth.py exactly:
//   signature = HMAC-SHA256(hmac_secret, "METHOD\npath\ntimestamp\nnonce\nbody")
import { BACKEND_ORIGIN } from "./config";
import { getAuth } from "./auth";

async function hmacSha256Hex(secret: string, message: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(message));
  return [...new Uint8Array(sig)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function randomNonce(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");
}

/** POST a JSON body to the backend with a fresh HMAC signature. */
export async function signedPost<T>(path: string, body: unknown): Promise<T> {
  const auth = await getAuth();
  if (!auth) throw new Error("Not signed in to Resumify — open the web app first.");

  const bodyStr = JSON.stringify(body);
  const timestamp = Math.floor(Date.now() / 1000);
  const nonce = randomNonce();
  const canonical = ["POST", path, String(timestamp), nonce, bodyStr].join("\n");
  const signature = await hmacSha256Hex(auth.hmac_secret, canonical);

  const res = await fetch(`${BACKEND_ORIGIN}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Resumify-Token": auth.token,
      "X-Resumify-Timestamp": String(timestamp),
      "X-Resumify-Nonce": nonce,
      "X-Resumify-Signature": signature,
    },
    body: bodyStr,
  });
  if (!res.ok) {
    throw new Error(`Resumify request failed (${res.status})`);
  }
  return res.json() as Promise<T>;
}
