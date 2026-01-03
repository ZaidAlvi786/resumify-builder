import React, { useState, useRef, useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Upload, X, User } from "lucide-react";
import { industryTemplates } from "@/lib/industryTemplates";

const PersonalDetailsStep = () => {
    const { register, setValue, watch } = useFormContext();
    const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const photoFile = watch("profile_photo");

    // Sync profilePhoto with form value when it changes
    useEffect(() => {
        if (photoFile && typeof photoFile === "string") {
            setProfilePhoto(photoFile);
        } else if (!photoFile) {
            setProfilePhoto(null);
        }
    }, [photoFile]);

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                alert("Photo size should be less than 2MB");
                return;
            }
            if (!file.type.startsWith("image/")) {
                alert("Please upload an image file");
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                setProfilePhoto(base64String);
                setValue("profile_photo", base64String);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemovePhoto = () => {
        setProfilePhoto(null);
        setValue("profile_photo", "");
    };

    return (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-xl font-semibold mb-4">Personal Details</h2>
            
            {/* Photo Upload Section */}
            <div className="space-y-2">
                <Label>Profile Picture (Optional)</Label>
                <div className="flex items-center gap-4">
                    <div className="relative">
                        {profilePhoto ? (
                            <div className="relative">
                                <img
                                    src={profilePhoto}
                                    alt="Profile"
                                    className="w-24 h-24 rounded-full object-cover border-2 border-slate-300"
                                />
                                <button
                                    type="button"
                                    onClick={handleRemovePhoto}
                                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        ) : (
                            <div className="w-24 h-24 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center">
                                <User className="w-10 h-10 text-slate-400" />
                            </div>
                        )}
                    </div>
                    <div className="flex-1">
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handlePhotoUpload}
                            className="hidden"
                            id="photo-upload"
                        />
                        <label htmlFor="photo-upload">
                            <Button
                                type="button"
                                variant="outline"
                                className="cursor-pointer"
                                asChild
                            >
                                <span>
                                    <Upload className="w-4 h-4 mr-2" />
                                    {profilePhoto ? "Change Photo" : "Upload Photo"}
                                </span>
                            </Button>
                        </label>
                        <p className="text-xs text-slate-500 mt-1">JPG, PNG or GIF. Max size 2MB</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="full_name">Full Name</Label>
                    <Input id="full_name" placeholder="John Doe" {...register("full_name")} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="john@example.com" {...register("email")} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input id="phone" placeholder="+1 234 567 8900" {...register("phone")} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input id="location" placeholder="New York, NY" {...register("location")} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="linkedin">LinkedIn (Optional)</Label>
                    <Input id="linkedin" placeholder="linkedin.com/in/johndoe" {...register("linkedin")} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="website">Portfolio Website (Optional)</Label>
                    <Input id="website" placeholder="johndoe.com" {...register("website")} />
                </div>
                <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="target_role">Target Job Role</Label>
                    <Input
                        id="target_role"
                        placeholder="e.g. Senior Frontend Engineer"
                        className="border-blue-200 focus:border-blue-500"
                        {...register("target_role")}
                    />
                    <p className="text-sm text-slate-500">The AI will optimize your resume for this role.</p>
                </div>
                <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="industry">Industry / Template</Label>
                    <select
                        id="industry"
                        className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2"
                        {...register("industry")}
                    >
                        <option value="">Select Industry (Optional)</option>
                        {industryTemplates.map((template) => (
                            <option key={template.id} value={template.id}>
                                {template.name} - {template.description}
                            </option>
                        ))}
                    </select>
                    <p className="text-sm text-slate-500">Choose an industry-specific template for better optimization.</p>
                </div>
            </div>
        </div>
    );
};

export default PersonalDetailsStep;
