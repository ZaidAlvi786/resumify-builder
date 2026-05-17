// src/components/Skeleton/SkeletonWorkspace.tsx
"use client";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { generateSkeleton } from "@/services/skeletonApi";
import { getHandoff } from "@/services/extensionApi";
import type {
  ExperienceSlot,
  ProjectSlot,
  ResumeSkeleton,
} from "@/lib/schemas/skeleton";
import {
  computeCoverage,
  remainingPlaceholders,
  type WorkingSlot,
} from "@/lib/coverage";
import CoverageSidebar from "./CoverageSidebar";
import SlotCard from "./SlotCard";

const SENIORITIES = ["", "intern", "junior", "mid", "senior", "staff", "lead", "manager", "director"];

function expToWorking(s: ExperienceSlot): WorkingSlot {
  return {
    slot_id: s.slot_id,
    company: s.company,
    title: s.title,
    dates: s.dates,
    location: s.location,
    bullets: s.bullet_prompts.map((p) => ({ prompt: p.prompt, text: "" })),
    tech: [],
  };
}

function projToWorking(s: ProjectSlot): WorkingSlot {
  return {
    slot_id: s.slot_id,
    name: s.name,
    role: s.role,
    bullets: s.bullet_prompts.map((p) => ({ prompt: p.prompt, text: "" })),
    tech: [],
  };
}

export default function SkeletonWorkspace() {
  const [jd, setJd] = useState("");
  const [seniority, setSeniority] = useState("");
  const [loading, setLoading] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);

  const [skeleton, setSkeleton] = useState<ResumeSkeleton | null>(null);
  const [experience, setExperience] = useState<WorkingSlot[]>([]);
  const [projects, setProjects] = useState<WorkingSlot[]>([]);
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  const [promoteError, setPromoteError] = useState<string | null>(null);
  const [promoteOk, setPromoteOk] = useState(false);

  // Handoff prefill (?handoff=<id> set by the Chrome extension popup).
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("handoff");
    if (!id) return;
    getHandoff(id)
      .then((h) => h && setJd(h.job_description))
      .catch(() => undefined);
  }, []);

  const coverage = useMemo(() => {
    if (!skeleton) return {};
    const checkedSet = new Set(
      Object.entries(checked).filter(([, v]) => v).map(([k]) => k.toLowerCase()),
    );
    return computeCoverage(
      skeleton.skills_checklist.map((s) => s.name),
      experience,
      projects,
      checkedSet,
    );
  }, [skeleton, experience, projects, checked]);

  async function handleGenerate() {
    setLoading(true);
    setGenError(null);
    setPromoteOk(false);
    try {
      const result = await generateSkeleton({
        job_description: jd,
        target_seniority: seniority || undefined,
      });
      setSkeleton(result);
      setExperience(result.experience_slots.map(expToWorking));
      setProjects(result.projects_slots.map(projToWorking));
      setChecked({});
    } catch (e) {
      setGenError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  async function handlePromote() {
    setPromoteError(null);
    setPromoteOk(false);
    const leftover = remainingPlaceholders(experience, projects);
    if (leftover.length > 0) {
      setPromoteError(
        `Fill in ${leftover.length} placeholder field(s) first:\n` +
          leftover.slice(0, 6).join("\n"),
      );
      return;
    }
    const { data } = await supabase.auth.getUser();
    if (!data.user) {
      setPromoteError("You must be signed in to save a resume.");
      return;
    }
    const content = {
      source: "skeleton",
      experience: experience.map((s) => ({
        company: s.company,
        title: s.title,
        dates: s.dates,
        location: s.location,
        bullets: s.bullets.map((b) => b.text).filter(Boolean),
        tech_stack: s.tech,
      })),
      projects: projects.map((s) => ({
        name: s.name,
        role: s.role,
        bullets: s.bullets.map((b) => b.text).filter(Boolean),
        tech_stack: s.tech,
      })),
      skills: Object.entries(checked).filter(([, v]) => v).map(([k]) => k),
    };
    const { error } = await supabase
      .from("resumes")
      .insert({ user_id: data.user.id, title: "Resume from JD skeleton", content });
    if (error) {
      setPromoteError(`Failed to save: ${error.message}`);
      return;
    }
    setPromoteOk(true);
  }

  if (!skeleton) {
    return (
      <div className="mx-auto max-w-2xl space-y-4">
        <div>
          <h1 className="text-2xl font-bold">Resume skeleton from a job description</h1>
          <p className="text-sm text-slate-500">
            Paste a JD and get a structured starting point — prompts, not invented history.
          </p>
        </div>
        <textarea
          className="w-full rounded-md border border-slate-200 p-3 text-sm"
          rows={12}
          placeholder="Paste the full job description here…"
          value={jd}
          onChange={(e) => setJd(e.target.value)}
        />
        <div className="flex items-center gap-3">
          <select
            className="h-10 rounded-md border border-slate-200 px-3 text-sm"
            value={seniority}
            onChange={(e) => setSeniority(e.target.value)}
          >
            {SENIORITIES.map((s) => (
              <option key={s} value={s}>
                {s ? s : "Seniority (auto-detect)"}
              </option>
            ))}
          </select>
          <button
            type="button"
            disabled={loading || jd.trim().length < 10}
            onClick={handleGenerate}
            className="px-4 py-2 rounded-md bg-slate-900 text-white text-sm disabled:opacity-50"
          >
            {loading ? "Generating…" : "Generate skeleton"}
          </button>
        </div>
        {genError && (
          <p className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {genError}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold">Fill in your skeleton</h1>
          <p className="text-sm text-slate-500">
            Inferred seniority: <strong>{skeleton.inferred_seniority}</strong>. Replace every
            [placeholder] with real content.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setSkeleton(null)}
          className="text-sm text-slate-500 hover:underline"
        >
          ← New JD
        </button>
      </header>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 space-y-6">
          <section className="space-y-3">
            <h2 className="text-lg font-semibold">Experience</h2>
            {experience.map((slot, i) => (
              <SlotCard
                key={slot.slot_id}
                slot={slot}
                kind="experience"
                index={i}
                onChange={(next) =>
                  setExperience((prev) => prev.map((s, j) => (j === i ? next : s)))
                }
              />
            ))}
          </section>
          <section className="space-y-3">
            <h2 className="text-lg font-semibold">Projects</h2>
            {projects.map((slot, i) => (
              <SlotCard
                key={slot.slot_id}
                slot={slot}
                kind="project"
                index={i}
                onChange={(next) =>
                  setProjects((prev) => prev.map((s, j) => (j === i ? next : s)))
                }
              />
            ))}
          </section>

          <div className="space-y-2">
            <button
              type="button"
              onClick={handlePromote}
              className="px-4 py-2 rounded-md bg-emerald-600 text-white text-sm hover:bg-emerald-700"
            >
              Promote to resume
            </button>
            {promoteError && (
              <pre className="whitespace-pre-wrap rounded-md border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                {promoteError}
              </pre>
            )}
            {promoteOk && (
              <p className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
                Saved to your resumes.
              </p>
            )}
          </div>
        </div>

        <CoverageSidebar
          skills={skeleton.skills_checklist}
          coverage={coverage}
          checked={checked}
          onToggle={(name) => setChecked((prev) => ({ ...prev, [name]: !prev[name] }))}
        />
      </div>
    </div>
  );
}
