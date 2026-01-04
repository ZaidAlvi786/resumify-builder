"use client";

import React, { useState, useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import PersonalDetailsStep from "./PersonalDetailsStep";
import ExperienceStep from "./ExperienceStep";
import SkillsStep from "./SkillsStep";
import { generateResume, ResumeData } from "@/services/api";
import { Loader2, Save, FileText, History, Upload } from "lucide-react";
import ResumePreview from "@/components/ResumePreview";
import { supabase } from "@/lib/supabase";
import LogoLoader from "@/components/ui/LogoLoader";
import ResumeVersionHistory from "@/components/ResumeVersionHistory";
import { industryTemplates } from "@/lib/industryTemplates";
import TemplateSelector, { ResumeTemplate } from "@/components/TemplateSelector";
import ResumeUpload from "@/components/ResumeUpload";

const steps = ["Personal", "Experience", "Skills", "Preview"];

interface SavedResume {
    id: string;
    title: string;
    content: ResumeData;
    updated_at: string;
}

export default function ResumeBuilder() {
    const [currentStep, setCurrentStep] = useState(0);
    const [selectedTemplate, setSelectedTemplate] = useState<"modern" | "classic" | "minimalist" | "executive" | "creative">("modern");
    const [isLoading, setIsLoading] = useState(false);
    const [generatedResume, setGeneratedResume] = useState<ResumeData | null>(null);
    const [resumeId, setResumeId] = useState<string | null>(null);
    const [savedResumes, setSavedResumes] = useState<SavedResume[]>([]);
    const [loadingResumes, setLoadingResumes] = useState(false);
    const [saveStatus, setSaveStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: '' });
    const [showUploadModal, setShowUploadModal] = useState(false);

    const methods = useForm<ResumeData>({
        defaultValues: {
            skills: [],
            experience: [],
            education: [],
            projects: [],
            full_name: "", // Initialize to avoid controlled/uncontrolled warnings
            email: "",
            phone: "",
            location: "",
            target_role: "",
        },
    });

    const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
    const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 0));

    // Load saved resumes on component mount
    useEffect(() => {
        loadSavedResumes();
    }, []);

    const loadSavedResumes = async () => {
        setLoadingResumes(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                setLoadingResumes(false);
                return;
            }

            const { data, error } = await supabase
                .from('resumes')
                .select('id, title, content, updated_at')
                .eq('user_id', user.id)
                .order('updated_at', { ascending: false });

            if (error) {
                console.error('Error loading resumes:', error);
                setSaveStatus({ type: 'error', message: 'Failed to load saved resumes' });
            } else if (data) {
                setSavedResumes(data as SavedResume[]);
            }
        } catch (err) {
            console.error("Unexpected error loading resumes:", err);
            setSaveStatus({ type: 'error', message: 'Unexpected error loading resumes' });
        } finally {
            setLoadingResumes(false);
        }
    };

    const loadResume = (resume: SavedResume) => {
        setResumeId(resume.id);
        setGeneratedResume(resume.content);
        methods.reset(resume.content);
        setCurrentStep(3); // Go to preview step
    };

    const saveToSupabase = async (data: ResumeData, showMessage = true, createNewVersion = false) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                if (showMessage) {
                    setSaveStatus({ type: 'error', message: 'Please log in to save your resume' });
                }
                return;
            }

            const formData = methods.getValues();
            const industry = (formData as any).industry || null;
            const templateName = industry ? industryTemplates.find(t => t.id === industry)?.name : null;

            if (createNewVersion && resumeId) {
                // Create a new version
                const { data: parentResume } = await supabase
                    .from('resumes')
                    .select('version_number')
                    .eq('id', resumeId)
                    .single();

                const newVersionNumber = (parentResume?.version_number || 0) + 1;

                const { data: inserted, error } = await supabase
                    .from('resumes')
                    .insert([{
                        title: `${data.full_name || 'Untitled'} - ${data.target_role || 'Resume'}`,
                        content: data,
                        user_id: user.id,
                        parent_resume_id: resumeId,
                        version_number: newVersionNumber,
                        industry: industry,
                        template_name: templateName,
                    }])
                    .select()
                    .single();

                if (error) throw error;
                setResumeId(inserted.id);
                if (showMessage) {
                    setSaveStatus({ type: 'success', message: 'New version created successfully' });
                }
            } else {
                const payload: any = {
                    title: `${data.full_name || 'Untitled'} - ${data.target_role || 'Resume'}`,
                    content: data,
                    user_id: user.id,
                    industry: industry,
                    template_name: templateName,
                };

                if (resumeId) {
                    // Update existing
                    const { error } = await supabase
                        .from('resumes')
                        .update(payload)
                        .eq('id', resumeId);
                    if (error) {
                        console.error('Error updating resume:', error);
                        if (showMessage) {
                            setSaveStatus({ type: 'error', message: 'Failed to update resume' });
                        }
                    } else {
                        if (showMessage) {
                            setSaveStatus({ type: 'success', message: 'Resume updated successfully' });
                        }
                    }
                } else {
                    // Insert new
                    payload.version_number = 1;
                    const { data: inserted, error } = await supabase
                        .from('resumes')
                        .insert([payload])
                        .select()
                        .single();
                    if (error) {
                        console.error('Error saving resume:', error);
                        if (showMessage) {
                            setSaveStatus({ type: 'error', message: 'Failed to save resume' });
                        }
                    } else if (inserted) {
                        setResumeId(inserted.id);
                        if (showMessage) {
                            setSaveStatus({ type: 'success', message: 'Resume saved successfully' });
                        }
                    }
                }
            }

            // Reload resumes list
            await loadSavedResumes();

            // Clear status message after 3 seconds
            if (showMessage) {
                setTimeout(() => setSaveStatus({ type: null, message: '' }), 3000);
            }
        } catch (err) {
            console.error("Unexpected error saving to Supabase", err);
            if (showMessage) {
                setSaveStatus({ type: 'error', message: 'An unexpected error occurred' });
                setTimeout(() => setSaveStatus({ type: null, message: '' }), 3000);
            }
        }
    };

    const handleGenerate = async (data: ResumeData, showPreview: boolean) => {
        setIsLoading(true);
        try {
            const result = await generateResume(data);
            setGeneratedResume(result);

            // Auto-save if generated successfully
            await saveToSupabase(result);

            if (showPreview) {
                nextStep(); // Move to Preview step
            }
        } catch (error) {
            console.error(error);
            alert("Failed to generate resume. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleResumeParsed = (parsedData: any) => {
        // Merge parsed data with form values
        const currentValues = methods.getValues();
        methods.reset({
            ...currentValues,
            ...parsedData,
        });
        setShowUploadModal(false);
    };

    return (
        <>
            {isLoading && <LogoLoader message="Generating Your Perfect Resume" />}
            {showUploadModal && (
                <ResumeUpload
                    onResumeParsed={handleResumeParsed}
                    onClose={() => setShowUploadModal(false)}
                />
            )}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 my-8">
            {/* Form Section */}
            <div className={`lg:col-span-${currentStep === 3 ? "4" : "8 lg:col-start-3"} space-y-6`}>
                {/* Save Status Message */}
                {saveStatus.type && (
                    <div className={`p-3 rounded-lg ${saveStatus.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
                        {saveStatus.message}
                    </div>
                )}

                {/* Upload Resume & Saved Resumes */}
                {currentStep < 3 && (
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-sm font-semibold flex items-center gap-2">
                                    <FileText className="w-4 h-4" />
                                    {savedResumes.length > 0 ? "Saved Resumes" : "Get Started"}
                                </h3>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setShowUploadModal(true)}
                                >
                                    <Upload className="w-4 h-4 mr-2" />
                                    Upload Resume
                                </Button>
                            </div>
                            {savedResumes.length > 0 && (
                                <div className="space-y-2">
                                    {savedResumes.map((resume) => (
                                        <button
                                            key={resume.id}
                                            onClick={() => loadResume(resume)}
                                            className="w-full text-left p-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
                                        >
                                            <div className="font-medium text-sm">{resume.title}</div>
                                            <div className="text-xs text-slate-500 mt-1">
                                                Updated {new Date(resume.updated_at).toLocaleDateString()}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Progress Stepper */}
                {currentStep < 3 && (
                    <div className="flex justify-between mb-8 px-2">
                        {steps.slice(0, 3).map((step, idx) => (
                            <div key={step} className="flex flex-col items-center">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${idx <= currentStep ? "bg-slate-900 text-white" : "bg-slate-200 text-slate-500"
                                    }`}>
                                    {idx + 1}
                                </div>
                                <span className="text-xs mt-2 text-slate-600">{step}</span>
                            </div>
                        ))}
                    </div>
                )}

                <Card>
                    <CardContent className="pt-6">
                        <FormProvider {...methods}>
                            <form onSubmit={(e) => e.preventDefault()}>
                                {currentStep === 0 && <PersonalDetailsStep />}
                                {currentStep === 1 && <ExperienceStep />}
                                {currentStep === 2 && <SkillsStep />}

                                {/* Navigation Buttons */}
                                {currentStep < 3 && (
                                    <div className="flex justify-between mt-8">
                                        <Button type="button" variant="outline" onClick={prevStep} disabled={currentStep === 0}>
                                            Back
                                        </Button>

                                        {currentStep === 2 ? (
                                            <div className="flex gap-2">
                                                <Button 
                                                    type="button" 
                                                    variant="outline" 
                                                    onClick={methods.handleSubmit((data) => handleGenerate(data, false))} 
                                                    disabled={isLoading}
                                                >
                                                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                    Generate Only
                                                </Button>
                                                <Button 
                                                    type="button" 
                                                    variant="outline" 
                                                    onClick={methods.handleSubmit((data) => saveToSupabase(data, true))} 
                                                    disabled={isLoading}
                                                >
                                                    <Save className="mr-2 h-4 w-4" />
                                                    Save Draft
                                                </Button>
                                                <Button type="submit" disabled={isLoading}>
                                                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                    Generate & Preview
                                                </Button>
                                            </div>
                                        ) : (
                                            <Button type="button" onClick={nextStep}>
                                                Next
                                            </Button>
                                        )}
                                    </div>
                                )}
                            </form>
                        </FormProvider>
                    </CardContent>
                </Card>
            </div>

            {/* Preview Section - Only visible at the end or side-by-side if we implemented split view */}
            {currentStep === 3 && generatedResume && (
                <div className="lg:col-span-8 space-y-6 animate-in fade-in zoom-in-95 duration-500">
                    {/* Template Selector */}
                    <Card>
                        <CardContent className="pt-6">
                            <TemplateSelector
                                type="resume"
                                selectedTemplate={selectedTemplate}
                                onSelect={(template) => setSelectedTemplate(template as ResumeTemplate)}
                            />
                        </CardContent>
                    </Card>
                    
                    <ResumePreview data={generatedResume} onEdit={() => setCurrentStep(0)} template={selectedTemplate} />
                    
                    {/* Version History */}
                    {resumeId && (
                        <ResumeVersionHistory
                            resumeId={resumeId}
                            onLoadVersion={(content) => {
                                setGeneratedResume(content);
                                methods.reset(content);
                            }}
                        />
                    )}
                    
                    {/* Create New Version Button */}
                    {resumeId && (
                        <Card>
                            <CardContent className="pt-6">
                                <Button
                                    onClick={() => saveToSupabase(generatedResume, true, true)}
                                    variant="outline"
                                    className="w-full flex items-center justify-center gap-2"
                                >
                                    <History className="w-4 h-4" />
                                    Create New Version
                                </Button>
                                <p className="text-xs text-slate-500 mt-2 text-center">
                                    Save this as a new version to track changes over time
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            )}
        </div>
        </>
    );
}

