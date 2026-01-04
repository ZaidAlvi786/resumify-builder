"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { generateCoverLetter } from "@/services/api";
import { FileText, Download, Copy, CheckCircle2 } from "lucide-react";
import LogoLoader from "@/components/ui/LogoLoader";
import Sidebar from "@/components/Sidebar";
import TemplateSelector, { CoverLetterTemplate } from "@/components/TemplateSelector";
import { CoverLetterTemplateComponent } from "@/components/templates/CoverLetterTemplates";

export default function CoverLetterPage() {
    const [resumeText, setResumeText] = useState("");
    const [jobDescription, setJobDescription] = useState("");
    const [companyName, setCompanyName] = useState("");
    const [applicantName, setApplicantName] = useState("");
    const [position, setPosition] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [coverLetter, setCoverLetter] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState<CoverLetterTemplate>("professional");

    const handleGenerate = async () => {
        if (!resumeText || !jobDescription || !companyName || !applicantName || !position) {
            alert("Please fill in all fields.");
            return;
        }

        setIsLoading(true);
        try {
            const data = await generateCoverLetter(
                resumeText,
                jobDescription,
                companyName,
                applicantName,
                position
            );
            setCoverLetter(data.cover_letter);
        } catch (error) {
            console.error(error);
            alert("Failed to generate cover letter.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopy = () => {
        if (coverLetter) {
            navigator.clipboard.writeText(coverLetter);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleDownload = () => {
        if (coverLetter) {
            const blob = new Blob([coverLetter], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `cover-letter-${companyName}-${position}.txt`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
    };

    return (
        <>
            {isLoading && <LogoLoader message="Crafting Your Personalized Cover Letter" />}
            <div className="flex min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
                <Sidebar />
                <div className="flex-1 py-8 px-4 sm:px-8 lg:ml-64">
                    <div className="max-w-4xl mx-auto space-y-8">
                    <header className="text-center">
                        <h1 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold text-slate-900 mb-2">Cover Letter Generator</h1>
                        <p className="text-sm sm:text-base text-slate-600">AI-powered personalized cover letters that match your resume and job description</p>
                    </header>

                    <Card className="shadow-xl">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="w-5 h-5" />
                                Generate Your Cover Letter
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="applicant_name">Your Name *</Label>
                                    <Input
                                        id="applicant_name"
                                        placeholder="John Doe"
                                        value={applicantName}
                                        onChange={(e) => setApplicantName(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="position">Position Applying For *</Label>
                                    <Input
                                        id="position"
                                        placeholder="Senior Software Engineer"
                                        value={position}
                                        onChange={(e) => setPosition(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="company_name">Company Name *</Label>
                                <Input
                                    id="company_name"
                                    placeholder="Google"
                                    value={companyName}
                                    onChange={(e) => setCompanyName(e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="resume_text">Your Resume Text *</Label>
                                <Textarea
                                    id="resume_text"
                                    placeholder="Paste your resume content here..."
                                    className="min-h-[150px]"
                                    value={resumeText}
                                    onChange={(e) => setResumeText(e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="job_description">Job Description *</Label>
                                <Textarea
                                    id="job_description"
                                    placeholder="Paste the full job description here..."
                                    className="min-h-[200px]"
                                    value={jobDescription}
                                    onChange={(e) => setJobDescription(e.target.value)}
                                />
                            </div>

                            <Button
                                onClick={handleGenerate}
                                disabled={isLoading}
                                className="w-full h-12 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold"
                            >
                                Generate Cover Letter
                            </Button>
                        </CardContent>
                    </Card>

                    {coverLetter && (
                        <>
                            {/* Template Selector */}
                            <Card>
                                <CardContent className="pt-6">
                                    <TemplateSelector
                                        type="coverLetter"
                                        selectedTemplate={selectedTemplate}
                                        onSelect={(template) => setSelectedTemplate(template as CoverLetterTemplate)}
                                    />
                                </CardContent>
                            </Card>

                            <Card className="shadow-xl border-t-4 border-t-indigo-500 animate-fade-in">
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <CardTitle>Your Cover Letter</CardTitle>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={handleCopy}
                                                className="flex items-center gap-2"
                                            >
                                                {copied ? (
                                                    <>
                                                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                                                        Copied!
                                                    </>
                                                ) : (
                                                    <>
                                                        <Copy className="w-4 h-4" />
                                                        Copy
                                                    </>
                                                )}
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={handleDownload}
                                                className="flex items-center gap-2"
                                            >
                                                <Download className="w-4 h-4" />
                                                Download
                                            </Button>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="bg-slate-50 p-6 rounded-lg border border-slate-200">
                                        <CoverLetterTemplateComponent
                                            content={coverLetter}
                                            template={selectedTemplate}
                                            applicantName={applicantName}
                                            companyName={companyName}
                                            position={position}
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </>
                    )}
                    </div>
                </div>
            </div>
        </>
    );
}

