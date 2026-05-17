// src/components/Skeleton/CoverageSidebar.tsx
"use client";
import type { SkillsChecklistItem } from "@/lib/schemas/skeleton";
import type { CoverageStatus } from "@/lib/coverage";

interface Props {
  skills: SkillsChecklistItem[];
  coverage: Record<string, CoverageStatus>;
  checked: Record<string, boolean>;
  onToggle: (skillName: string) => void;
}

const STATUS: Record<CoverageStatus, { icon: string; label: string; cls: string }> = {
  uncovered: { icon: "⬜", label: "Not covered", cls: "text-slate-400" },
  mentioned: { icon: "🟡", label: "Mentioned", cls: "text-amber-600" },
  demonstrated: { icon: "✅", label: "Demonstrated", cls: "text-emerald-600" },
};

export default function CoverageSidebar({ skills, coverage, checked, onToggle }: Props) {
  const counts = skills.reduce(
    (acc, s) => {
      acc[coverage[s.name] ?? "uncovered"] += 1;
      return acc;
    },
    { uncovered: 0, mentioned: 0, demonstrated: 0 } as Record<CoverageStatus, number>,
  );
  const total = skills.length || 1;
  const pct = Math.round((counts.demonstrated / total) * 100);

  return (
    <aside className="w-full lg:w-72 shrink-0 space-y-4 lg:sticky lg:top-6 self-start">
      <div className="rounded-lg border border-slate-200 p-4">
        <h3 className="font-semibold text-sm">JD coverage</h3>
        <p className="mt-1 text-2xl font-bold">{pct}%</p>
        <p className="text-xs text-slate-500">
          {counts.demonstrated} demonstrated · {counts.mentioned} mentioned ·{" "}
          {counts.uncovered} not covered
        </p>
        <div className="mt-2 h-2 w-full rounded-full bg-slate-100">
          <div
            className="h-2 rounded-full bg-emerald-500 transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 p-4 space-y-2">
        <h3 className="font-semibold text-sm">Skills checklist</h3>
        <p className="text-xs text-slate-500">
          Tick a skill to claim it; write it into a bullet to demonstrate it.
        </p>
        <ul className="space-y-1.5">
          {skills.map((s) => {
            const status = coverage[s.name] ?? "uncovered";
            const meta = STATUS[status];
            return (
              <li key={s.name} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={!!checked[s.name]}
                  onChange={() => onToggle(s.name)}
                  aria-label={`Claim ${s.name}`}
                />
                <span className="flex-1 truncate" title={s.name}>
                  {s.name}
                </span>
                {s.source === "jd_must_have" && (
                  <span className="text-[10px] rounded bg-slate-900 text-white px-1">must</span>
                )}
                <span className={meta.cls} title={meta.label}>
                  {meta.icon}
                </span>
              </li>
            );
          })}
          {skills.length === 0 && (
            <li className="text-xs text-slate-400">No skills extracted from this JD.</li>
          )}
        </ul>
      </div>
    </aside>
  );
}
