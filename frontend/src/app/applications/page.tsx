// src/app/applications/page.tsx
"use client";
import ProtectedRoute from "@/components/ProtectedRoute";
import ApplicationsWorkspace from "@/components/Applications/ApplicationsWorkspace";

export default function ApplicationsPage() {
  return (
    <ProtectedRoute>
      <main className="mx-auto max-w-5xl px-4 py-8">
        <ApplicationsWorkspace />
      </main>
    </ProtectedRoute>
  );
}
