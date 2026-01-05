"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { analyzeCareerTrends } from "@/services/api";
import { Loader2, TrendingUp, AlertCircle, Sparkles, Target, BarChart3 } from "lucide-react";
import { motion } from "framer-motion";
import ProtectedRoute from "@/components/ProtectedRoute";

function CareerTrendsPageContent() {
    const [resumeText, setResumeText] = useState("");
    const [currentRole, setCurrentRole] = useState("");
    const [industry, setIndustry] = useState("");
    const [yearsOfExperience, setYearsOfExperience] = useState<string>("");
    const [targetRoles, setTargetRoles] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState("");

    const handleAnalyze = async () => {
        if (!resumeText.trim() || !currentRole.trim()) {
            setError("Please provide resume text and current role");
            return;
        }

        setLoading(true);
        setError("");
        setResult(null);

        try {
            const targetRolesList = targetRoles
                ? targetRoles.split(",").map((r) => r.trim()).filter(Boolean)
                : undefined;

            const data = await analyzeCareerTrends(
                resumeText,
                currentRole,
                industry || undefined,
                yearsOfExperience ? parseInt(yearsOfExperience) : undefined,
                targetRolesList,
                12
            );
            setResult(data);
        } catch (err: any) {
            setError(err.message || "Failed to analyze career trends");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-slate-50">
            <Sidebar />
            <div className="flex-1 py-8 px-4 sm:px-8 max-w-7xl mx-auto w-full lg:ml-64">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
                            <TrendingUp className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold text-slate-900">AI Career Trend Analyzer</h1>
                            <p className="text-slate-600 mt-1">
                                Analyze industry trends and predict in-demand skills for your career
                            </p>
                        </div>
                    </div>
                </motion.div>

                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>Input Information</CardTitle>
                        <CardDescription>
                            Enter your resume details to analyze career trends and get future-proofing recommendations
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label htmlFor="resume-text">Resume Text *</Label>
                            <Textarea
                                id="resume-text"
                                value={resumeText}
                                onChange={(e) => setResumeText(e.target.value)}
                                placeholder="Paste your resume text here..."
                                className="mt-1"
                                rows={6}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="current-role">Current Role *</Label>
                                <Input
                                    id="current-role"
                                    value={currentRole}
                                    onChange={(e) => setCurrentRole(e.target.value)}
                                    placeholder="Software Engineer"
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label htmlFor="industry">Industry (Optional)</Label>
                                <Input
                                    id="industry"
                                    value={industry}
                                    onChange={(e) => setIndustry(e.target.value)}
                                    placeholder="Technology"
                                    className="mt-1"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="experience">Years of Experience (Optional)</Label>
                                <Input
                                    id="experience"
                                    type="number"
                                    value={yearsOfExperience}
                                    onChange={(e) => setYearsOfExperience(e.target.value)}
                                    placeholder="5"
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label htmlFor="target-roles">Target Roles (Optional, comma-separated)</Label>
                                <Input
                                    id="target-roles"
                                    value={targetRoles}
                                    onChange={(e) => setTargetRoles(e.target.value)}
                                    placeholder="Senior Engineer, Tech Lead"
                                    className="mt-1"
                                />
                            </div>
                        </div>

                        <Button
                            onClick={handleAnalyze}
                            disabled={loading}
                            className="w-full md:w-auto bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Analyzing Trends...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="mr-2 h-4 w-4" />
                                    Analyze Career Trends
                                </>
                            )}
                        </Button>

                        {error && (
                            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-center gap-2">
                                <AlertCircle className="w-5 h-5" />
                                {error}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {result && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        {/* Future-Proof Score */}
                        <Card className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 shadow-lg">
                            <CardContent className="pt-6">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="text-sm opacity-90 mb-1">Future-Proof Score</p>
                                        <p className="text-5xl font-bold">{result.future_proof_score}%</p>
                                        <p className="text-sm opacity-90 mt-2">
                                            Based on industry trends for {result.prediction_period.toLowerCase()}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <BarChart3 className="h-16 w-16 opacity-50" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Skill Trends */}
                        {result.skill_trends && result.skill_trends.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Skill Trends Analysis</CardTitle>
                                    <CardDescription>
                                        Skills that are growing, stable, or declining in demand
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {result.skill_trends.map((trend: any, idx: number) => (
                                            <div key={idx} className="p-4 bg-slate-50 rounded-lg border">
                                                <div className="flex justify-between items-start mb-3">
                                                    <h4 className="font-semibold text-lg">{trend.skill_name}</h4>
                                                    <div className="flex gap-2">
                                                        <span
                                                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                                trend.predicted_demand === "increasing"
                                                                    ? "bg-green-100 text-green-700"
                                                                    : trend.predicted_demand === "stable"
                                                                    ? "bg-blue-100 text-blue-700"
                                                                    : "bg-red-100 text-red-700"
                                                            }`}
                                                        >
                                                            {trend.predicted_demand}
                                                        </span>
                                                        {trend.growth_rate && (
                                                            <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                                                                {trend.growth_rate}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <p className="text-sm text-slate-600 mb-2">{trend.reason}</p>
                                                <div className="flex gap-4 text-xs text-slate-500">
                                                    <span>
                                                        <strong>Timeline:</strong> {trend.demand_timeline}
                                                    </span>
                                                    <span>
                                                        <strong>Impact:</strong> {trend.industry_impact}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Emerging vs Declining Skills */}
                        {(result.emerging_skills?.length > 0 || result.declining_skills?.length > 0) && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {result.emerging_skills && result.emerging_skills.length > 0 && (
                                    <Card className="bg-green-50 border-green-200">
                                        <CardHeader>
                                            <CardTitle className="text-green-800">Emerging Skills</CardTitle>
                                            <CardDescription className="text-green-700">
                                                Skills that will be in high demand
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="flex gap-2 flex-wrap">
                                                {result.emerging_skills.map((skill: string, idx: number) => (
                                                    <span
                                                        key={idx}
                                                        className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium"
                                                    >
                                                        {skill}
                                                    </span>
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}

                                {result.declining_skills && result.declining_skills.length > 0 && (
                                    <Card className="bg-red-50 border-red-200">
                                        <CardHeader>
                                            <CardTitle className="text-red-800">Declining Skills</CardTitle>
                                            <CardDescription className="text-red-700">
                                                Skills becoming less relevant
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="flex gap-2 flex-wrap">
                                                {result.declining_skills.map((skill: string, idx: number) => (
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
                            </div>
                        )}

                        {/* Resume Recommendations */}
                        {result.resume_recommendations && result.resume_recommendations.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Resume Recommendations</CardTitle>
                                    <CardDescription>
                                        Prioritized actions to future-proof your resume
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {result.resume_recommendations
                                            .sort((a: any, b: any) => b.priority - a.priority)
                                            .map((rec: any, idx: number) => (
                                                <div
                                                    key={idx}
                                                    className="p-4 bg-blue-50 rounded-lg border border-blue-200"
                                                >
                                                    <div className="flex justify-between items-start mb-2">
                                                        <div className="flex-1">
                                                            <h4 className="font-semibold text-lg mb-1">{rec.action}</h4>
                                                            <p className="text-sm text-slate-600 mb-2">{rec.reason}</p>
                                                            <p className="text-xs text-blue-700 font-medium">
                                                                Expected Impact: {rec.expected_impact}
                                                            </p>
                                                        </div>
                                                        <span className="px-3 py-1 bg-blue-200 rounded-full text-xs font-medium whitespace-nowrap ml-4">
                                                            Priority: {rec.priority}/5
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Action Plan */}
                        {result.action_plan && result.action_plan.length > 0 && (
                            <Card className="bg-indigo-50 border-indigo-200">
                                <CardHeader>
                                    <CardTitle className="text-indigo-800">Action Plan</CardTitle>
                                    <CardDescription className="text-indigo-700">
                                        Steps to stay competitive in the job market
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ol className="list-decimal list-inside space-y-3">
                                        {result.action_plan.map((action: string, idx: number) => (
                                            <li key={idx} className="text-slate-700 font-medium">
                                                {action}
                                            </li>
                                        ))}
                                    </ol>
                                </CardContent>
                            </Card>
                        )}

                        {/* Market Insights */}
                        {result.market_insights && result.market_insights.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Market Insights</CardTitle>
                                    <CardDescription>Key trends affecting your industry</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ul className="list-disc list-inside space-y-2">
                                        {result.market_insights.map((insight: string, idx: number) => (
                                            <li key={idx} className="text-slate-700">
                                                {insight}
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                            </Card>
                        )}
                    </motion.div>
                )}
            </div>
        </div>
    );
}

export default function CareerTrendsPage() {
    return (
        <ProtectedRoute>
            <CareerTrendsPageContent />
        </ProtectedRoute>
    );
}

