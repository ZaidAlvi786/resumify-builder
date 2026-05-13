// src/components/BaseProfile/ProjectsSection.tsx
"use client";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2 } from "lucide-react";
import type { BaseProfile } from "@/lib/schemas/baseProfile";

function BulletsList({ idx }: { idx: number }) {
  const { register, setValue } = useFormContext<BaseProfile>();
  const bullets = (useWatch<BaseProfile>({ name: `projects.${idx}.bullets` }) as string[] | undefined) ?? [];
  const path = `projects.${idx}.bullets` as const;
  const update = (next: string[]) => setValue(path, next, { shouldDirty: true });
  return (
    <div className="space-y-2">
      <Label className="text-sm">Bullets</Label>
      {bullets.map((_, i) => (
        <div key={i} className="flex gap-2">
          <Textarea rows={2} {...register(`projects.${idx}.bullets.${i}` as const)} />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => update(bullets.filter((_, j) => j !== i))}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => update([...bullets, ""])}
      >
        <Plus className="w-4 h-4 mr-1" /> Add bullet
      </Button>
    </div>
  );
}

function TechStack({ idx }: { idx: number }) {
  const { setValue } = useFormContext<BaseProfile>();
  const value = useWatch<BaseProfile>({ name: `projects.${idx}.tech_stack` }) as string[] | undefined;
  return (
    <div className="space-y-1">
      <Label className="text-sm">Tech stack (comma-separated)</Label>
      <Input
        defaultValue={(value || []).join(", ")}
        onBlur={(e) => {
          const parts = e.target.value.split(",").map((s) => s.trim()).filter(Boolean);
          setValue(`projects.${idx}.tech_stack` as `projects.${number}.tech_stack`, parts, {
            shouldDirty: true,
          });
        }}
      />
    </div>
  );
}

export default function ProjectsSection() {
  const { register, control } = useFormContext<BaseProfile>();
  const { fields, append, remove } = useFieldArray({ control, name: "projects" });

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Projects</h2>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() =>
            append({
              name: "",
              role: "",
              description: "",
              bullets: [],
              tech_stack: [],
              url: "",
              start_date: "",
              end_date: "",
            })
          }
        >
          <Plus className="w-4 h-4 mr-1" /> Add project
        </Button>
      </div>
      {fields.map((field, i) => (
        <div key={field.id} className="rounded-lg border border-slate-200 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Project #{i + 1}</span>
            <Button type="button" variant="ghost" size="sm" onClick={() => remove(i)}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Name *</Label>
              <Input {...register(`projects.${i}.name` as const)} />
            </div>
            <div className="space-y-1">
              <Label>Your role</Label>
              <Input {...register(`projects.${i}.role` as const)} />
            </div>
            <div className="space-y-1 md:col-span-2">
              <Label>Description</Label>
              <Textarea rows={2} {...register(`projects.${i}.description` as const)} />
            </div>
            <div className="space-y-1">
              <Label>URL</Label>
              <Input placeholder="https://..." {...register(`projects.${i}.url` as const)} />
            </div>
            <div className="space-y-1">
              <Label>Start (YYYY or YYYY-MM)</Label>
              <Input {...register(`projects.${i}.start_date` as const)} />
            </div>
            <div className="space-y-1">
              <Label>End (YYYY or YYYY-MM)</Label>
              <Input {...register(`projects.${i}.end_date` as const)} />
            </div>
          </div>
          <BulletsList idx={i} />
          <TechStack idx={i} />
        </div>
      ))}
    </section>
  );
}
