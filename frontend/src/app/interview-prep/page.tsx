"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { generateInterviewQuestions } from "@/services/api";
import { MessageSquare, ChevronDown, ChevronUp } from "lucide-react";
import NeuralLoader from "@/components/ui/NeuralLoader";
import Sidebar from "@/components/Sidebar";
import Logo from "@/components/ui/Logo";

export default function InterviewPrepPage() {
    const [resumeText, setResumeText] = useState("");
    const [targetRole, setTargetRole] = useState("");
    const [jobDescription, setJobDescription] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<any | null>(null);
    const [expandedQuestions, setExpandedQuestions] = useState<Set<number>>(new Set());

    const handleGenerate = async () => {
        if (!resumeText || !targetRole) {
            alert("Please fill in resume text and target role.");
            return;
        }

        setIsLoading(true);
        try {
            const data = await generateInterviewQuestions(
                resumeText,
                targetRole,
                jobDescription || undefined
            );
            setResult(data);
        } catch (error) {
            console.error(error);
            alert("Failed to generate interview questions.");
        } finally {
            setIsLoading(false);
        }
    };

    const toggleQuestion = (index: number) => {
        const newExpanded = new Set(expandedQuestions);
        if (newExpanded.has(index)) {
            newExpanded.delete(index);
        } else {
            newExpanded.add(index);
        }
        setExpandedQuestions(newExpanded);
    };

    return (
        <>
            {isLoading && <NeuralLoader message="Preparing Your Interview Questions" />}
            <div className="flex min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
                <Sidebar />
                <div className="flex-1 py-8 px-4 sm:px-8 lg:ml-64">
                    <div className="max-w-4xl mx-auto space-y-8">
                    <header className="text-center">
                        <Logo size="lg" className="mb-4" />
                        <h1 className="text-4xl font-display font-bold text-slate-900 mb-2">Interview Preparation</h1>
                        <p className="text-slate-600">Get personalized interview questions and suggested answers based on your resume</p>
                    </header>

                    <Card className="shadow-xl">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <MessageSquare className="w-5 h-5" />
                                Generate Interview Questions
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="target_role">Target Role *</Label>
                                <Input
                                    id="target_role"
                                    placeholder="e.g. Senior Software Engineer"
                                    value={targetRole}
                                    onChange={(e) => setTargetRole(e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="resume_text">Your Resume Text *</Label>
                                <Textarea
                                    id="resume_text"
                                    placeholder="Paste your resume content here..."
                                    className="min-h-[200px]"
                                    value={resumeText}
                                    onChange={(e) => setResumeText(e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="job_description">Job Description (Optional)</Label>
                                <Textarea
                                    id="job_description"
                                    placeholder="Paste the job description for role-specific questions..."
                                    className="min-h-[150px]"
                                    value={jobDescription}
                                    onChange={(e) => setJobDescription(e.target.value)}
                                />
                            </div>

                            <Button
                                onClick={handleGenerate}
                                disabled={isLoading}
                                className="w-full h-12 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold"
                            >
                                Generate Questions
                            </Button>
                        </CardContent>
                    </Card>

                    {result && result.questions && (
                        <div className="space-y-6 animate-fade-in">
                            {result.categories && result.categories.length > 0 && (
                                <Card className="bg-indigo-50 border-indigo-200">
                                    <CardContent className="pt-6">
                                        <div className="flex flex-wrap gap-2">
                                            {result.categories.map((category: string, i: number) => (
                                                <span
                                                    key={i}
                                                    className="px-3 py-1 bg-indigo-600 text-white rounded-full text-sm font-medium"
                                                >
                                                    {category}
                                                </span>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            <div className="space-y-4">
                                {result.questions.map((question: string, index: number) => (
                                    <Card
                                        key={index}
                                        className="hover:shadow-lg transition-shadow cursor-pointer"
                                        onClick={() => toggleQuestion(index)}
                                    >
                                        <CardHeader>
                                            <div className="flex items-start justify-between">
                                                <CardTitle className="text-lg pr-4">
                                                    {index + 1}. {question}
                                                </CardTitle>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        toggleQuestion(index);
                                                    }}
                                                >
                                                    {expandedQuestions.has(index) ? (
                                                        <ChevronUp className="w-4 h-4" />
                                                    ) : (
                                                        <ChevronDown className="w-4 h-4" />
                                                    )}
                                                </Button>
                                            </div>
                                        </CardHeader>
                                        {expandedQuestions.has(index) && result.answers && result.answers[index] && (
                                            <CardContent className="pt-0">
                                                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                                                    <p className="text-sm font-semibold text-slate-700 mb-2">Suggested Answer:</p>
                                                    <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">
                                                        {result.answers[index]}
                                                    </p>
                                                </div>
                                            </CardContent>
                                        )}
                                    </Card>
                                ))}
                            </div>
                        </div>
                    )}
                    </div>
                </div>
            </div>
        </>
    );
}

