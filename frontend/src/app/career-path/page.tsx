"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { predictCareerPath, CareerPathStep } from "@/services/api";
import { Loader2, TrendingUp, BookOpen, Target, ArrowRight, Clock } from "lucide-react";
import { motion } from "framer-motion";

export default function CareerPathPage() {
    const [resumeText, setResumeText] = useState("");
    const [currentRole, setCurrentRole] = useState("");
    const [yearsOfExperience, setYearsOfExperience] = useState<number | undefined>();
    const [loading, setLoading] = useState(false);
    const [careerPath, setCareerPath] = useState<any>(null);
    const [error, setError] = useState("");

    const handlePredict = async () => {
        if (!resumeText.trim() || !currentRole.trim()) {
            setError("Please provide both resume text and current role");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const result = await predictCareerPath(resumeText, currentRole, yearsOfExperience);
            setCareerPath(result);
        } catch (err: any) {
            setError(err.message || "Failed to predict career path");
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
                        AI Career Path Predictor
                    </h1>
                    <p className="text-slate-600">
                        Discover your next career steps with AI-powered predictions based on your resume
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Your Information</CardTitle>
                            <CardDescription>
                                Enter your resume and current role to predict your career path
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label htmlFor="currentRole">Current Role *</Label>
                                <Input
                                    id="currentRole"
                                    value={currentRole}
                                    onChange={(e) => setCurrentRole(e.target.value)}
                                    placeholder="e.g., Software Engineer"
                                />
                            </div>
                            <div>
                                <Label htmlFor="yearsExp">Years of Experience (Optional)</Label>
                                <Input
                                    id="yearsExp"
                                    type="number"
                                    value={yearsOfExperience || ""}
                                    onChange={(e) => setYearsOfExperience(e.target.value ? parseInt(e.target.value) : undefined)}
                                    placeholder="e.g., 5"
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
                                onClick={handlePredict}
                                disabled={loading}
                                className="w-full"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Predicting...
                                    </>
                                ) : (
                                    <>
                                        <TrendingUp className="mr-2 h-4 w-4" />
                                        Predict Career Path
                                    </>
                                )}
                            </Button>
                        </CardContent>
                    </Card>

                    <div className="space-y-6">
                        {careerPath ? (
                            <>
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Career Trajectory</CardTitle>
                                        <CardDescription>
                                            Current Level: <span className="font-semibold">{careerPath.current_level}</span>
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-slate-700">{careerPath.career_trajectory}</p>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Target className="h-5 w-5" />
                                            Next Career Steps
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {careerPath.next_steps.map((step: CareerPathStep, idx: number) => (
                                            <motion.div
                                                key={idx}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: idx * 0.1 }}
                                                className="border border-slate-200 rounded-lg p-4 space-y-2"
                                            >
                                                <div className="flex items-start justify-between">
                                                    <h4 className="font-semibold text-lg">{step.role_title}</h4>
                                                    <div className="flex items-center gap-1 text-sm text-slate-500">
                                                        <Clock className="h-4 w-4" />
                                                        {step.timeline}
                                                    </div>
                                                </div>
                                                {step.salary_range && (
                                                    <p className="text-sm text-blue-600 font-medium">{step.salary_range}</p>
                                                )}
                                                <p className="text-sm text-slate-600">{step.description}</p>
                                                <div className="flex flex-wrap gap-2 mt-2">
                                                    {step.required_skills.map((skill, skillIdx) => (
                                                        <span
                                                            key={skillIdx}
                                                            className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium"
                                                        >
                                                            {skill}
                                                        </span>
                                                    ))}
                                                </div>
                                            </motion.div>
                                        ))}
                                    </CardContent>
                                </Card>

                                {careerPath.skill_gaps.length > 0 && (
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <BookOpen className="h-5 w-5" />
                                                Skill Gaps to Address
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <ul className="space-y-2">
                                                {careerPath.skill_gaps.map((gap: string, idx: number) => (
                                                    <li key={idx} className="flex items-start gap-2">
                                                        <ArrowRight className="h-4 w-4 text-slate-400 mt-1" />
                                                        <span className="text-slate-700">{gap}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </CardContent>
                                    </Card>
                                )}

                                {careerPath.recommended_courses.length > 0 && (
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <BookOpen className="h-5 w-5" />
                                                Recommended Learning
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <ul className="space-y-2">
                                                {careerPath.recommended_courses.map((course: string, idx: number) => (
                                                    <li key={idx} className="flex items-start gap-2">
                                                        <ArrowRight className="h-4 w-4 text-blue-500 mt-1" />
                                                        <span className="text-slate-700">{course}</span>
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
                                        <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                        <p>Enter your information and click "Predict Career Path" to see your career trajectory</p>
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

