// src/components/Tailor/ResultPane.tsx
"use client";
import type { BaseProfile, Experience } from "@/lib/schemas/baseProfile";
import type { GapItem, TailoredExperience } from "@/lib/schemas/tailoring";
import MatchScoreRing from "./MatchScoreRing";
import DiffEntry from "./DiffEntry";

type SaveState = "idle" | "saving" | "saved" | "error";

interface Props {
  sections: Record<string, unknown>;
  matchScore: number | null;
  matchedKeywords: string[];
  baseProfile: BaseProfile | null;
  streaming: boolean;
  error: { code: string; message: string } | null;
  saveState: SaveState;
  saveError: string | null;
  onSave: () => void;
  onLogApplication: () => void;
  onExportPdf: () => void;
}

function matchBase(entry: TailoredExperience, base: BaseProfile | null): Experience | undefined {
  if (!base) return undefined;
  const norm = (s: string) => s.trim().toLowerCase();
  return base.experience.find(
    (e) => norm(e.company) === norm(entry.company) && norm(e.title) === norm(entry.title),
  );
}

const SEVERITY_CLS: Record<string, string> = {
  critical: "border-red-200 bg-red-50 text-red-700",
  important: "border-amber-200 bg-amber-50 text-amber-800",
  nice: "border-slate-200 bg-slate-50 text-slate-600",
};

export default function ResultPane(props: Props) {
  const { sections, matchScore, matchedKeywords, baseProfile, streaming, error } = props;

  if (error) {
    return (
      <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        <p className="font-semibold">Tailoring failed ({error.code})</p>
        <p>{error.message}</p>
      </div>
    );
  }

  const summary = typeof sections.summary === "string" ? sections.summary : null;
  const experience = (sections.experience as TailoredExperience[] | undefined) ?? [];
  const skills = (sections.skills as string[] | undefined) ?? [];
  const gaps = (sections.gaps as GapItem[] | undefined) ?? [];
  const hasResult = Object.keys(sections).length > 0;

  if (!hasResult && !streaming) {
    return (
      <p className="text-sm text-slate-400">
        Paste a job description and tailor your resume to see the result here.
      </p>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-4 border-b border-slate-200 pb-4">
        <MatchScoreRing score={matchScore} />
        <div className="min-w-0">
          <h2 className="font-semibold">Tailored result</h2>
          <div className="mt-1 flex flex-wrap gap-1">
            {matchedKeywords.slice(0, 16).map((k) => (
              <span key={k} className="text-[11px] rounded-full bg-emerald-100 text-emerald-800 px-2 py-0.5">
                {k}
              </span>
            ))}
            {streaming && <span className="text-xs text-slate-400">streaming…</span>}
          </div>
        </div>
      </div>

      {gaps.length > 0 && (
        <section className="space-y-2">
          <h3 className="font-semibold text-sm">Gaps to close</h3>
          {gaps.map((g, i) => (
            <div key={i} className={`rounded-md border p-2 text-xs ${SEVERITY_CLS[g.severity] ?? SEVERITY_CLS.nice}`}>
              <p className="font-medium">
                {g.requirement} <span className="opacity-70">· {g.severity}</span>
              </p>
              {g.suggested_learning_path && (
                <p className="mt-0.5">
                  {g.suggested_learning_path.duration && <>~{g.suggested_learning_path.duration}: </>}
                  {(g.suggested_learning_path.resources ?? []).map((r, j) => (
                    <span key={j}>
                      {r.url ? (
                        <a className="underline" href={r.url} target="_blank" rel="noreferrer">
                          {r.title}
                        </a>
                      ) : (
                        r.title
                      )}
                      {j < (g.suggested_learning_path?.resources?.length ?? 0) - 1 ? ", " : ""}
                    </span>
                  ))}
                </p>
              )}
            </div>
          ))}
        </section>
      )}

      {/* #resume-content is the element the existing exportToPDF helper targets */}
      <div id="resume-content" className="space-y-5">
        {summary && (
          <section>
            <h3 className="font-semibold text-sm">Summary</h3>
            <p className="text-sm text-slate-700">{summary}</p>
          </section>
        )}

        {experience.length > 0 && (
          <section className="space-y-2">
            <h3 className="font-semibold text-sm">Experience</h3>
            {experience.map((e, i) => (
              <DiffEntry
                key={i}
                entry={e}
                baseEntry={matchBase(e, baseProfile)}
                keywords={matchedKeywords}
              />
            ))}
          </section>
        )}

        {skills.length > 0 && (
          <section>
            <h3 className="font-semibold text-sm">Skills (JD-ordered)</h3>
            <p className="text-sm text-slate-700">{skills.join(" · ")}</p>
          </section>
        )}
      </div>

      {matchScore !== null && (
        <div className="flex flex-wrap items-center gap-2 border-t border-slate-200 pt-4">
          <button
            type="button"
            onClick={props.onSave}
            disabled={props.saveState === "saving"}
            className="px-3 py-1.5 rounded-md bg-slate-900 text-white text-sm disabled:opacity-50"
          >
            {props.saveState === "saved" ? "Saved ✓" : "Save as resume version"}
          </button>
          <button
            type="button"
            onClick={props.onLogApplication}
            className="px-3 py-1.5 rounded-md border border-slate-300 text-sm"
          >
            Log application
          </button>
          <button
            type="button"
            onClick={props.onExportPdf}
            className="px-3 py-1.5 rounded-md border border-slate-300 text-sm"
          >
            Export PDF
          </button>
          {props.saveError && <span className="text-xs text-red-600">{props.saveError}</span>}
        </div>
      )}
    </div>
  );
}
