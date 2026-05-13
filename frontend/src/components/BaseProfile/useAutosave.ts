// src/components/BaseProfile/useAutosave.ts
//
// Watches a form value, debounces 800ms, and calls `onSave` with the
// latest snapshot. Optimistic — caller updates UI immediately; this
// hook just persists in the background and exposes save status.
import { useCallback, useEffect, useRef, useState } from "react";

export type SaveStatus = "idle" | "saving" | "saved" | "error";

interface Options<T> {
  value: T;
  onSave: (snapshot: T) => Promise<void>;
  delayMs?: number;
  /** When false the hook is inert — no debouncer, no saves. Useful while
   *  the initial profile is still loading. */
  enabled?: boolean;
}

export function useAutosave<T>({ value, onSave, delayMs = 800, enabled = true }: Options<T>) {
  const [status, setStatus] = useState<SaveStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestRef = useRef(value);
  const firstRunRef = useRef(true);

  latestRef.current = value;

  const flush = useCallback(async () => {
    setStatus("saving");
    setError(null);
    try {
      await onSave(latestRef.current);
      setStatus("saved");
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setStatus("error");
    }
  }, [onSave]);

  useEffect(() => {
    if (!enabled) return;
    // Skip the initial mount — don't autosave the just-loaded value.
    if (firstRunRef.current) {
      firstRunRef.current = false;
      return;
    }
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(flush, delayMs);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [value, enabled, delayMs, flush]);

  return { status, error, saveNow: flush };
}
