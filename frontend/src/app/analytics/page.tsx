"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getResumeAnalytics } from "@/services/api";
import { Loader2, BarChart3, TrendingUp, FileText, Target, Zap } from "lucide-react";
import { motion } from "framer-motion";

export default function AnalyticsPage() {
    const [resumeText, setResumeText] = useState("");
    const [targetRole, setTargetRole] = useState("");
    const [loading, setLoading] = useState(false);
    const [analytics, setAnalytics] = useState<any>(null);
    const [error, setError] = useState("");

    const handleAnalyze = async () => {
        if (!resumeText.trim() || !targetRole.trim()) {
            setError("Please provide both resume text and target role");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const result = await getResumeAnalytics(resumeText, targetRole);
            setAnalytics(result);
        } catch (err: any) {
            setError(err.message || "Failed to analyze resume");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-slate-50">
            <Sidebar />
            <div className="flex-1 py-8 px-4 sm:px-8 max-w-6xl mx-auto w-full lg:ml-64">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h1 className="text-4xl font-bold text-slate-900 mb-2">
                        Resume Analytics Dashboard
                    </h1>
                    <p className="text-slate-600">
                        Comprehensive analytics and metrics to optimize your resume performance
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Card className="lg:col-span-1">
                        <CardHeader>
                            <CardTitle>Input</CardTitle>
                            <CardDescription>
                                Enter your resume details
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label htmlFor="targetRole">Target Role *</Label>
                                <Input
                                    id="targetRole"
                                    value={targetRole}
                                    onChange={(e) => setTargetRole(e.target.value)}
                                    placeholder="e.g., Software Engineer"
                                />
                            </div>
                            <div>
                                <Label htmlFor="resume">Resume Text *</Label>
                                <Textarea
                                    id="resume"
                                    value={resumeText}
                                    onChange={(e) => setResumeText(e.target.value)}
                                    placeholder="Paste your resume text here..."
                                    className="min-h-[300px]"
                                />
                            </div>
                            {error && (
                                <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
                                    {error}
                                </div>
                            )}
                            <Button
                                onClick={handleAnalyze}
                                disabled={loading}
                                className="w-full"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Analyzing...
                                    </>
                                ) : (
                                    <>
                                        <BarChart3 className="mr-2 h-4 w-4" />
                                        Analyze Resume
                                    </>
                                )}
                            </Button>
                        </CardContent>
                    </Card>

                    <div className="lg:col-span-2 space-y-6">
                        {analytics ? (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <Card>
                                        <CardContent className="pt-6">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-sm text-slate-600 mb-1">ATS Score</p>
                                                    <p className="text-3xl font-bold">{analytics.ats_score}</p>
                                                </div>
                                                <Target className="h-8 w-8 text-blue-500" />
                                            </div>
                                        </CardContent>
                                    </Card>
                                    <Card>
                                        <CardContent className="pt-6">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-sm text-slate-600 mb-1">Readability</p>
                                                    <p className="text-3xl font-bold">{analytics.readability_score}</p>
                                                </div>
                                                <FileText className="h-8 w-8 text-green-500" />
                                            </div>
                                        </CardContent>
                                    </Card>
                                    <Card>
                                        <CardContent className="pt-6">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-sm text-slate-600 mb-1">Word Count</p>
                                                    <p className="text-3xl font-bold">{analytics.word_count}</p>
                                                </div>
                                                <TrendingUp className="h-8 w-8 text-purple-500" />
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>

                                {analytics.estimated_interview_rate !== undefined && (
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <Zap className="h-5 w-5" />
                                                Estimated Interview Rate
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="flex items-center gap-4">
                                                <div className="text-4xl font-bold text-blue-600">
                                                    {(analytics.estimated_interview_rate * 100).toFixed(1)}%
                                                </div>
                                                <div className="flex-1 bg-slate-200 rounded-full h-4">
                                                    <div
                                                        className="bg-blue-600 h-4 rounded-full transition-all duration-500"
                                                        style={{ width: `${analytics.estimated_interview_rate * 100}%` }}
                                                    />
                                                </div>
                                            </div>
                                            <p className="text-sm text-slate-600 mt-2">
                                                Based on industry data and your resume metrics
                                            </p>
                                        </CardContent>
                                    </Card>
                                )}

                                {Object.keys(analytics.keyword_density).length > 0 && (
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Keyword Density</CardTitle>
                                            <CardDescription>
                                                Top keywords found in your resume
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-2">
                                                {Object.entries(analytics.keyword_density)
                                                    .sort(([, a], [, b]) => (b as number) - (a as number))
                                                    .slice(0, 10)
                                                    .map(([keyword, density]) => (
                                                        <div key={keyword} className="flex items-center justify-between">
                                                            <span className="text-sm font-medium">{keyword}</span>
                                                            <div className="flex items-center gap-2 w-32">
                                                                <div className="flex-1 bg-slate-200 rounded-full h-2">
                                                                    <div
                                                                        className="bg-blue-600 h-2 rounded-full"
                                                                        style={{ width: `${Math.min((density as number) * 10, 100)}%` }}
                                                                    />
                                                                </div>
                                                                <span className="text-xs text-slate-600 w-8">{(density as number).toFixed(1)}%</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}

                                {Object.keys(analytics.sections_completeness).length > 0 && (
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Section Completeness</CardTitle>
                                            <CardDescription>
                                                How complete each section of your resume is
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-3">
                                            {Object.entries(analytics.sections_completeness).map(([section, score]) => (
                                                <div key={section}>
                                                    <div className="flex items-center justify-between mb-1">
                                                        <span className="text-sm font-medium capitalize">{section.replace(/_/g, ' ')}</span>
                                                        <span className="text-sm text-slate-600">{score}%</span>
                                                    </div>
                                                    <div className="w-full bg-slate-200 rounded-full h-2">
                                                        <div
                                                            className="bg-green-600 h-2 rounded-full transition-all duration-500"
                                                            style={{ width: `${score}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </CardContent>
                                    </Card>
                                )}

                                <Card>
                                    <CardHeader>
                                        <CardTitle>Improvement Potential</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex items-center gap-4">
                                            <div className="text-4xl font-bold text-orange-600">
                                                +{analytics.improvement_potential}%
                                            </div>
                                            <p className="text-sm text-slate-600">
                                                Potential ATS score improvement with optimizations
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </>
                        ) : (
                            <Card>
                                <CardContent className="flex items-center justify-center min-h-[400px]">
                                    <div className="text-center text-slate-400">
                                        <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                        <p>Enter your resume and target role to see analytics</p>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

