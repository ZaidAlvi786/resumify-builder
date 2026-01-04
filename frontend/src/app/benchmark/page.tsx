"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { benchmarkAgainstIndustry, BenchmarkComparison } from "@/services/api";
import { Loader2, TrendingUp, TrendingDown, Minus, Lightbulb, BarChart3 } from "lucide-react";
import { motion } from "framer-motion";

export default function BenchmarkPage() {
    const [resumeText, setResumeText] = useState("");
    const [targetRole, setTargetRole] = useState("");
    const [industry, setIndustry] = useState("");
    const [loading, setLoading] = useState(false);
    const [benchmark, setBenchmark] = useState<any>(null);
    const [error, setError] = useState("");

    const getStatusIcon = (status: string) => {
        switch (status.toLowerCase()) {
            case "above_average":
                return <TrendingUp className="h-5 w-5 text-green-600" />;
            case "below_average":
                return <TrendingDown className="h-5 w-5 text-red-600" />;
            default:
                return <Minus className="h-5 w-5 text-yellow-600" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case "above_average":
                return "text-green-600 bg-green-50 border-green-200";
            case "below_average":
                return "text-red-600 bg-red-50 border-red-200";
            default:
                return "text-yellow-600 bg-yellow-50 border-yellow-200";
        }
    };

    const handleBenchmark = async () => {
        if (!resumeText.trim() || !targetRole.trim() || !industry.trim()) {
            setError("Please provide resume text, target role, and industry");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const result = await benchmarkAgainstIndustry(resumeText, targetRole, industry);
            setBenchmark(result);
        } catch (err: any) {
            setError(err.message || "Failed to benchmark resume");
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
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 mb-2">
                        Industry Benchmarking
                    </h1>
                    <p className="text-slate-600">
                        Compare your resume against industry standards and see how you stack up
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Your Information</CardTitle>
                            <CardDescription>
                                Enter your resume details to benchmark against industry standards
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label htmlFor="industry">Industry *</Label>
                                <Input
                                    id="industry"
                                    value={industry}
                                    onChange={(e) => setIndustry(e.target.value)}
                                    placeholder="e.g., Technology, Finance, Healthcare"
                                />
                            </div>
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
                                onClick={handleBenchmark}
                                disabled={loading}
                                className="w-full"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Benchmarking...
                                    </>
                                ) : (
                                    <>
                                        <BarChart3 className="mr-2 h-4 w-4" />
                                        Benchmark Resume
                                    </>
                                )}
                            </Button>
                        </CardContent>
                    </Card>

                    <div className="space-y-6">
                        {benchmark ? (
                            <>
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Industry: {benchmark.industry}</CardTitle>
                                        <CardDescription>
                                            Your resume performance compared to industry standards
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {benchmark.comparisons.map((comp: BenchmarkComparison, idx: number) => (
                                            <motion.div
                                                key={idx}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: idx * 0.1 }}
                                                className={`border-2 rounded-lg p-4 ${getStatusColor(comp.status)}`}
                                            >
                                                <div className="flex items-start justify-between mb-3">
                                                    <div className="flex items-center gap-2">
                                                        {getStatusIcon(comp.status)}
                                                        <h4 className="font-semibold">{comp.metric}</h4>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-2xl font-bold">{comp.your_score}</div>
                                                        <div className="text-sm opacity-75">Industry Avg: {comp.industry_average}</div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm">
                                                    <span className="font-medium">Percentile:</span>
                                                    <div className="flex-1 bg-white/50 rounded-full h-2 overflow-hidden">
                                                        <div
                                                            className="bg-current h-full transition-all duration-500"
                                                            style={{ width: `${comp.percentile}%` }}
                                                        />
                                                    </div>
                                                    <span className="font-semibold">{comp.percentile}%</span>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </CardContent>
                                </Card>

                                {benchmark.recommendations.length > 0 && (
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <Lightbulb className="h-5 w-5" />
                                                Recommendations
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <ul className="space-y-2">
                                                {benchmark.recommendations.map((rec: string, idx: number) => (
                                                    <li key={idx} className="flex items-start gap-2">
                                                        <span className="text-blue-500 mt-1">•</span>
                                                        <span className="text-slate-700">{rec}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </CardContent>
                                    </Card>
                                )}

                                {benchmark.industry_insights.length > 0 && (
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Industry Insights</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <ul className="space-y-2">
                                                {benchmark.industry_insights.map((insight: string, idx: number) => (
                                                    <li key={idx} className="flex items-start gap-2">
                                                        <span className="text-purple-500 mt-1">•</span>
                                                        <span className="text-slate-700">{insight}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </CardContent>
                                    </Card>
                                )}
                            </>
                        ) : (
                            <Card>
                                <CardContent className="flex items-center justify-center min-h-[400px]">
                                    <div className="text-center text-slate-400">
                                        <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                        <p>Enter your information and click "Benchmark Resume" to see how you compare</p>
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

