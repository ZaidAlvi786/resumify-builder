// src/components/BaseProfile/BaseProfileForm.tsx
"use client";
import { useEffect, useMemo, useState } from "react";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  baseProfileSchema,
  type BaseProfile,
} from "@/lib/schemas/baseProfile";
import {
  getBaseProfile,
  putBaseProfile,
} from "@/services/baseProfileApi";
import PersonalSection from "./PersonalSection";
import LinksSection from "./LinksSection";
import ExperienceSection from "./ExperienceSection";
import EducationSection from "./EducationSection";
import SkillsSection from "./SkillsSection";
import ProjectsSection from "./ProjectsSection";
import CertificationsSection from "./CertificationsSection";
import LanguagesSection from "./LanguagesSection";
import { useAutosave } from "./useAutosave";

const EMPTY_PROFILE: BaseProfile = {
  personal: { full_name: "", email: "" },
  links: [],
  experience: [],
  education: [],
  skills: [],
  projects: [],
  certifications: [],
  languages: [],
};

function SaveBadge({ status }: { status: "idle" | "saving" | "saved" | "error" }) {
  const map = {
    idle: { text: "Up to date", cls: "text-slate-500" },
    saving: { text: "Saving…", cls: "text-blue-600" },
    saved: { text: "Saved", cls: "text-emerald-600" },
    error: { text: "Save failed", cls: "text-red-600" },
  } as const;
  return <span className={`text-xs font-medium ${map[status].cls}`}>{map[status].text}</span>;
}

/** Watches the whole form value and re-emits a new object reference only
 *  when the JSON payload actually changes — keeps autosave from firing
 *  on every keystroke that doesn't alter content. */
function WatchedForAutosave({ onChange }: { onChange: (v: BaseProfile) => void }) {
  const value = useWatch<BaseProfile>() as BaseProfile;
  const serialised = useMemo(() => JSON.stringify(value), [value]);
  useEffect(() => {
    onChange(value);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serialised]);
  return null;
}

export default function BaseProfileForm() {
  const [loaded, setLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [snapshot, setSnapshot] = useState<BaseProfile>(EMPTY_PROFILE);

  const form = useForm<BaseProfile>({
    resolver: zodResolver(baseProfileSchema),
    defaultValues: EMPTY_PROFILE,
    mode: "onBlur",
  });

  // Hydrate from server once on mount.
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const existing = await getBaseProfile();
        if (!active) return;
        if (existing) {
          form.reset(existing);
          setSnapshot(existing);
        }
      } catch (e) {
        if (!active) return;
        setLoadError(e instanceof Error ? e.message : String(e));
      } finally {
        if (active) setLoaded(true);
      }
    })();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { status, error, saveNow } = useAutosave<BaseProfile>({
    value: snapshot,
    onSave: async (v) => {
      const parsed = baseProfileSchema.safeParse(v);
      if (!parsed.success) {
        // Hold autosave until the form validates; surfaced inline below.
        throw new Error("Form has validation errors — fix them to resume saving.");
      }
      await putBaseProfile(parsed.data);
    },
    enabled: loaded,
  });

  return (
    <FormProvider {...form}>
      <form className="space-y-8" onSubmit={(e) => { e.preventDefault(); saveNow(); }}>
        <header className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <h1 className="text-2xl font-bold">Base profile</h1>
            <p className="text-sm text-slate-500">
              Your career source-of-truth. Tailored resumes and JD-driven tools read from this.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <SaveBadge status={status} />
            <button
              type="submit"
              className="px-3 py-1.5 rounded-md bg-slate-900 text-white text-sm hover:bg-slate-800"
            >
              Save now
            </button>
          </div>
        </header>

        {loadError && (
          <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
            Failed to load profile: {loadError}
          </div>
        )}
        {error && (
          <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
            {error}
          </div>
        )}

        <WatchedForAutosave onChange={setSnapshot} />
        <PersonalSection />
        <LinksSection />
        <ExperienceSection />
        <EducationSection />
        <SkillsSection />
        <ProjectsSection />
        <CertificationsSection />
        <LanguagesSection />
      </form>
    </FormProvider>
  );
}
