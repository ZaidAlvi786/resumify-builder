// src/components/BaseProfile/EducationSection.tsx
"use client";
import { useFieldArray, useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2 } from "lucide-react";
import type { BaseProfile } from "@/lib/schemas/baseProfile";

export default function EducationSection() {
  const { register, control } = useFormContext<BaseProfile>();
  const { fields, append, remove } = useFieldArray({ control, name: "education" });

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Education</h2>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() =>
            append({
              school: "",
              degree: "",
              field_of_study: "",
              location: "",
              start_date: "",
              end_date: "",
              is_current: false,
              gpa: "",
              notes: "",
            })
          }
        >
          <Plus className="w-4 h-4 mr-1" /> Add education
        </Button>
      </div>
      {fields.map((field, i) => (
        <div key={field.id} className="rounded-lg border border-slate-200 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Entry #{i + 1}</span>
            <Button type="button" variant="ghost" size="sm" onClick={() => remove(i)}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>School *</Label>
              <Input placeholder="MIT" {...register(`education.${i}.school` as const)} />
            </div>
            <div className="space-y-1">
              <Label>Degree *</Label>
              <Input placeholder="B.Sc." {...register(`education.${i}.degree` as const)} />
            </div>
            <div className="space-y-1">
              <Label>Field of study</Label>
              <Input placeholder="Computer Science" {...register(`education.${i}.field_of_study` as const)} />
            </div>
            <div className="space-y-1">
              <Label>Location</Label>
              <Input placeholder="Cambridge, MA" {...register(`education.${i}.location` as const)} />
            </div>
            <div className="space-y-1">
              <Label>Start (YYYY or YYYY-MM)</Label>
              <Input placeholder="2018-09" {...register(`education.${i}.start_date` as const)} />
            </div>
            <div className="space-y-1">
              <Label>End (YYYY or YYYY-MM)</Label>
              <Input placeholder="2022-06" {...register(`education.${i}.end_date` as const)} />
            </div>
            <div className="space-y-1">
              <Label>GPA</Label>
              <Input placeholder="3.9 / 4.0" {...register(`education.${i}.gpa` as const)} />
            </div>
            <div className="space-y-1">
              <Label className="flex items-center gap-2">
                <input type="checkbox" {...register(`education.${i}.is_current` as const)} /> Currently studying
              </Label>
            </div>
            <div className="space-y-1 md:col-span-2">
              <Label>Notes</Label>
              <Textarea rows={2} {...register(`education.${i}.notes` as const)} />
            </div>
          </div>
        </div>
      ))}
    </section>
  );
}
