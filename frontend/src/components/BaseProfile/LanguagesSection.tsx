// src/components/BaseProfile/LanguagesSection.tsx
"use client";
import { useFieldArray, useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2 } from "lucide-react";
import type { BaseProfile } from "@/lib/schemas/baseProfile";

const PROFICIENCIES = ["basic", "conversational", "fluent", "native"];

export default function LanguagesSection() {
  const { register, control } = useFormContext<BaseProfile>();
  const { fields, append, remove } = useFieldArray({ control, name: "languages" });

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Languages</h2>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => append({ name: "", proficiency: "" })}
        >
          <Plus className="w-4 h-4 mr-1" /> Add language
        </Button>
      </div>
      {fields.map((field, i) => (
        <div
          key={field.id}
          className="flex flex-col gap-2 sm:grid sm:grid-cols-12 sm:items-end"
        >
          <div className="space-y-1 sm:col-span-6">
            <Label className="text-sm">Language</Label>
            <Input placeholder="English" {...register(`languages.${i}.name` as const)} />
          </div>
          <div className="space-y-1 sm:col-span-5">
            <Label className="text-sm">Proficiency</Label>
            <select
              className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
              {...register(`languages.${i}.proficiency` as const)}
            >
              <option value="">—</option>
              {PROFICIENCIES.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
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
