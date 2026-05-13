// src/components/BaseProfile/ExperienceSection.tsx
"use client";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2 } from "lucide-react";
import type { BaseProfile } from "@/lib/schemas/baseProfile";

/** Bullets are `string[]` inside an array — RHF's useFieldArray doesn't
 *  type-check nested primitive arrays, so we manage this slice manually
 *  via watch + setValue. The form value still updates correctly. */
function BulletsEditor({ idx }: { idx: number }) {
  const { register, setValue } = useFormContext<BaseProfile>();
  const bullets = (useWatch<BaseProfile>({ name: `experience.${idx}.bullets` }) as string[] | undefined) ?? [];
  const path = `experience.${idx}.bullets` as const;
  const update = (next: string[]) => setValue(path, next, { shouldDirty: true });
  return (
    <div className="space-y-2">
      <Label className="text-sm">Bullets</Label>
      {bullets.map((_, i) => (
        <div key={i} className="flex gap-2">
          <Textarea
            rows={2}
            placeholder="Led a team of 4 to ship..."
            {...register(`experience.${idx}.bullets.${i}` as const)}
          />
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

function TechStackEditor({ idx }: { idx: number }) {
  const { setValue } = useFormContext<BaseProfile>();
  const value = useWatch<BaseProfile>({ name: `experience.${idx}.tech_stack` }) as string[] | undefined;
  const handleChange = (raw: string) => {
    const parts = raw.split(",").map((s) => s.trim()).filter(Boolean);
    setValue(`experience.${idx}.tech_stack` as `experience.${number}.tech_stack`, parts, {
      shouldDirty: true,
    });
  };
  return (
    <div className="space-y-1">
      <Label className="text-sm">Tech stack (comma-separated)</Label>
      <Input
        defaultValue={(value || []).join(", ")}
        onBlur={(e) => handleChange(e.target.value)}
        placeholder="Python, Postgres, Redis"
      />
    </div>
  );
}

export default function ExperienceSection() {
  const { register, control } = useFormContext<BaseProfile>();
  const { fields, append, remove } = useFieldArray({ control, name: "experience" });

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Experience</h2>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() =>
            append({
              company: "",
              title: "",
              location: "",
              start_date: "",
              end_date: undefined,
              is_current: false,
              bullets: [],
              tech_stack: [],
            })
          }
        >
          <Plus className="w-4 h-4 mr-1" /> Add role
        </Button>
      </div>
      {fields.length === 0 && (
        <p className="text-sm text-slate-500">Add the roles you've held, most recent first.</p>
      )}
      {fields.map((field, i) => (
        <div key={field.id} className="rounded-lg border border-slate-200 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Role #{i + 1}</span>
            <Button type="button" variant="ghost" size="sm" onClick={() => remove(i)}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Company *</Label>
              <Input placeholder="Acme Corp" {...register(`experience.${i}.company` as const)} />
            </div>
            <div className="space-y-1">
              <Label>Title *</Label>
              <Input placeholder="Senior Engineer" {...register(`experience.${i}.title` as const)} />
            </div>
            <div className="space-y-1">
              <Label>Location</Label>
              <Input placeholder="Remote / London" {...register(`experience.${i}.location` as const)} />
            </div>
            <div className="space-y-1">
              <Label className="flex items-center gap-2">
                <input type="checkbox" {...register(`experience.${i}.is_current` as const)} /> Current role
              </Label>
            </div>
            <div className="space-y-1">
              <Label>Start (YYYY or YYYY-MM) *</Label>
              <Input placeholder="2022-03" {...register(`experience.${i}.start_date` as const)} />
            </div>
            <div className="space-y-1">
              <Label>End (YYYY or YYYY-MM)</Label>
              <Input placeholder="2024-08" {...register(`experience.${i}.end_date` as const)} />
            </div>
          </div>
          <BulletsEditor idx={i} />
          <TechStackEditor idx={i} />
        </div>
      ))}
    </section>
  );
}
