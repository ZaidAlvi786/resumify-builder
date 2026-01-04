"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { analyzeJobAndTailorResume, ResumeData, JobDescriptionAnalyzerResponse } from "@/services/api";
import { Loader2, Target, CheckCircle, XCircle, ArrowRight, FileText, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import LogoLoader from "@/components/ui/LogoLoader";
import ResumePreview from "@/components/ResumePreview";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

interface SavedResume {
    id: string;
    title: string;
    content: ResumeData;
    updated_at: string;
}

export default function JobTailorPage() {
    const [resumeData, setResumeData] = useState<ResumeData | null>(null);
    const [savedResumes, setSavedResumes] = useState<SavedResume[]>([]);
    const [selectedResumeId, setSelectedResumeId] = useState<string | null>(null);
    const [jobDescription, setJobDescription] = useState("");
    const [jobTitle, setJobTitle] = useState("");
    const [companyName, setCompanyName] = useState("");
    const [loading, setLoading] = useState(false);
    const [loadingResumes, setLoadingResumes] = useState(false);
    const [result, setResult] = useState<JobDescriptionAnalyzerResponse | null>(null);
    const [error, setError] = useState("");

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
                .order('updated_at', { ascending: false })
                .limit(10);

            if (error) {
                console.error('Error loading resumes:', error);
            } else if (data) {
                setSavedResumes(data as SavedResume[]);
                // Auto-select the most recent resume
                if (data.length > 0) {
                    setSelectedResumeId(data[0].id);
                    setResumeData(data[0].content);
                }
            }
        } catch (err) {
            console.error("Error loading resumes:", err);
        } finally {
            setLoadingResumes(false);
        }
    };

    const handleResumeSelect = (resume: SavedResume) => {
        setSelectedResumeId(resume.id);
        setResumeData(resume.content);
    };

    const handleAnalyze = async () => {
        if (!resumeData) {
            setError("Please load your resume first");
            return;
        }
        if (!jobDescription.trim()) {
            setError("Please provide a job description");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const analysisResult = await analyzeJobAndTailorResume(
                resumeData,
                jobDescription,
                jobTitle || undefined,
                companyName || undefined
            );
            setResult(analysisResult);
        } catch (err: any) {
            setError(err.message || "Failed to analyze and tailor resume");
        } finally {
            setLoading(false);
        }
    };


    return (
        <>
            {loading && <LogoLoader message="Analyzing Job Description and Tailoring Your Resume" />}
            <div className="flex min-h-screen bg-slate-50">
                <Sidebar />
                <div className="flex-1 py-8 px-4 sm:px-8 max-w-7xl mx-auto w-full lg:ml-64">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8"
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
                                <Target className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900">
                                    AI Job Description Analyzer
                                </h1>
                                <p className="text-sm sm:text-base text-slate-600 mt-1">
                                    Automatically tailor your resume to match any job description
                                </p>
                            </div>
                        </div>
                    </motion.div>

                    {error && (
                        <Card className="mb-6 border-red-200 bg-red-50">
                            <CardContent className="pt-6">
                                <div className="flex items-center gap-2 text-red-700">
                                    <XCircle className="w-5 h-5" />
                                    <span>{error}</span>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {!result && (
                        <div className="space-y-6">
                            {/* Resume Selection */}
                            {savedResumes.length > 0 && (
                                <Card className="shadow-lg">
                                    <CardHeader>
                                        <CardTitle>Select Resume</CardTitle>
                                        <CardDescription>
                                            Choose which resume to tailor for this job
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                            {savedResumes.map((resume) => (
                                                <button
                                                    key={resume.id}
                                                    onClick={() => handleResumeSelect(resume)}
                                                    className={`p-4 rounded-lg border-2 text-left transition-all ${
                                                        selectedResumeId === resume.id
                                                            ? "border-blue-500 bg-blue-50"
                                                            : "border-slate-200 hover:border-blue-300 hover:bg-slate-50"
                                                    }`}
                                                >
                                                    <div className="font-semibold text-slate-900">{resume.title}</div>
                                                    <div className="text-xs text-slate-500 mt-1">
                                                        Updated {new Date(resume.updated_at).toLocaleDateString()}
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                        {savedResumes.length === 0 && (
                                            <div className="text-center py-8">
                                                <p className="text-slate-600 mb-4">No saved resumes found</p>
                                                <Link href="/builder">
                                                    <Button>Create Resume</Button>
                                                </Link>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            )}

                            {savedResumes.length === 0 && !loadingResumes && (
                                <Card className="shadow-lg border-2 border-blue-200 bg-blue-50">
                                    <CardContent className="pt-6 text-center">
                                        <FileText className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                                        <h3 className="text-lg font-semibold text-slate-900 mb-2">No Resume Found</h3>
                                        <p className="text-slate-600 mb-4">
                                            You need to create a resume first before tailoring it for jobs
                                        </p>
                                        <Link href="/builder">
                                            <Button className="bg-blue-600 hover:bg-blue-700">
                                                Go to Resume Builder
                                            </Button>
                                        </Link>
                                    </CardContent>
                                </Card>
                            )}

                            {savedResumes.length > 0 && (
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {/* Input Section */}
                                    <Card className="shadow-lg">
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <FileText className="w-5 h-5" />
                                                Job Description
                                            </CardTitle>
                                            <CardDescription>
                                                Paste the job description and we'll automatically tailor your resume
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="job-title">Job Title (Optional)</Label>
                                        <Input
                                            id="job-title"
                                            placeholder="e.g. Senior Software Engineer"
                                            value={jobTitle}
                                            onChange={(e) => setJobTitle(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="company">Company Name (Optional)</Label>
                                        <Input
                                            id="company"
                                            placeholder="e.g. Google"
                                            value={companyName}
                                            onChange={(e) => setCompanyName(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="job-description">Job Description *</Label>
                                        <Textarea
                                            id="job-description"
                                            placeholder="Paste the full job description here..."
                                            value={jobDescription}
                                            onChange={(e) => setJobDescription(e.target.value)}
                                            rows={12}
                                            className="font-mono text-sm"
                                        />
                                    </div>
                                    <Button
                                        onClick={handleAnalyze}
                                        disabled={loading || !jobDescription.trim()}
                                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                                        size="lg"
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                Analyzing...
                                            </>
                                        ) : (
                                            <>
                                                <Target className="w-4 h-4 mr-2" />
                                                Analyze & Tailor Resume
                                            </>
                                        )}
                                    </Button>
                                </CardContent>
                            </Card>

                            {/* Instructions/Info Card */}
                            <Card className="shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <TrendingUp className="w-5 h-5 text-blue-600" />
                                        How It Works
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-3">
                                        <div className="flex items-start gap-3">
                                            <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">
                                                1
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-slate-900">Paste Job Description</h3>
                                                <p className="text-sm text-slate-600">Copy and paste the complete job description from the job posting</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">
                                                2
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-slate-900">AI Analysis</h3>
                                                <p className="text-sm text-slate-600">Our AI analyzes keywords, skills, and requirements</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">
                                                3
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-slate-900">Auto-Tailor Resume</h3>
                                                <p className="text-sm text-slate-600">Get a tailored version optimized for this specific job</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">
                                                4
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-slate-900">Compare & Apply</h3>
                                                <p className="text-sm text-slate-600">See before/after comparison and use the tailored resume</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="pt-4 border-t border-blue-200">
                                        <p className="text-sm text-blue-700 font-medium">
                                            💡 Tip: Make sure you have a resume saved. Go to Resume Builder first if needed.
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Results Section */}
                    {result && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-6"
                        >
                            {/* Match Score Card */}
                            <Card className="shadow-lg border-2 border-blue-200">
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle className="flex items-center gap-2">
                                                <Target className="w-5 h-5 text-blue-600" />
                                                Match Score
                                            </CardTitle>
                                            <CardDescription>How well your resume matches the job description</CardDescription>
                                        </div>
                                        <div className="text-right">
                                        <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-blue-600">
                                            {result.match_score.toFixed(1)}%
                                        </div>
                                            <div className="text-sm text-slate-600">Match</div>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="w-full bg-slate-200 rounded-full h-4">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${result.match_score}%` }}
                                            transition={{ duration: 1, ease: "easeOut" }}
                                            className="bg-gradient-to-r from-blue-500 to-indigo-500 h-4 rounded-full"
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Matched Keywords */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            <CheckCircle className="w-5 h-5 text-green-600" />
                                            Matched Keywords ({result.matched_keywords.length})
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex flex-wrap gap-2">
                                            {result.matched_keywords.map((keyword, idx) => (
                                                <span
                                                    key={idx}
                                                    className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium"
                                                >
                                                    {keyword}
                                                </span>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Missing Keywords */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            <XCircle className="w-5 h-5 text-orange-600" />
                                            Missing Keywords ({result.missing_keywords.length})
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex flex-wrap gap-2">
                                            {result.missing_keywords.map((keyword, idx) => (
                                                <span
                                                    key={idx}
                                                    className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium"
                                                >
                                                    {keyword}
                                                </span>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Recommendations */}
                            {result.recommendations.length > 0 && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg">Recommendations</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <ul className="space-y-2">
                                            {result.recommendations.map((rec, idx) => (
                                                <li key={idx} className="flex items-start gap-3">
                                                    <ArrowRight className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                                    <span className="text-slate-700">{rec}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Improvements Made */}
                            {result.improvements_made.length > 0 && (
                                <Card className="bg-green-50 border-green-200">
                                    <CardHeader>
                                        <CardTitle className="text-lg text-green-800">Improvements Made</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <ul className="space-y-2">
                                            {result.improvements_made.map((improvement, idx) => (
                                                <li key={idx} className="flex items-start gap-3">
                                                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                                    <span className="text-green-700">{improvement}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Tailored Resume Preview */}
                            <Card className="shadow-xl">
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle className="text-lg">Tailored Resume Preview</CardTitle>
                                            <CardDescription>Your resume optimized for this job</CardDescription>
                                        </div>
                                        <Button
                                            onClick={() => {
                                                setResumeData(result.tailored_resume);
                                                setResult(null);
                                            }}
                                            variant="outline"
                                        >
                                            Use This Version
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <ResumePreview
                                        data={result.tailored_resume}
                                        onEdit={() => {}}
                                        template="modern"
                                    />
                                </CardContent>
                            </Card>

                            {/* Reset Button */}
                            <div className="flex justify-center">
                                <Button
                                    onClick={() => {
                                        setResult(null);
                                        setJobDescription("");
                                        setJobTitle("");
                                        setCompanyName("");
                                    }}
                                    variant="outline"
                                    size="lg"
                                >
                                    Analyze Another Job
                                </Button>
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>
        </>
    );
}

