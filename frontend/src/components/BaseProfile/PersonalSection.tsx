// src/components/BaseProfile/PersonalSection.tsx
"use client";
import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { BaseProfile } from "@/lib/schemas/baseProfile";

export default function PersonalSection() {
  const { register, formState: { errors } } = useFormContext<BaseProfile>();
  const e = errors.personal;
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold">Personal</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label htmlFor="personal.full_name">Full name *</Label>
          <Input id="personal.full_name" placeholder="Ada Lovelace" {...register("personal.full_name")} />
          {e?.full_name && <p className="text-xs text-red-500">{e.full_name.message}</p>}
        </div>
        <div className="space-y-1">
          <Label htmlFor="personal.email">Email *</Label>
          <Input id="personal.email" type="email" placeholder="ada@example.com" {...register("personal.email")} />
          {e?.email && <p className="text-xs text-red-500">{e.email.message}</p>}
        </div>
        <div className="space-y-1">
          <Label htmlFor="personal.phone">Phone</Label>
          <Input id="personal.phone" placeholder="+1 555 0100" {...register("personal.phone")} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="personal.location">Location</Label>
          <Input id="personal.location" placeholder="London, UK" {...register("personal.location")} />
        </div>
        <div className="space-y-1 md:col-span-2">
          <Label htmlFor="personal.headline">Headline</Label>
          <Input id="personal.headline" placeholder="Senior Backend Engineer" {...register("personal.headline")} />
        </div>
        <div className="space-y-1 md:col-span-2">
          <Label htmlFor="personal.summary">Summary</Label>
          <Textarea
            id="personal.summary"
            rows={3}
            placeholder="A short paragraph summarising your experience and what you're looking for."
            {...register("personal.summary")}
          />
        </div>
      </div>
    </section>
  );
}
