// src/components/BaseProfile/SkillsSection.tsx
"use client";
import { useFieldArray, useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2 } from "lucide-react";
import type { BaseProfile } from "@/lib/schemas/baseProfile";

const CATEGORIES = ["language", "framework", "tool", "soft", "domain"];
const LEVELS = ["beginner", "intermediate", "advanced", "expert"];

export default function SkillsSection() {
  const { register, control } = useFormContext<BaseProfile>();
  const { fields, append, remove } = useFieldArray({ control, name: "skills" });

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Skills</h2>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => append({ name: "", category: undefined, level: undefined, years: undefined })}
        >
          <Plus className="w-4 h-4 mr-1" /> Add skill
        </Button>
      </div>
      {fields.map((field, i) => (
        <div
          key={field.id}
          className="flex flex-col gap-2 sm:grid sm:grid-cols-12 sm:items-end"
        >
          <div className="space-y-1 sm:col-span-4">
            <Label className="text-sm">Name *</Label>
            <Input placeholder="Python" {...register(`skills.${i}.name` as const)} />
          </div>
          <div className="space-y-1 sm:col-span-3">
            <Label className="text-sm">Category</Label>
            <select
              className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
              {...register(`skills.${i}.category` as const)}
            >
              <option value="">—</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="space-y-1 sm:col-span-3">
            <Label className="text-sm">Level</Label>
            <select
              className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
              {...register(`skills.${i}.level` as const)}
            >
              <option value="">—</option>
              {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          <div className="space-y-1 sm:col-span-1">
            <Label className="text-sm">Years</Label>
            <Input
              type="number"
              min={0}
              max={80}
              {...register(`skills.${i}.years` as const, { valueAsNumber: true })}
            />
          </div>
          <div className="sm:col-span-1">
            <Button type="button" variant="ghost" size="sm" onClick={() => remove(i)}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      ))}
    </section>
  );
}
