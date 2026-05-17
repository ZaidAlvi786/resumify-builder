# Resumify — JD Capture (Chrome Extension)

Manifest V3 extension that captures a job description from any job board and
hands it to the Resumify web app for tailoring, skeleton generation, or
quick saving.

## Build

```bash
cd extension
npm install
npm run build      # tsc --noEmit + vite build  -> dist/
```

Then load `extension/dist/` via `chrome://extensions` → "Load unpacked".

## Development

```bash
npm run dev        # vite dev server with HMR
npm run typecheck  # tsc --noEmit
npm run test       # vitest (extractor fixture tests — added in Step 10)
```

## How it works

1. The web app, at login, writes a short-lived signed cookie (`resumify_ext`)
   on the Resumify origin (`syncExtensionCookie` in the frontend).
2. The content script ([src/content/extract.ts](src/content/extract.ts))
   reads — never mutates — the current page and extracts a JD.
3. The popup ([src/popup/Popup.tsx](src/popup/Popup.tsx)) shows the detected
   company / role / preview and three actions.
4. The background worker ([src/background.ts](src/background.ts)) calls the
   backend with an HMAC-signed request ([src/lib/api.ts](src/lib/api.ts)),
   then opens `…/tailor?handoff=<id>` or `…/skeleton?handoff=<id>`.

## Security

- `host_permissions` is limited to the Resumify origin (cookie reading only).
- The content script only matches `<all_urls>` to *read* the DOM — no
  `scripting`, no `tabs`, no DOM mutation, no auto-submit.
- Every backend request is HMAC-signed; the backend rejects stale timestamps
  (>60s) and replayed nonces.

## Configuration

Set the production origins in [src/lib/config.ts](src/lib/config.ts) and the
matching `host_permissions` in [manifest.json](manifest.json) before a
production build.

## Status

Step 9 ships the scaffold + auth handshake + handoff flow with a generic
JD extractor. Step 10 adds the per-site extractors (`src/content/sites/`)
and their vitest fixture tests.
