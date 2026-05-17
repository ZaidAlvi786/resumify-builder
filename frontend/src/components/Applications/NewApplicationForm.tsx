// src/components/Applications/NewApplicationForm.tsx
"use client";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { ApplicationBase, ApplicationStatus } from "@/lib/schemas/applications";

const STATUSES: ApplicationStatus[] = [
  "saved", "applied", "interviewing", "offer", "rejected", "withdrawn",
];

export interface Prefill {
  company?: string;
  role?: string;
  job_url?: string;
}

interface Props {
  prefill?: Prefill;
  onCreate: (data: ApplicationBase) => Promise<void>;
  onCancel: () => void;
}

export default function NewApplicationForm({ prefill, onCreate, onCancel }: Props) {
  const [company, setCompany] = useState(prefill?.company ?? "");
  const [role, setRole] = useState(prefill?.role ?? "");
  const [category, setCategory] = useState("");
  const [jobUrl, setJobUrl] = useState(prefill?.job_url ?? "");
  const [statusValue, setStatusValue] = useState<ApplicationStatus>("saved");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setError(null);
    if (!company.trim() || !role.trim()) {
      setError("Company and role are required.");
      return;
    }
    setBusy(true);
    try {
      await onCreate({
        company: company.trim(),
        role: role.trim(),
        job_category: category.trim() || undefined,
        job_url: jobUrl.trim() || undefined,
        status: statusValue,
        notes: notes.trim() || undefined,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-lg border border-slate-200 p-4 space-y-3">
      <h3 className="font-semibold">Log a new application</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label>Company *</Label>
          <Input value={company} onChange={(e) => setCompany(e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label>Role *</Label>
          <Input value={role} onChange={(e) => setRole(e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label>Category</Label>
          <Input value={category} onChange={(e) => setCategory(e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label>Status</Label>
          <select
            className="flex h-10 w-full rounded-md border border-slate-200 px-3 text-sm"
            value={statusValue}
            onChange={(e) => setStatusValue(e.target.value as ApplicationStatus)}
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1 md:col-span-2">
          <Label>Job URL</Label>
          <Input value={jobUrl} onChange={(e) => setJobUrl(e.target.value)} placeholder="https://…" />
        </div>
        <div className="space-y-1 md:col-span-2">
          <Label>Notes</Label>
          <Textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={submit}
          disabled={busy}
          className="px-3 py-1.5 rounded-md bg-slate-900 text-white text-sm disabled:opacity-50"
        >
          {busy ? "Saving…" : "Add application"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-1.5 rounded-md border border-slate-300 text-sm"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
