// src/components/Tailor/JdPane.tsx
"use client";
import { useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { extractPdfText, type TailorRequest } from "@/services/tailoringApi";

export interface JdInitial {
  jd?: string;
  company?: string;
  role?: string;
  jobUrl?: string;
}

interface Props {
  streaming: boolean;
  onTailor: (req: Omit<TailorRequest, "user_id">) => void;
  initial?: JdInitial;
}

export default function JdPane({ streaming, onTailor, initial }: Props) {
  const [jd, setJd] = useState(initial?.jd ?? "");
  const [company, setCompany] = useState(initial?.company ?? "");
  const [role, setRole] = useState(initial?.role ?? "");
  const [jobUrl, setJobUrl] = useState(initial?.jobUrl ?? "");
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError(null);
    if (file.type !== "application/pdf") {
      setUploadError("Only PDF uploads are supported. Paste the text for other formats.");
      return;
    }
    try {
      setJd(await extractPdfText(file));
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : String(err));
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Job description</h2>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="text-xs text-slate-600 underline"
        >
          Upload PDF
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={handleFile}
        />
      </div>
      {uploadError && <p className="text-xs text-red-600">{uploadError}</p>}
      <textarea
        className="w-full rounded-md border border-slate-200 p-3 text-sm"
        rows={14}
        placeholder="Paste the full job description here…"
        value={jd}
        onChange={(e) => setJd(e.target.value)}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label>Company</Label>
          <Input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Acme" />
        </div>
        <div className="space-y-1">
          <Label>Role</Label>
          <Input value={role} onChange={(e) => setRole(e.target.value)} placeholder="Backend Engineer" />
        </div>
        <div className="space-y-1 sm:col-span-2">
          <Label>Job URL (optional)</Label>
          <Input value={jobUrl} onChange={(e) => setJobUrl(e.target.value)} placeholder="https://…" />
        </div>
      </div>
      <button
        type="button"
        disabled={streaming || jd.trim().length < 10}
        onClick={() =>
          onTailor({
            job_description: jd,
            company: company || undefined,
            role: role || undefined,
            job_url: jobUrl || undefined,
          })
        }
        className="w-full px-4 py-2 rounded-md bg-slate-900 text-white text-sm disabled:opacity-50"
      >
        {streaming ? "Tailoring…" : "Tailor my resume"}
      </button>
    </div>
  );
}
