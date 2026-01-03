"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { reviewResume, improveResume } from "@/services/api";
import { Loader2, Upload, AlertCircle, CheckCircle2, XCircle, Sparkles, Download, FileText } from "lucide-react";
import NeuralLoader from "@/components/ui/NeuralLoader";
import SkillGapVisualizer from "@/components/SkillGapVisualizer";
import Sidebar from "@/components/Sidebar";
import { motion, AnimatePresence } from "framer-motion";
import DataLoader from "@/components/DataLoader";
import ScoreBreakdownComponent from "@/components/ScoreBreakdown";
import DetailedResumeScore from "@/components/DetailedResumeScore";

export default function ReviewerPage() {
    const [file, setFile] = useState<File | null>(null);
    const [text, setText] = useState("");
    const [targetRole, setTargetRole] = useState("");
    const [jobDescription, setJobDescription] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<any | null>(null);
    const [isImproving, setIsImproving] = useState(false);
    const [improvedResume, setImprovedResume] = useState<any | null>(null);
    const [originalResumeText, setOriginalResumeText] = useState<string>("");

    const handleReview = async () => {
        if (!targetRole) {
            alert("Please enter a target role.");
            return;
        }
        if (!file && !text) {
            alert("Please upload a resume PDF or paste the text.");
            return;
        }

        setIsLoading(true);
        setResult(null);
        setImprovedResume(null);
        try {
            const data = await reviewResume(file, text, targetRole, jobDescription || undefined);
            setResult(data);
            // Store original resume text for improvement
            // If text was provided, use it; otherwise extract from PDF
            if (text) {
                setOriginalResumeText(text);
            } else if (file) {
                // Extract text from PDF file for improvement
                const formData = new FormData();
                formData.append("file", file);
                try {
                    const response = await fetch("http://localhost:8000/api/resume/extract-text", {
                        method: "POST",
                        body: formData,
                    });
                    if (response.ok) {
                        const extracted = await response.text();
                        setOriginalResumeText(extracted);
                    } else {
                        setOriginalResumeText("");
                    }
                } catch (e) {
                    console.error("Failed to extract text from PDF:", e);
                    setOriginalResumeText("");
                }
            }
        } catch (error) {
            console.error(error);
            alert("Failed to review resume.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleImproveResume = async () => {
        if (!result || !originalResumeText) {
            alert("Please review your resume first.");
            return;
        }

        setIsImproving(true);
        try {
            const improved = await improveResume(
                originalResumeText,
                targetRole,
                result.suggestions || [],
                result.strengths || [],
                result.weaknesses || [],
                result.missing_skills || [],
                result.missing_keywords || [],
                jobDescription || undefined
            );
            setImprovedResume(improved);
        } catch (error: any) {
            console.error(error);
            alert(`Failed to improve resume: ${error.message || "An unexpected error occurred."}`);
        } finally {
            setIsImproving(false);
        }
    };

    const handleDownloadImproved = () => {
        if (!improvedResume?.improved_resume_text) return;
        
        const blob = new Blob([improvedResume.improved_resume_text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Improved_Resume_${targetRole.replace(/\s+/g, '_')}.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="flex min-h-screen bg-slate-50">
            <Sidebar />
            {isImproving && <NeuralLoader message="Applying AI Suggestions to Your Resume" />}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="flex-1 py-8 px-4 sm:px-8 lg:ml-64 w-full min-w-0"
            >
                <div className="max-w-4xl mx-auto space-y-8 w-full overflow-x-hidden">
                    <motion.header
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Resume Reviewer</h1>
                        <p className="text-slate-600">Get instant AI feedback on your resume.</p>
                    </motion.header>

                <Card>
                    <CardHeader>
                        <CardTitle>Upload or Paste Resume</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="target_role">Target Job Role</Label>
                                <Input
                                    id="target_role"
                                    placeholder="e.g. Product Manager"
                                    value={targetRole}
                                    onChange={(e) => setTargetRole(e.target.value)}
                                />
                            </div>
                            
                            <div className="space-y-2">
                                <Label htmlFor="job_description">
                                    Job Description (Optional - for enhanced matching)
                                </Label>
                                <Textarea
                                    id="job_description"
                                    placeholder="Paste the full job description here for personalized analysis..."
                                    className="min-h-[100px]"
                                    value={jobDescription}
                                    onChange={(e) => setJobDescription(e.target.value)}
                                />
                                <p className="text-xs text-slate-500">
                                    💡 Tip: Adding the job description provides keyword matching and better recommendations
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2 border-r pr-4 border-slate-100">
                                <Label>Upload PDF</Label>
                                <div className="flex items-center justify-center w-full">
                                    <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-300 border-dashed rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100">
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                            <Upload className="w-8 h-8 mb-3 text-slate-400" />
                                            <p className="text-sm text-slate-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                                            <p className="text-xs text-slate-500">PDF (MAX. 5MB)</p>
                                        </div>
                                        <input id="dropzone-file" type="file" className="hidden" accept="application/pdf" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                                    </label>
                                </div>
                                {file && <p className="text-sm text-green-600 flex items-center mt-2"><CheckCircle2 className="w-3 h-3 mr-1" /> {file.name}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label>Or Paste Text</Label>
                                <Textarea
                                    placeholder="Paste your resume content here..."
                                    className="min-h-[130px]"
                                    value={text}
                                    onChange={(e) => setText(e.target.value)}
                                />
                            </div>
                        </div>

                        <Button onClick={handleReview} disabled={isLoading} className="w-full">
                            {isLoading && <Loader2 className="mr-2 w-4 h-4 animate-spin" />}
                            Analyze Resume
                        </Button>
                    </CardContent>
                </Card>

                <AnimatePresence>
                    {result && (
                        <motion.div
                            initial={{ opacity: 0, y: 30, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.5, ease: "easeOut" }}
                            className="space-y-6"
                        >
                            {/* Score Card */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.1 }}
                            >
                                <Card className="border-t-4 border-t-slate-900">
                                    <CardContent className="pt-6 flex flex-col items-center text-center">
                                        <div className="text-5xl font-extrabold text-slate-900 mb-2">{result.ats_score}/100</div>
                                        <p className="text-slate-500 uppercase tracking-wide text-sm font-semibold">ATS Score</p>
                                    </CardContent>
                                </Card>
                            </motion.div>

                            {/* Detailed Score Breakdown */}
                            <DetailedResumeScore atsScore={result.ats_score} />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Card className="bg-green-50/50 border-green-100">
                                <CardHeader>
                                    <CardTitle className="text-green-700 flex items-center"><CheckCircle2 className="w-5 h-5 mr-2" /> Strengths</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-2 text-sm">
                                        {result.strengths.map((s: string, i: number) => (
                                            <li key={i} className="flex items-start"><span className="mr-2">•</span>{s}</li>
                                        ))}
                                    </ul>
                                </CardContent>
                            </Card>

                            <Card className="bg-red-50/50 border-red-100">
                                <CardHeader>
                                    <CardTitle className="text-red-700 flex items-center"><XCircle className="w-5 h-5 mr-2" /> Weaknesses</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-2 text-sm">
                                        {result.weaknesses.map((w: string, i: number) => (
                                            <li key={i} className="flex items-start"><span className="mr-2">•</span>{w}</li>
                                        ))}
                                    </ul>
                                </CardContent>
                            </Card>
                        </div>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between">
                                    <span className="flex items-center">
                                        <AlertCircle className="w-5 h-5 mr-2 text-yellow-500" /> 
                                        Improvement Suggestions
                                    </span>
                                    <Button
                                        onClick={handleImproveResume}
                                        disabled={isImproving || !originalResumeText}
                                        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                                    >
                                        {isImproving ? (
                                            <>
                                                <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                                                Improving...
                                            </>
                                        ) : (
                                            <>
                                                <Sparkles className="mr-2 w-4 h-4" />
                                                Apply Suggestions & Improve Resume
                                            </>
                                        )}
                                    </Button>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-3 text-sm text-slate-700">
                                    {result.suggestions.map((s: string, i: number) => (
                                        <li key={i} className="p-3 bg-slate-50 rounded-lg border border-slate-100">{s}</li>
                                    ))}
                                </ul>
                                {!originalResumeText && (
                                    <p className="text-xs text-amber-600 mt-3">
                                        💡 Tip: Paste your resume text in the text area above to enable the improvement feature.
                                    </p>
                                )}
                            </CardContent>
                        </Card>

                        {/* Skill Gap Visualizer */}
                        {result.missing_skills && result.missing_skills.length > 0 && (
                            <SkillGapVisualizer
                                data={{
                                    resumeSkills: result.matched_skills || [],
                                    requiredSkills: [...(result.matched_skills || []), ...(result.missing_skills || [])],
                                    missingSkills: result.missing_skills || [],
                                    matchedSkills: result.matched_skills || [],
                                }}
                            />
                        )}

                        {/* Job Match Score - New Feature */}
                        {result.job_match_score !== undefined && result.job_match_score !== null && (
                            <Card className="border-t-4 border-t-indigo-500 bg-gradient-to-br from-indigo-50 to-purple-50">
                                <CardHeader>
                                    <CardTitle className="text-indigo-700">Job Match Score</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-center mb-4">
                                        <div className="text-4xl font-extrabold text-indigo-600 mb-2">{result.job_match_score}/100</div>
                                        <p className="text-sm text-slate-600">How well your resume matches the job description</p>
                                    </div>
                                    
                                    {result.keyword_matches && result.keyword_matches.length > 0 && (
                                        <div className="mb-4">
                                            <p className="text-sm font-semibold text-green-700 mb-2">✅ Matched Keywords ({result.keyword_matches.length})</p>
                                            <div className="flex flex-wrap gap-2">
                                                {result.keyword_matches.map((keyword: string, i: number) => (
                                                    <span key={i} className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">{keyword}</span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    
                                    {result.missing_keywords && result.missing_keywords.length > 0 && (
                                        <div>
                                            <p className="text-sm font-semibold text-orange-700 mb-2">⚠️ Missing Keywords ({result.missing_keywords.length})</p>
                                            <div className="flex flex-wrap gap-2">
                                                {result.missing_keywords.map((keyword: string, i: number) => (
                                                    <span key={i} className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs">{keyword}</span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        {/* Improved Resume Section */}
                        <AnimatePresence>
                            {improvedResume && (
                                <motion.div
                                    initial={{ opacity: 0, y: 30, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.5, ease: "easeOut" }}
                                >
                                    <Card className="border-t-4 border-t-green-500 bg-gradient-to-br from-green-50 to-emerald-50">
                                        <CardHeader>
                                            <CardTitle className="text-green-700 flex items-center justify-between">
                                                <span className="flex items-center">
                                                    <Sparkles className="w-5 h-5 mr-2" />
                                                    Improved Resume
                                                </span>
                                                <Button
                                                    onClick={handleDownloadImproved}
                                                    variant="outline"
                                                    className="border-green-300 text-green-700 hover:bg-green-100"
                                                >
                                                    <Download className="w-4 h-4 mr-2" />
                                                    Download
                                                </Button>
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            {improvedResume.estimated_new_ats_score && (
                                                <div className="text-center p-4 bg-white rounded-lg border border-green-200">
                                                    <div className="text-3xl font-extrabold text-green-600 mb-1">
                                                        {improvedResume.estimated_new_ats_score}/100
                                                    </div>
                                                    <p className="text-sm text-slate-600">
                                                        Estimated New ATS Score
                                                        {result.ats_score && (
                                                            <span className="ml-2 text-green-600 font-semibold">
                                                                (+{improvedResume.estimated_new_ats_score - result.ats_score} points)
                                                            </span>
                                                        )}
                                                    </p>
                                                </div>
                                            )}

                                            {improvedResume.improvements_made && improvedResume.improvements_made.length > 0 && (
                                                <div>
                                                    <h4 className="font-semibold text-slate-700 mb-2">Improvements Applied:</h4>
                                                    <ul className="space-y-2">
                                                        {improvedResume.improvements_made.map((improvement: string, i: number) => (
                                                            <li key={i} className="flex items-start text-sm text-slate-600">
                                                                <CheckCircle2 className="w-4 h-4 mr-2 text-green-600 mt-0.5 flex-shrink-0" />
                                                                {improvement}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}

                                            <div className="mt-4">
                                                <h4 className="font-semibold text-slate-700 mb-2 flex items-center">
                                                    <FileText className="w-4 h-4 mr-2" />
                                                    Improved Resume Text:
                                                </h4>
                                                <div className="bg-white p-4 rounded-lg border border-slate-200 max-h-96 overflow-y-auto">
                                                    <pre className="whitespace-pre-wrap text-sm text-slate-700 font-sans">
                                                        {improvedResume.improved_resume_text}
                                                    </pre>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            )}
                        </AnimatePresence>
                        </motion.div>
                    )}
                </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
}
