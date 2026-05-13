// src/app/base-profile/page.tsx
"use client";
import ProtectedRoute from "@/components/ProtectedRoute";
import BaseProfileForm from "@/components/BaseProfile/BaseProfileForm";

export default function BaseProfilePage() {
  return (
    <ProtectedRoute>
      <main className="mx-auto max-w-4xl px-4 py-8">
        <BaseProfileForm />
      </main>
    </ProtectedRoute>
  );
}
