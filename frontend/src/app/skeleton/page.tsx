// src/app/skeleton/page.tsx
"use client";
import ProtectedRoute from "@/components/ProtectedRoute";
import SkeletonWorkspace from "@/components/Skeleton/SkeletonWorkspace";

export default function SkeletonPage() {
  return (
    <ProtectedRoute>
      <main className="mx-auto max-w-5xl px-4 py-8">
        <SkeletonWorkspace />
      </main>
    </ProtectedRoute>
  );
}
