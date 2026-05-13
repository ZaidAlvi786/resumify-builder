// src/components/BaseProfile/CertificationsSection.tsx
"use client";
import { useFieldArray, useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2 } from "lucide-react";
import type { BaseProfile } from "@/lib/schemas/baseProfile";

export default function CertificationsSection() {
  const { register, control } = useFormContext<BaseProfile>();
  const { fields, append, remove } = useFieldArray({ control, name: "certifications" });

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Certifications</h2>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() =>
            append({
              name: "",
              issuer: "",
              issued_date: "",
              expiration_date: "",
              credential_id: "",
              url: "",
            })
          }
        >
          <Plus className="w-4 h-4 mr-1" /> Add certification
        </Button>
      </div>
      {fields.map((field, i) => (
        <div key={field.id} className="rounded-lg border border-slate-200 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Cert #{i + 1}</span>
            <Button type="button" variant="ghost" size="sm" onClick={() => remove(i)}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Name *</Label>
              <Input placeholder="AWS Solutions Architect" {...register(`certifications.${i}.name` as const)} />
            </div>
            <div className="space-y-1">
              <Label>Issuer</Label>
              <Input placeholder="Amazon Web Services" {...register(`certifications.${i}.issuer` as const)} />
            </div>
            <div className="space-y-1">
              <Label>Issued (YYYY or YYYY-MM)</Label>
              <Input {...register(`certifications.${i}.issued_date` as const)} />
            </div>
            <div className="space-y-1">
              <Label>Expires (YYYY or YYYY-MM)</Label>
              <Input {...register(`certifications.${i}.expiration_date` as const)} />
            </div>
            <div className="space-y-1">
              <Label>Credential ID</Label>
              <Input {...register(`certifications.${i}.credential_id` as const)} />
            </div>
            <div className="space-y-1">
              <Label>URL</Label>
              <Input placeholder="https://..." {...register(`certifications.${i}.url` as const)} />
            </div>
          </div>
        </div>
      ))}
    </section>
  );
}
