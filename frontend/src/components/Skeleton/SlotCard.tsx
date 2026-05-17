// src/components/Skeleton/SlotCard.tsx
"use client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { hasPlaceholder, type WorkingSlot } from "@/lib/coverage";

interface Props {
  slot: WorkingSlot;
  kind: "experience" | "project";
  index: number;
  onChange: (next: WorkingSlot) => void;
}

/** Highlights a field that still holds an unfilled [placeholder]. */
function fieldClass(value?: string): string {
  return hasPlaceholder(value)
    ? "border-amber-300 bg-amber-50"
    : "";
}

export default function SlotCard({ slot, kind, index, onChange }: Props) {
  const patch = (p: Partial<WorkingSlot>) => onChange({ ...slot, ...p });

  const setBulletText = (i: number, text: string) => {
    const bullets = slot.bullets.map((b, j) => (j === i ? { ...b, text } : b));
    patch({ bullets });
  };

  return (
    <div className="rounded-lg border border-slate-200 p-4 space-y-3">
      <span className="text-xs font-medium text-slate-500">
        {kind === "experience" ? "Role" : "Project"} #{index + 1}
      </span>

      {kind === "experience" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label>Company</Label>
            <Input
              className={fieldClass(slot.company)}
              value={slot.company ?? ""}
              onChange={(e) => patch({ company: e.target.value })}
            />
          </div>
          <div className="space-y-1">
            <Label>Title</Label>
            <Input
              className={fieldClass(slot.title)}
              value={slot.title ?? ""}
              onChange={(e) => patch({ title: e.target.value })}
            />
          </div>
          <div className="space-y-1">
            <Label>Dates</Label>
            <Input
              className={fieldClass(slot.dates)}
              value={slot.dates ?? ""}
              onChange={(e) => patch({ dates: e.target.value })}
            />
          </div>
          <div className="space-y-1">
            <Label>Location</Label>
            <Input
              className={fieldClass(slot.location)}
              value={slot.location ?? ""}
              onChange={(e) => patch({ location: e.target.value })}
            />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label>Project name</Label>
            <Input
              className={fieldClass(slot.name)}
              value={slot.name ?? ""}
              onChange={(e) => patch({ name: e.target.value })}
            />
          </div>
          <div className="space-y-1">
            <Label>Your role</Label>
            <Input
              className={fieldClass(slot.role)}
              value={slot.role ?? ""}
              onChange={(e) => patch({ role: e.target.value })}
            />
          </div>
        </div>
      )}

      <div className="space-y-2">
        <Label className="text-sm">Bullets</Label>
        {slot.bullets.map((b, i) => (
          <div key={i} className="space-y-1">
            <p className="text-xs text-slate-500 italic">Prompt: {b.prompt}</p>
            <Textarea
              rows={2}
              className={fieldClass(b.text)}
              placeholder="Write a real, specific bullet answering the prompt above…"
              value={b.text}
              onChange={(e) => setBulletText(i, e.target.value)}
            />
          </div>
        ))}
      </div>

      <div className="space-y-1">
        <Label className="text-sm">Tech used (comma-separated)</Label>
        <Input
          defaultValue={slot.tech.join(", ")}
          placeholder="Python, Postgres, Docker"
          onBlur={(e) =>
            patch({
              tech: e.target.value.split(",").map((t) => t.trim()).filter(Boolean),
            })
          }
        />
      </div>
    </div>
  );
}
