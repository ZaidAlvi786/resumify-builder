// src/components/Tailor/DiffEntry.tsx
"use client";
import { useState } from "react";
import type { Experience } from "@/lib/schemas/baseProfile";
import type { TailoredExperience } from "@/lib/schemas/tailoring";

/** Wrap JD-matched keywords in <mark>. The split keeps the matched
 *  delimiters, so each captured part is compared against the keyword set. */
function highlight(text: string, keywords: string[]): React.ReactNode {
  const escaped = keywords
    .filter(Boolean)
    .map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  if (escaped.length === 0) return text;
  const lower = new Set(keywords.map((k) => k.toLowerCase()));
  const parts = text.split(new RegExp(`(${escaped.join("|")})`, "gi"));
  return parts.map((part, i) =>
    lower.has(part.toLowerCase()) ? (
      <mark key={i} className="bg-emerald-100 rounded px-0.5">
        {part}
      </mark>
    ) : (
      <span key={i}>{part}</span>
    ),
  );
}

interface Props {
  entry: TailoredExperience;
  baseEntry: Experience | undefined;
  keywords: string[];
}

export default function DiffEntry({ entry, baseEntry, keywords }: Props) {
  const [showOriginal, setShowOriginal] = useState(false);

  return (
    <div className="rounded-lg border border-slate-200 p-4 space-y-2">
      <div className="flex items-baseline justify-between gap-2">
        <div>
          <p className="font-semibold">{entry.title}</p>
          <p className="text-sm text-slate-500">
            {entry.company}
            {entry.location ? ` · ${entry.location}` : ""}
          </p>
        </div>
        <span className="text-xs text-slate-400 shrink-0">
          {entry.start_date} – {entry.is_current ? "Present" : entry.end_date || "—"}
        </span>
      </div>

      <ul className="list-disc pl-5 space-y-1 text-sm">
        {entry.bullets.map((b, i) => (
          <li key={i}>{highlight(b, keywords)}</li>
        ))}
      </ul>

      {entry.tech_stack.length > 0 && (
        <p className="text-xs text-slate-500">
          Tech: {entry.tech_stack.join(", ")}
        </p>
      )}

      {baseEntry && (
        <div>
          <button
            type="button"
            onClick={() => setShowOriginal((v) => !v)}
            className="text-xs text-slate-500 underline"
          >
            {showOriginal ? "Hide original" : "Show original (before tailoring)"}
          </button>
          {showOriginal && (
            <ul className="mt-1 list-disc pl-5 space-y-1 text-sm text-slate-400">
              {baseEntry.bullets.length === 0 && <li>(no original bullets)</li>}
              {baseEntry.bullets.map((b, i) => (
                <li key={i}>{b}</li>
              ))}
            </ul>
          )}
        </div>
      )}
      {!baseEntry && (
        <p className="text-xs text-amber-600">
          No matching base-profile entry — review this carefully.
        </p>
      )}
    </div>
  );
}
