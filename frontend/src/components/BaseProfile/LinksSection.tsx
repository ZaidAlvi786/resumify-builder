// src/components/BaseProfile/LinksSection.tsx
"use client";
import { useFieldArray, useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2 } from "lucide-react";
import type { BaseProfile } from "@/lib/schemas/baseProfile";

export default function LinksSection() {
  const { register, control } = useFormContext<BaseProfile>();
  const { fields, append, remove } = useFieldArray({ control, name: "links" });

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Links</h2>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => append({ label: "", url: "" })}
        >
          <Plus className="w-4 h-4 mr-1" /> Add link
        </Button>
      </div>
      {fields.length === 0 && (
        <p className="text-sm text-slate-500">e.g. LinkedIn, GitHub, portfolio.</p>
      )}
      {fields.map((field, i) => (
        <div
          key={field.id}
          className="flex flex-col gap-2 sm:grid sm:grid-cols-12 sm:items-end"
        >
          <div className="space-y-1 sm:col-span-4">
            <Label>Label</Label>
            <Input placeholder="LinkedIn" {...register(`links.${i}.label` as const)} />
          </div>
          <div className="space-y-1 sm:col-span-7">
            <Label>URL</Label>
            <Input placeholder="https://linkedin.com/in/..." {...register(`links.${i}.url` as const)} />
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
