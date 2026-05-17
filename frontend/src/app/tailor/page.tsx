// src/app/tailor/page.tsx
"use client";
import ProtectedRoute from "@/components/ProtectedRoute";
import TailorWorkspace from "@/components/Tailor/TailorWorkspace";

export default function TailorPage() {
  return (
    <ProtectedRoute>
      <main className="mx-auto max-w-6xl px-4 py-8">
        <TailorWorkspace />
      </main>
    </ProtectedRoute>
  );
}
