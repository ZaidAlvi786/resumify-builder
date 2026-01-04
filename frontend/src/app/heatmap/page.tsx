"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getResumeHeatMap, SectionScore } from "@/services/api";
import { Loader2, Map, CheckCircle, AlertCircle, XCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function HeatMapPage() {
    const [resumeText, setResumeText] = useState("");
    const [targetRole, setTargetRole] = useState("");
    const [loading, setLoading] = useState(false);
    const [heatMap, setHeatMap] = useState<any>(null);
    const [error, setError] = useState("");

    const getStrengthColor = (strength: string) => {
        switch (strength.toLowerCase()) {
            case "strong":
                return "bg-green-500";
            case "moderate":
                return "bg-yellow-500";
            case "weak":
                return "bg-red-500";
            default:
                return "bg-slate-300";
        }
    };

    const getStrengthBg = (strength: string) => {
        switch (strength.toLowerCase()) {
            case "strong":
                return "bg-green-50 border-green-200";
            case "moderate":
                return "bg-yellow-50 border-yellow-200";
            case "weak":
                return "bg-red-50 border-red-200";
            default:
                return "bg-slate-50 border-slate-200";
        }
    };

    const getStrengthIcon = (strength: string) => {
        switch (strength.toLowerCase()) {
            case "strong":
                return <CheckCircle className="h-5 w-5 text-green-600" />;
            case "moderate":
                return <AlertCircle className="h-5 w-5 text-yellow-600" />;
            case "weak":
                return <XCircle className="h-5 w-5 text-red-600" />;
            default:
                return null;
        }
    };

    const handleGenerate = async () => {
        if (!resumeText.trim() || !targetRole.trim()) {
            setError("Please provide both resume text and target role");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const result = await getResumeHeatMap(resumeText, targetRole);
            setHeatMap(result);
        } catch (err: any) {
            setError(err.message || "Failed to generate heat map");
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
                        Resume Heat Map
                    </h1>
                    <p className="text-slate-600">
                        Visualize your resume strength by section to identify areas for improvement
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Card className="lg:col-span-1">
                        <CardHeader>
                            <CardTitle>Resume Input</CardTitle>
                            <CardDescription>
                                Enter your resume and target role
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label htmlFor="targetRole">Target Role *</Label>
                                <Input
                                    id="targetRole"
                                    value={targetRole}
                                    onChange={(e) => setTargetRole(e.target.value)}
                                    placeholder="e.g., Senior Software Engineer"
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
                                onClick={handleGenerate}
                                disabled={loading}
                                className="w-full"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Generating...
                                    </>
                                ) : (
                                    <>
                                        <Map className="mr-2 h-4 w-4" />
                                        Generate Heat Map
                                    </>
                                )}
                            </Button>
                        </CardContent>
                    </Card>

                    <div className="lg:col-span-2 space-y-6">
                        {heatMap ? (
                            <>
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Overall Score</CardTitle>
                                        <CardDescription>
                                            Resume strength across all sections
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex items-center gap-4">
                                            <div className="relative w-32 h-32">
                                                <svg className="transform -rotate-90 w-32 h-32">
                                                    <circle
                                                        cx="64"
                                                        cy="64"
                                                        r="56"
                                                        stroke="currentColor"
                                                        strokeWidth="8"
                                                        fill="none"
                                                        className="text-slate-200"
                                                    />
                                                    <circle
                                                        cx="64"
                                                        cy="64"
                                                        r="56"
                                                        stroke="currentColor"
                                                        strokeWidth="8"
                                                        fill="none"
                                                        strokeDasharray={`${(heatMap.overall_score / 100) * 351.86} 351.86`}
                                                        className="text-blue-600 transition-all duration-500"
                                                    />
                                                </svg>
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <span className="text-3xl font-bold text-slate-900">
                                                        {heatMap.overall_score}
                                                    </span>
                                                </div>
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-semibold mb-2">Section Breakdown</h3>
                                                <p className="text-sm text-slate-600">
                                                    Your resume scores {heatMap.overall_score}% overall. Review each section below for detailed feedback.
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <div className="space-y-4">
                                    {heatMap.section_scores.map((section: SectionScore, idx: number) => (
                                        <motion.div
                                            key={idx}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.1 }}
                                        >
                                            <Card className={getStrengthBg(section.strength_level)}>
                                                <CardHeader>
                                                    <div className="flex items-center justify-between">
                                                        <CardTitle className="flex items-center gap-2">
                                                            {getStrengthIcon(section.strength_level)}
                                                            {section.section_name}
                                                        </CardTitle>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-2xl font-bold">{section.score}</span>
                                                            <span className="text-slate-500">/100</span>
                                                        </div>
                                                    </div>
                                                </CardHeader>
                                                <CardContent className="space-y-4">
                                                    <div className="w-full bg-slate-200 rounded-full h-2">
                                                        <div
                                                            className={`h-2 rounded-full transition-all duration-500 ${getStrengthColor(section.strength_level)}`}
                                                            style={{ width: `${section.score}%` }}
                                                        />
                                                    </div>
                                                    <p className="text-sm text-slate-700">{section.feedback}</p>
                                                    
                                                    {section.keywords_found.length > 0 && (
                                                        <div>
                                                            <h4 className="text-sm font-semibold text-green-700 mb-2">Keywords Found:</h4>
                                                            <div className="flex flex-wrap gap-2">
                                                                {section.keywords_found.map((keyword, kwIdx) => (
                                                                    <span
                                                                        key={kwIdx}
                                                                        className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs"
                                                                    >
                                                                        {keyword}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {section.keywords_missing.length > 0 && (
                                                        <div>
                                                            <h4 className="text-sm font-semibold text-red-700 mb-2">Missing Keywords:</h4>
                                                            <div className="flex flex-wrap gap-2">
                                                                {section.keywords_missing.map((keyword, kwIdx) => (
                                                                    <span
                                                                        key={kwIdx}
                                                                        className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs"
                                                                    >
                                                                        {keyword}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </CardContent>
                                            </Card>
                                        </motion.div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <Card>
                                <CardContent className="flex items-center justify-center min-h-[400px]">
                                    <div className="text-center text-slate-400">
                                        <Map className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                        <p>Enter your resume and target role to generate a heat map</p>
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

