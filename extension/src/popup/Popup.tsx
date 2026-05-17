// extension/src/popup/Popup.tsx
//
// Popup UI: shows the detected JD and three actions. It queries the active
// tab's content script for the JD, then hands the chosen action to the
// background worker.
import { StrictMode, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  actionResultSchema,
  extractResultSchema,
  type ExtractedJd,
  type HandoffKind,
} from "../lib/schema";
import styles from "./Popup.module.css";

function Popup() {
  const [jd, setJd] = useState<ExtractedJd | null>(null);
  const [status, setStatus] = useState("Detecting job description…");
  const [busy, setBusy] = useState<HandoffKind | null>(null);

  useEffect(() => {
    (async () => {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab?.id) {
        setStatus("No active tab.");
        return;
      }
      try {
        const raw = await chrome.tabs.sendMessage(tab.id, { type: "RESUMIFY_QUERY" });
        const parsed = extractResultSchema.safeParse(raw);
        if (parsed.success && parsed.data.jd) {
          setJd(parsed.data.jd);
          setStatus("");
        } else {
          setStatus("No job description detected on this page.");
        }
      } catch {
        setStatus("Open a job posting, then click the Resumify icon.");
      }
    })();
  }, []);

  async function act(kind: HandoffKind) {
    if (!jd) return;
    setBusy(kind);
    setStatus("");
    try {
      const raw = await chrome.runtime.sendMessage({
        type: "RESUMIFY_ACTION",
        kind,
        jd,
      });
      const result = actionResultSchema.parse(raw);
      if (!result.ok) {
        setStatus(result.error || "Action failed.");
      } else {
        window.close();
      }
    } catch (e) {
      setStatus(e instanceof Error ? e.message : "Action failed.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className={styles.popup}>
      <h1 className={styles.title}>Resumify</h1>
      {jd ? (
        <>
          <div className={styles.meta}>
            <p className={styles.role}>{jd.role || "Unknown role"}</p>
            <p className={styles.company}>{jd.company || "Unknown company"}</p>
          </div>
          <p className={styles.preview}>{jd.jd_text.slice(0, 600)}…</p>
          <div className={styles.actions}>
            <button disabled={busy !== null} onClick={() => act("tailor")}>
              {busy === "tailor" ? "Working…" : "Tailor from my profile"}
            </button>
            <button disabled={busy !== null} onClick={() => act("skeleton")}>
              {busy === "skeleton" ? "Working…" : "Generate skeleton"}
            </button>
            <button disabled={busy !== null} onClick={() => act("save")}>
              {busy === "save" ? "Working…" : "Just save the JD"}
            </button>
          </div>
          {status && <p className={styles.error}>{status}</p>}
        </>
      ) : (
        <p className={styles.status}>{status}</p>
      )}
    </div>
  );
}

const container = document.getElementById("root");
if (container) {
  createRoot(container).render(
    <StrictMode>
      <Popup />
    </StrictMode>,
  );
}
