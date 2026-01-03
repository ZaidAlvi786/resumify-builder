import React, { useState } from "react";
import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

const SkillsStep = () => {
    const { setValue, watch } = useFormContext();
    const skills = watch("skills") || [];
    const [currentSkill, setCurrentSkill] = useState("");

    const addSkill = (e: React.KeyboardEvent | React.MouseEvent) => {
        e.preventDefault();
        if (currentSkill.trim() && !skills.includes(currentSkill.trim())) {
            setValue("skills", [...skills, currentSkill.trim()]);
            setCurrentSkill("");
        }
    };

    const removeSkill = (skillToRemove: string) => {
        setValue("skills", skills.filter((s: string) => s !== skillToRemove));
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-xl font-semibold mb-4">Skills</h2>
            <div className="space-y-2">
                <Label>Add Technical Skills</Label>
                <div className="flex gap-2">
                    <Input
                        value={currentSkill}
                        onChange={(e) => setCurrentSkill(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && addSkill(e)}
                        placeholder="e.g. React, Python, AWS"
                    />
                    <Button type="button" onClick={addSkill}>Add</Button>
                </div>
                <p className="text-xs text-slate-500">Press Enter to add per skill.</p>
            </div>

            <div className="flex flex-wrap gap-2 mt-4">
                {skills.map((skill: string) => (
                    <div key={skill} className="bg-slate-900 text-white px-3 py-1 rounded-full text-sm flex items-center gap-2">
                        {skill}
                        <button type="button" onClick={() => removeSkill(skill)} className="hover:text-red-300">
                            <X className="w-3 h-3" />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SkillsStep;
