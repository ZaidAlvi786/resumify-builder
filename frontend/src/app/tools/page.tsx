"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Sidebar from "@/components/Sidebar";
import { motion, AnimatePresence } from "framer-motion";
import {
    Loader2,
    Sparkles,
    FileText,
    Target,
    TrendingUp,
    Copy,
    CheckCircle2,
    AlertCircle,
    BookOpen,
    Layers,
    RefreshCw,
} from "lucide-react";
import {
    quantifyAchievement,
    getSummaryVariations,
    expandKeywordSynonyms,
    generateMultiResumePortfolio,
    analyzeSkillGaps,
    type ResumeData,
} from "@/services/api";

type ActiveTab = "quantify" | "summary" | "keywords" | "portfolio" | "skill-gaps";

export default function ToolsPage() {
    const [activeTab, setActiveTab] = useState<ActiveTab>("quantify");
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState<string | null>(null);

    const copyToClipboard = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopied(id);
        setTimeout(() => setCopied(null), 2000);
    };

    return (
        <div className="flex min-h-screen">
            <Sidebar />
            <main className="flex-1 ml-64 p-8 bg-slate-50">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8"
                    >
                        <h1 className="text-4xl font-bold text-slate-900 mb-2">
                            AI-Powered Resume Tools
                        </h1>
                        <p className="text-slate-600">
                            Test and use our latest AI features to enhance your resume
                        </p>
                    </motion.div>

                    {/* Tabs */}
                    <div className="flex gap-2 mb-6 border-b border-slate-200">
                        {[
                            { id: "quantify", label: "Achievement Quantifier", icon: TrendingUp },
                            { id: "summary", label: "Summary Variations", icon: FileText },
                            { id: "keywords", label: "Keyword Expander", icon: Target },
                            { id: "portfolio", label: "Multi-Resume Portfolio", icon: Layers },
                            { id: "skill-gaps", label: "Skill Gap Analyzer", icon: BookOpen },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as ActiveTab)}
                                className={`px-4 py-2 flex items-center gap-2 border-b-2 transition-colors ${
                                    activeTab === tab.id
                                        ? "border-blue-600 text-blue-600 font-semibold"
                                        : "border-transparent text-slate-600 hover:text-slate-900"
                                }`}
                            >
                                <tab.icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Content */}
                    <AnimatePresence mode="wait">
                        {activeTab === "quantify" && (
                            <AchievementQuantifier
                                loading={loading}
                                setLoading={setLoading}
                                copyToClipboard={copyToClipboard}
                                copied={copied}
                            />
                        )}
                        {activeTab === "summary" && (
                            <SummaryVariations
                                loading={loading}
                                setLoading={setLoading}
                                copyToClipboard={copyToClipboard}
                                copied={copied}
                            />
                        )}
                        {activeTab === "keywords" && (
                            <KeywordExpander
                                loading={loading}
                                setLoading={setLoading}
                                copyToClipboard={copyToClipboard}
                                copied={copied}
                            />
                        )}
                        {activeTab === "portfolio" && (
                            <MultiResumePortfolio
                                loading={loading}
                                setLoading={setLoading}
                                copyToClipboard={copyToClipboard}
                                copied={copied}
                            />
                        )}
                        {activeTab === "skill-gaps" && (
                            <SkillGapAnalyzer
                                loading={loading}
                                setLoading={setLoading}
                                copyToClipboard={copyToClipboard}
                                copied={copied}
                            />
                        )}
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
}

// Achievement Quantifier Component
function AchievementQuantifier({
    loading,
    setLoading,
    copyToClipboard,
    copied,
}: {
    loading: boolean;
    setLoading: (v: boolean) => void;
    copyToClipboard: (text: string, id: string) => void;
    copied: string | null;
}) {
    const [achievement, setAchievement] = useState("Improved team productivity");
    const [roleTitle, setRoleTitle] = useState("");
    const [company, setCompany] = useState("");
    const [targetRole, setTargetRole] = useState("");
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState("");

    const handleSubmit = async () => {
        if (!achievement.trim()) {
            setError("Please enter an achievement to quantify");
            return;
        }

        setLoading(true);
        setError("");
        setResult(null);

        try {
            const data = await quantifyAchievement(
                achievement,
                roleTitle || undefined,
                company || undefined,
                targetRole || undefined
            );
            setResult(data);
        } catch (err: any) {
            setError(err.message || "Failed to quantify achievement");
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
        >
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5" />
                        Achievement Quantifier
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Label htmlFor="achievement">Achievement to Quantify</Label>
                        <Textarea
                            id="achievement"
                            value={achievement}
                            onChange={(e) => setAchievement(e.target.value)}
                            placeholder="e.g., Improved team productivity"
                            className="mt-1"
                            rows={3}
                        />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <Label htmlFor="role">Role Title (Optional)</Label>
                            <Input
                                id="role"
                                value={roleTitle}
                                onChange={(e) => setRoleTitle(e.target.value)}
                                placeholder="Software Engineer"
                                className="mt-1"
                            />
                        </div>
                        <div>
                            <Label htmlFor="company">Company (Optional)</Label>
                            <Input
                                id="company"
                                value={company}
                                onChange={(e) => setCompany(e.target.value)}
                                placeholder="Tech Corp"
                                className="mt-1"
                            />
                        </div>
                        <div>
                            <Label htmlFor="target">Target Role (Optional)</Label>
                            <Input
                                id="target"
                                value={targetRole}
                                onChange={(e) => setTargetRole(e.target.value)}
                                placeholder="Senior Engineer"
                                className="mt-1"
                            />
                        </div>
                    </div>

                    <Button onClick={handleSubmit} disabled={loading} className="w-full">
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Quantifying...
                            </>
                        ) : (
                            <>
                                <Sparkles className="mr-2 h-4 w-4" />
                                Quantify Achievement
                            </>
                        )}
                    </Button>

                    {error && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-center gap-2">
                            <AlertCircle className="w-5 h-5" />
                            {error}
                        </div>
                    )}

                    {result && (
                        <div className="space-y-4 mt-6">
                            <h3 className="font-semibold text-lg">Quantified Suggestions</h3>
                            {result.quantified_suggestions?.map((suggestion: any, idx: number) => (
                                <Card key={idx} className="bg-blue-50">
                                    <CardContent className="pt-6">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex-1">
                                                <p className="font-medium text-lg mb-1">
                                                    {suggestion.quantified_version}
                                                </p>
                                                <p className="text-sm text-slate-600 mb-2">
                                                    {suggestion.explanation}
                                                </p>
                                                <div className="flex gap-2 flex-wrap">
                                                    {suggestion.suggested_metrics?.map((m: string, i: number) => (
                                                        <span
                                                            key={i}
                                                            className="px-2 py-1 bg-white rounded text-xs font-medium"
                                                        >
                                                            {m}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() =>
                                                    copyToClipboard(
                                                        suggestion.quantified_version,
                                                        `suggestion-${idx}`
                                                    )
                                                }
                                            >
                                                {copied === `suggestion-${idx}` ? (
                                                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                                                ) : (
                                                    <Copy className="w-4 h-4" />
                                                )}
                                            </Button>
                                        </div>
                                        <div className="mt-2 flex gap-2 text-xs">
                                            <span className="px-2 py-1 bg-blue-100 rounded">
                                                {suggestion.metric_type}
                                            </span>
                                            <span className="px-2 py-1 bg-blue-100 rounded">
                                                {suggestion.confidence} confidence
                                            </span>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    );
}

// Summary Variations Component
function SummaryVariations({
    loading,
    setLoading,
    copyToClipboard,
    copied,
}: {
    loading: boolean;
    setLoading: (v: boolean) => void;
    copyToClipboard: (text: string, id: string) => void;
    copied: string | null;
}) {
    const [resumeText, setResumeText] = useState("");
    const [targetRole, setTargetRole] = useState("");
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState("");

    const handleSubmit = async () => {
        if (!resumeText.trim() || !targetRole.trim()) {
            setError("Please provide resume text and target role");
            return;
        }

        setLoading(true);
        setError("");
        setResult(null);

        try {
            // Create minimal resume data structure
            const resumeData: ResumeData = {
                full_name: "Your Name",
                email: "email@example.com",
                phone: "123-456-7890",
                location: "City, State",
                target_role: targetRole,
                skills: [],
                experience: [],
                education: [],
            };

            const data = await getSummaryVariations(resumeData, targetRole, 10);
            setResult(data);
        } catch (err: any) {
            setError(err.message || "Failed to generate summary variations");
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
        >
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="w-5 h-5" />
                        Summary Variations Generator
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Label htmlFor="resume-text">Resume Text (or use existing resume)</Label>
                        <Textarea
                            id="resume-text"
                            value={resumeText}
                            onChange={(e) => setResumeText(e.target.value)}
                            placeholder="Paste your resume text here..."
                            className="mt-1"
                            rows={6}
                        />
                    </div>

                    <div>
                        <Label htmlFor="target-role-summary">Target Role</Label>
                        <Input
                            id="target-role-summary"
                            value={targetRole}
                            onChange={(e) => setTargetRole(e.target.value)}
                            placeholder="Software Engineer"
                            className="mt-1"
                        />
                    </div>

                    <Button onClick={handleSubmit} disabled={loading} className="w-full">
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Generating Variations...
                            </>
                        ) : (
                            <>
                                <Sparkles className="mr-2 h-4 w-4" />
                                Generate Summary Variations
                            </>
                        )}
                    </Button>

                    {error && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-center gap-2">
                            <AlertCircle className="w-5 h-5" />
                            {error}
                        </div>
                    )}

                    {result && (
                        <div className="space-y-4 mt-6">
                            <div className="flex justify-between items-center">
                                <h3 className="font-semibold text-lg">
                                    {result.variations?.length || 0} Summary Variations
                                </h3>
                                {result.recommended_variation !== undefined && (
                                    <span className="text-sm text-blue-600 font-medium">
                                        Recommended: Variation #{result.recommended_variation + 1}
                                    </span>
                                )}
                            </div>

                            {result.variations?.map((variation: any, idx: number) => (
                                <Card
                                    key={idx}
                                    className={idx === result.recommended_variation ? "border-blue-500 border-2" : ""}
                                >
                                    <CardContent className="pt-6">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex-1">
                                                <div className="flex gap-2 mb-2">
                                                    <span className="px-2 py-1 bg-blue-100 rounded text-xs font-medium">
                                                        {variation.style}
                                                    </span>
                                                    <span className="px-2 py-1 bg-green-100 rounded text-xs font-medium">
                                                        {variation.length}
                                                    </span>
                                                    <span className="px-2 py-1 bg-purple-100 rounded text-xs font-medium">
                                                        {variation.word_count} words
                                                    </span>
                                                </div>
                                                <p className="text-slate-700 mb-2">{variation.summary_text}</p>
                                                {variation.strengths && variation.strengths.length > 0 && (
                                                    <div className="text-sm text-slate-600">
                                                        <strong>Strengths:</strong> {variation.strengths.join(", ")}
                                                    </div>
                                                )}
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() =>
                                                    copyToClipboard(variation.summary_text, `summary-${idx}`)
                                                }
                                            >
                                                {copied === `summary-${idx}` ? (
                                                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                                                ) : (
                                                    <Copy className="w-4 h-4" />
                                                )}
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    );
}

// Keyword Expander Component
function KeywordExpander({
    loading,
    setLoading,
    copyToClipboard,
    copied,
}: {
    loading: boolean;
    setLoading: (v: boolean) => void;
    copyToClipboard: (text: string, id: string) => void;
    copied: string | null;
}) {
    const [resumeText, setResumeText] = useState("");
    const [targetRole, setTargetRole] = useState("");
    const [jobDescription, setJobDescription] = useState("");
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState("");

    const handleSubmit = async () => {
        if (!resumeText.trim() || !targetRole.trim()) {
            setError("Please provide resume text and target role");
            return;
        }

        setLoading(true);
        setError("");
        setResult(null);

        try {
            const data = await expandKeywordSynonyms(
                resumeText,
                targetRole,
                jobDescription || undefined
            );
            setResult(data);
        } catch (err: any) {
            setError(err.message || "Failed to expand keywords");
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
        >
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Target className="w-5 h-5" />
                        Keyword Synonym Expander
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Label htmlFor="resume-keywords">Resume Text</Label>
                        <Textarea
                            id="resume-keywords"
                            value={resumeText}
                            onChange={(e) => setResumeText(e.target.value)}
                            placeholder="Paste your resume text here..."
                            className="mt-1"
                            rows={6}
                        />
                    </div>

                    <div>
                        <Label htmlFor="target-keywords">Target Role</Label>
                        <Input
                            id="target-keywords"
                            value={targetRole}
                            onChange={(e) => setTargetRole(e.target.value)}
                            placeholder="Software Engineer"
                            className="mt-1"
                        />
                    </div>

                    <div>
                        <Label htmlFor="jd-keywords">Job Description (Optional)</Label>
                        <Textarea
                            id="jd-keywords"
                            value={jobDescription}
                            onChange={(e) => setJobDescription(e.target.value)}
                            placeholder="Paste job description for better keyword matching..."
                            className="mt-1"
                            rows={4}
                        />
                    </div>

                    <Button onClick={handleSubmit} disabled={loading} className="w-full">
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Expanding Keywords...
                            </>
                        ) : (
                            <>
                                <Sparkles className="mr-2 h-4 w-4" />
                                Expand Keywords
                            </>
                        )}
                    </Button>

                    {error && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-center gap-2">
                            <AlertCircle className="w-5 h-5" />
                            {error}
                        </div>
                    )}

                    {result && (
                        <div className="space-y-6 mt-6">
                            <div>
                                <h3 className="font-semibold text-lg mb-4">Keyword Synonyms</h3>
                                <div className="grid gap-4">
                                    {result.keyword_synonyms?.map((synonym: any, idx: number) => (
                                        <Card key={idx}>
                                            <CardContent className="pt-6">
                                                <div className="flex justify-between items-start">
                                                    <div className="flex-1">
                                                        <h4 className="font-medium mb-2">{synonym.original_keyword}</h4>
                                                        <div className="flex gap-2 flex-wrap mb-2">
                                                            {synonym.synonyms?.map((s: string, i: number) => (
                                                                <span
                                                                    key={i}
                                                                    className="px-2 py-1 bg-blue-100 rounded text-sm"
                                                                >
                                                                    {s}
                                                                </span>
                                                            ))}
                                                        </div>
                                                        <p className="text-sm text-slate-600">{synonym.context}</p>
                                                        <span className="inline-block mt-2 px-2 py-1 bg-green-100 rounded text-xs">
                                                            ATS Impact: {synonym.ats_impact}
                                                        </span>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </div>

                            {result.recommendations && result.recommendations.length > 0 && (
                                <Card className="bg-blue-50">
                                    <CardHeader>
                                        <CardTitle className="text-lg">Recommendations</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <ul className="list-disc list-inside space-y-1">
                                            {result.recommendations.map((rec: string, idx: number) => (
                                                <li key={idx} className="text-slate-700">
                                                    {rec}
                                                </li>
                                            ))}
                                        </ul>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    );
}

// Multi-Resume Portfolio Component (Simplified - requires full resume data)
function MultiResumePortfolio({
    loading,
    setLoading,
    copyToClipboard,
    copied,
}: {
    loading: boolean;
    setLoading: (v: boolean) => void;
    copyToClipboard: (text: string, id: string) => void;
    copied: string | null;
}) {
    const [error, setError] = useState("");

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
        >
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Layers className="w-5 h-5" />
                        Multi-Resume Portfolio Generator
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-slate-600 mb-4">
                        This feature requires a complete resume. Please use the Resume Builder first, then
                        return here to generate multiple versions.
                    </p>
                    <Button onClick={() => (window.location.href = "/builder")}>
                        Go to Resume Builder
                    </Button>
                </CardContent>
            </Card>
        </motion.div>
    );
}

// Skill Gap Analyzer Component
function SkillGapAnalyzer({
    loading,
    setLoading,
    copyToClipboard,
    copied,
}: {
    loading: boolean;
    setLoading: (v: boolean) => void;
    copyToClipboard: (text: string, id: string) => void;
    copied: string | null;
}) {
    const [resumeText, setResumeText] = useState("");
    const [targetRole, setTargetRole] = useState("");
    const [jobDescription, setJobDescription] = useState("");
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState("");

    const handleSubmit = async () => {
        if (!resumeText.trim() || !targetRole.trim()) {
            setError("Please provide resume text and target role");
            return;
        }

        setLoading(true);
        setError("");
        setResult(null);

        try {
            const data = await analyzeSkillGaps(
                resumeText,
                targetRole,
                jobDescription || undefined
            );
            setResult(data);
        } catch (err: any) {
            setError(err.message || "Failed to analyze skill gaps");
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
        >
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BookOpen className="w-5 h-5" />
                        Skill Gap Analyzer with Learning Paths
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Label htmlFor="resume-skills">Resume Text</Label>
                        <Textarea
                            id="resume-skills"
                            value={resumeText}
                            onChange={(e) => setResumeText(e.target.value)}
                            placeholder="Paste your resume text here..."
                            className="mt-1"
                            rows={6}
                        />
                    </div>

                    <div>
                        <Label htmlFor="target-skills">Target Role</Label>
                        <Input
                            id="target-skills"
                            value={targetRole}
                            onChange={(e) => setTargetRole(e.target.value)}
                            placeholder="Senior Software Engineer"
                            className="mt-1"
                        />
                    </div>

                    <div>
                        <Label htmlFor="jd-skills">Job Description (Optional)</Label>
                        <Textarea
                            id="jd-skills"
                            value={jobDescription}
                            onChange={(e) => setJobDescription(e.target.value)}
                            placeholder="Paste job description for better analysis..."
                            className="mt-1"
                            rows={4}
                        />
                    </div>

                    <Button onClick={handleSubmit} disabled={loading} className="w-full">
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Analyzing Skill Gaps...
                            </>
                        ) : (
                            <>
                                <Sparkles className="mr-2 h-4 w-4" />
                                Analyze Skill Gaps
                            </>
                        )}
                    </Button>

                    {error && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-center gap-2">
                            <AlertCircle className="w-5 h-5" />
                            {error}
                        </div>
                    )}

                    {result && (
                        <div className="space-y-6 mt-6">
                            <Card className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
                                <CardContent className="pt-6">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="text-sm opacity-90">Overall Readiness Score</p>
                                            <p className="text-4xl font-bold">{result.overall_readiness_score}%</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm opacity-90">Timeline Estimate</p>
                                            <p className="text-xl font-semibold">{result.timeline_estimate}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {result.skill_gaps && result.skill_gaps.length > 0 && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Missing Skills</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex gap-2 flex-wrap">
                                            {result.skill_gaps.map((skill: string, idx: number) => (
                                                <span
                                                    key={idx}
                                                    className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium"
                                                >
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {result.learning_paths && result.learning_paths.length > 0 && (
                                <div>
                                    <h3 className="font-semibold text-lg mb-4">Learning Paths</h3>
                                    <div className="space-y-4">
                                        {result.learning_paths.map((path: any, idx: number) => (
                                            <Card key={idx}>
                                                <CardHeader>
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <CardTitle className="text-lg">{path.skill_name}</CardTitle>
                                                            <p className="text-sm text-slate-600 mt-1">
                                                                {path.current_level} → {path.target_level}
                                                            </p>
                                                        </div>
                                                        <div className="text-right">
                                                            <span className="px-2 py-1 bg-blue-100 rounded text-xs font-medium">
                                                                Priority: {path.priority}/5
                                                            </span>
                                                            <p className="text-sm text-slate-600 mt-1">
                                                                {path.estimated_time}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </CardHeader>
                                                <CardContent>
                                                    <div className="space-y-3">
                                                        {path.learning_resources?.map((resource: any, rIdx: number) => (
                                                            <div
                                                                key={rIdx}
                                                                className="p-3 bg-slate-50 rounded-lg border"
                                                            >
                                                                <div className="flex justify-between items-start">
                                                                    <div className="flex-1">
                                                                        <h4 className="font-medium">{resource.title}</h4>
                                                                        <p className="text-sm text-slate-600 mt-1">
                                                                            {resource.description}
                                                                        </p>
                                                                        <div className="flex gap-2 mt-2">
                                                                            {resource.provider && (
                                                                                <span className="text-xs px-2 py-1 bg-blue-100 rounded">
                                                                                    {resource.provider}
                                                                                </span>
                                                                            )}
                                                                            {resource.duration && (
                                                                                <span className="text-xs px-2 py-1 bg-green-100 rounded">
                                                                                    {resource.duration}
                                                                                </span>
                                                                            )}
                                                                            {resource.cost && (
                                                                                <span className="text-xs px-2 py-1 bg-purple-100 rounded">
                                                                                    {resource.cost}
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {result.recommendations && result.recommendations.length > 0 && (
                                <Card className="bg-green-50">
                                    <CardHeader>
                                        <CardTitle className="text-lg">Recommendations</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <ul className="list-disc list-inside space-y-2">
                                            {result.recommendations.map((rec: string, idx: number) => (
                                                <li key={idx} className="text-slate-700">
                                                    {rec}
                                                </li>
                                            ))}
                                        </ul>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    );
}

