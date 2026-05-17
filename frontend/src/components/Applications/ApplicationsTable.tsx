// src/components/Applications/ApplicationsTable.tsx
"use client";
import { useMemo } from "react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  type RowSelectionState,
} from "@tanstack/react-table";
import type { Application, ApplicationStatus } from "@/lib/schemas/applications";

const STATUSES: ApplicationStatus[] = [
  "saved", "applied", "interviewing", "offer", "rejected", "withdrawn",
];

const STATUS_CLS: Record<ApplicationStatus, string> = {
  saved: "bg-slate-100 text-slate-700",
  applied: "bg-blue-100 text-blue-700",
  interviewing: "bg-amber-100 text-amber-800",
  offer: "bg-emerald-100 text-emerald-800",
  rejected: "bg-red-100 text-red-700",
  withdrawn: "bg-slate-100 text-slate-400",
};

interface Props {
  rows: Application[];
  selection: RowSelectionState;
  onSelectionChange: (next: RowSelectionState) => void;
  onStatusChange: (id: string, status: ApplicationStatus) => void;
  onDelete: (id: string) => void;
}

const helper = createColumnHelper<Application>();

export default function ApplicationsTable({
  rows,
  selection,
  onSelectionChange,
  onStatusChange,
  onDelete,
}: Props) {
  const columns = useMemo(
    () => [
      helper.display({
        id: "select",
        header: ({ table }) => (
          <input
            type="checkbox"
            aria-label="Select all"
            checked={table.getIsAllRowsSelected()}
            onChange={table.getToggleAllRowsSelectedHandler()}
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            aria-label="Select row"
            checked={row.getIsSelected()}
            onChange={row.getToggleSelectedHandler()}
          />
        ),
      }),
      helper.accessor("company", { header: "Company" }),
      helper.accessor("role", { header: "Role" }),
      helper.accessor("job_category", {
        header: "Category",
        cell: (c) => c.getValue() || "—",
      }),
      helper.accessor("status", {
        header: "Status",
        cell: (c) => (
          <select
            value={c.getValue()}
            onChange={(e) =>
              onStatusChange(c.row.original.id, e.target.value as ApplicationStatus)
            }
            className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_CLS[c.getValue()]}`}
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        ),
      }),
      helper.accessor("created_at", {
        header: "Added",
        cell: (c) => new Date(c.getValue()).toLocaleDateString(),
      }),
      helper.display({
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <button
            type="button"
            onClick={() => onDelete(row.original.id)}
            className="text-xs text-red-600 hover:underline"
          >
            Delete
          </button>
        ),
      }),
    ],
    [onStatusChange, onDelete],
  );

  const table = useReactTable({
    data: rows,
    columns,
    state: { rowSelection: selection },
    enableRowSelection: true,
    getRowId: (row) => row.id,
    onRowSelectionChange: (updater) =>
      onSelectionChange(typeof updater === "function" ? updater(selection) : updater),
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 text-left">
          {table.getHeaderGroups().map((hg) => (
            <tr key={hg.id}>
              {hg.headers.map((h) => (
                <th key={h.id} className="px-3 py-2 font-medium text-slate-600">
                  {h.isPlaceholder
                    ? null
                    : flexRender(h.column.columnDef.header, h.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className="border-t border-slate-100">
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="px-3 py-2">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td colSpan={7} className="px-3 py-6 text-center text-slate-400">
                No applications yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
