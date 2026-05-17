// src/components/Tailor/TailorWorkspace.tsx
"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { getBaseProfile } from "@/services/baseProfileApi";
import { streamTailor, type TailorEvent, type TailorRequest } from "@/services/tailoringApi";
import { getHandoff } from "@/services/extensionApi";
import { exportToPDF } from "@/lib/exportResume";
import type { ResumeData } from "@/services/api";
import type { BaseProfile } from "@/lib/schemas/baseProfile";
import JdPane, { type JdInitial } from "./JdPane";
import ResultPane from "./ResultPane";

type SaveState = "idle" | "saving" | "saved" | "error";
type ReqMeta = Omit<TailorRequest, "user_id">;

export default function TailorWorkspace() {
  const router = useRouter();
  const [baseProfile, setBaseProfile] = useState<BaseProfile | null>(null);
  const [profileMissing, setProfileMissing] = useState(false);

  const [streaming, setStreaming] = useState(false);
  const [sections, setSections] = useState<Record<string, unknown>>({});
  const [matchScore, setMatchScore] = useState<number | null>(null);
  const [matchedKeywords, setMatchedKeywords] = useState<string[]>([]);
  const [error, setError] = useState<{ code: string; message: string } | null>(null);
  const [lastReq, setLastReq] = useState<ReqMeta | null>(null);

  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [saveError, setSaveError] = useState<string | null>(null);

  // Handoff prefill (?handoff=<id> set by the Chrome extension popup).
  const [jdInitial, setJdInitial] = useState<JdInitial | undefined>(undefined);
  const [handoffChecked, setHandoffChecked] = useState(false);

  useEffect(() => {
    let active = true;
    getBaseProfile()
      .then((p) => active && (p ? setBaseProfile(p) : setProfileMissing(true)))
      .catch(() => active && setProfileMissing(true));
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("handoff");
    if (!id) {
      setHandoffChecked(true);
      return;
    }
    getHandoff(id)
      .then((h) => {
        if (h) {
          setJdInitial({
            jd: h.job_description,
            company: h.company ?? "",
            role: h.role ?? "",
            jobUrl: h.job_url ?? "",
          });
        }
      })
      .catch(() => undefined)
      .finally(() => setHandoffChecked(true));
  }, []);

  async function runTailor(req: ReqMeta) {
    setStreaming(true);
    setSections({});
    setMatchScore(null);
    setMatchedKeywords([]);
    setError(null);
    setSaveState("idle");
    setLastReq(req);
    try {
      for await (const ev of streamTailor({ user_id: "self", ...req })) {
        applyEvent(ev);
      }
    } catch (e) {
      setError({ code: "NETWORK", message: e instanceof Error ? e.message : String(e) });
    } finally {
      setStreaming(false);
    }
  }

  function applyEvent(ev: TailorEvent) {
    if (ev.event === "section") {
      setSections((prev) => ({ ...prev, [ev.section]: ev.data }));
    } else if (ev.event === "done") {
      setMatchScore(ev.match_score);
      setMatchedKeywords(ev.matched_keywords);
    } else if (ev.event === "error") {
      setError({ code: ev.code, message: ev.message });
      if (ev.code === "BASE_PROFILE_MISSING") setProfileMissing(true);
    }
  }

  async function handleSave() {
    setSaveState("saving");
    setSaveError(null);
    try {
      const { data } = await supabase.auth.getUser();
      if (!data.user) throw new Error("Not signed in");
      const title = `${lastReq?.role || "Role"} — ${lastReq?.company || "Company"}`;
      const content = {
        source: "tailored",
        ...sections,
        match_score: matchScore,
        matched_keywords: matchedKeywords,
      };
      const { error: dbError } = await supabase
        .from("resumes")
        .insert({ user_id: data.user.id, title, content });
      if (dbError) throw new Error(dbError.message);
      setSaveState("saved");
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : String(e));
      setSaveState("error");
    }
  }

  function handleLogApplication() {
    const params = new URLSearchParams();
    if (lastReq?.company) params.set("company", lastReq.company);
    if (lastReq?.role) params.set("role", lastReq.role);
    if (lastReq?.job_url) params.set("job_url", lastReq.job_url);
    router.push(`/applications?${params.toString()}`);
  }

  async function handleExportPdf() {
    // Reuses the existing exporter; it only reads `full_name` and the
    // #resume-content element rendered inside ResultPane.
    const name = baseProfile?.personal.full_name || "Resume";
    await exportToPDF({ full_name: name } as unknown as ResumeData);
  }

  return (
    <div className="space-y-5">
      <header className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-bold">Tailor to a job description</h1>
        <p className="text-sm text-slate-500">
          Your base profile, reordered and rephrased for one specific JD. Never fabricated.
        </p>
      </header>

      {profileMissing && (
        <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          You need a base profile first.{" "}
          <Link href="/base-profile" className="font-semibold underline">
            Create your base profile →
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {handoffChecked && (
          <JdPane
            key={jdInitial ? "handoff" : "blank"}
            streaming={streaming}
            onTailor={runTailor}
            initial={jdInitial}
          />
        )}
        <ResultPane
          sections={sections}
          matchScore={matchScore}
          matchedKeywords={matchedKeywords}
          baseProfile={baseProfile}
          streaming={streaming}
          error={error}
          saveState={saveState}
          saveError={saveError}
          onSave={handleSave}
          onLogApplication={handleLogApplication}
          onExportPdf={handleExportPdf}
        />
      </div>
    </div>
  );
}
