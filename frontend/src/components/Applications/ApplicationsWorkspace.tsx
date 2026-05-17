// src/components/Applications/ApplicationsWorkspace.tsx
"use client";
import { useCallback, useEffect, useState } from "react";
import type { RowSelectionState } from "@tanstack/react-table";
import {
  createApplication,
  deleteApplication,
  downloadApplicationsXlsx,
  listApplications,
  updateApplication,
} from "@/services/applicationsApi";
import type {
  Application,
  ApplicationBase,
  ApplicationStatus,
} from "@/lib/schemas/applications";
import ApplicationsTable from "./ApplicationsTable";
import NewApplicationForm, { type Prefill } from "./NewApplicationForm";
import GoogleSheetsControls from "./GoogleSheetsControls";

const STATUSES: ApplicationStatus[] = [
  "saved", "applied", "interviewing", "offer", "rejected", "withdrawn",
];
const PAGE_SIZE = 25;

export default function ApplicationsWorkspace() {
  const [rows, setRows] = useState<Application[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | "">("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selection, setSelection] = useState<RowSelectionState>({});
  const [showForm, setShowForm] = useState(false);
  const [prefill, setPrefill] = useState<Prefill | undefined>(undefined);

  // Prefill + auto-open the form when arriving from /tailor's "Log application".
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const pre: Prefill = {
      company: p.get("company") ?? undefined,
      role: p.get("role") ?? undefined,
      job_url: p.get("job_url") ?? undefined,
    };
    if (pre.company || pre.role || pre.job_url) {
      setPrefill(pre);
      setShowForm(true);
    }
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await listApplications({
        status: statusFilter || undefined,
        page,
        page_size: PAGE_SIZE,
      });
      setRows(res.items);
      setTotal(res.total);
      setSelection({});
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, [statusFilter, page]);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleCreate(data: ApplicationBase) {
    await createApplication(data);
    setShowForm(false);
    setPrefill(undefined);
    setPage(1);
    await load();
  }

  async function handleStatusChange(id: string, status: ApplicationStatus) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
    try {
      await updateApplication(id, { status });
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      await load();
    }
  }

  async function handleDelete(id: string) {
    await deleteApplication(id);
    await load();
  }

  async function handleBulkDelete() {
    const ids = Object.keys(selection).filter((id) => selection[id]);
    await Promise.all(ids.map((id) => deleteApplication(id)));
    await load();
  }

  const selectedCount = Object.values(selection).filter(Boolean).length;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold">Applications</h1>
          <p className="text-sm text-slate-500">{total} tracked</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setShowForm((v) => !v)}
            className="px-3 py-1.5 rounded-md bg-slate-900 text-white text-sm"
          >
            New application
          </button>
          <button
            type="button"
            onClick={() => downloadApplicationsXlsx().catch((e) => setError(String(e)))}
            className="px-3 py-1.5 rounded-md border border-slate-300 text-sm"
          >
            Download Excel
          </button>
          <GoogleSheetsControls />
        </div>
      </header>

      {showForm && (
        <NewApplicationForm
          prefill={prefill}
          onCreate={handleCreate}
          onCancel={() => {
            setShowForm(false);
            setPrefill(undefined);
          }}
        />
      )}

      <div className="flex items-center gap-3">
        <select
          className="h-9 rounded-md border border-slate-200 px-2 text-sm"
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value as ApplicationStatus | "");
            setPage(1);
          }}
        >
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        {selectedCount > 0 && (
          <button
            type="button"
            onClick={handleBulkDelete}
            className="px-3 py-1.5 rounded-md border border-red-300 text-sm text-red-600"
          >
            Delete {selectedCount} selected
          </button>
        )}
      </div>

      {error && (
        <p className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      )}

      {loading ? (
        <p className="text-sm text-slate-400">Loading…</p>
      ) : (
        <ApplicationsTable
          rows={rows}
          selection={selection}
          onSelectionChange={setSelection}
          onStatusChange={handleStatusChange}
          onDelete={handleDelete}
        />
      )}

      <div className="flex items-center justify-between text-sm">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => setPage((p) => p - 1)}
          className="px-3 py-1 rounded-md border border-slate-300 disabled:opacity-40"
        >
          ← Prev
        </button>
        <span className="text-slate-500">
          Page {page} of {pageCount}
        </span>
        <button
          type="button"
          disabled={page >= pageCount}
          onClick={() => setPage((p) => p + 1)}
          className="px-3 py-1 rounded-md border border-slate-300 disabled:opacity-40"
        >
          Next →
        </button>
      </div>
    </div>
  );
}
