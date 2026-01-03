import React from "react";
import { useFormContext, useFieldArray } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";

const ExperienceStep = () => {
    const { register, control } = useFormContext();
    const { fields, append, remove } = useFieldArray({
        control,
        name: "experience",
    });

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-xl font-semibold mb-4">Work Experience</h2>
            {fields.map((field, index) => (
                <div key={field.id} className="p-4 border rounded-lg bg-slate-50 space-y-4 relative">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => remove(index)}
                    >
                        <Trash2 className="w-4 h-4" />
                    </Button>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Job Title</Label>
                            <Input placeholder="Software Engineer" {...register(`experience.${index}.title`)} />
                        </div>
                        <div className="space-y-2">
                            <Label>Company</Label>
                            <Input placeholder="Tech Corp" {...register(`experience.${index}.company`)} />
                        </div>
                        <div className="space-y-2">
                            <Label>Start Date</Label>
                            <Input type="text" placeholder="Jan 2022" {...register(`experience.${index}.start_date`)} />
                        </div>
                        <div className="space-y-2">
                            <Label>End Date</Label>
                            <Input type="text" placeholder="Present" {...register(`experience.${index}.end_date`)} />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>Responsibilities / Achievements</Label>
                        <Textarea
                            placeholder="Describe what you did. The AI will polish this into bullet points."
                            {...register(`experience.${index}.description`)}
                        />
                    </div>
                </div>
            ))}

            <Button
                type="button"
                variant="outline"
                className="w-full border-dashed"
                onClick={() => append({ title: "", company: "", start_date: "", end_date: "", description: "" })}
            >
                <Plus className="w-4 h-4 mr-2" /> Add Experience
            </Button>
        </div>
    );
};

export default ExperienceStep;
