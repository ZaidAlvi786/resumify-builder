"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { generateInterviewQuestions, InterviewQuestionsResponse, InterviewQuestion } from "@/services/api";
import { MessageSquare, ChevronDown, ChevronUp, Code, Clock, Zap, Target } from "lucide-react";
import LogoLoader from "@/components/ui/LogoLoader";
import Sidebar from "@/components/Sidebar";
import Logo from "@/components/ui/Logo";
import ProtectedRoute from "@/components/ProtectedRoute";

function InterviewPrepPageContent() {
    const [resumeText, setResumeText] = useState("");
    const [targetRole, setTargetRole] = useState("");
    const [jobDescription, setJobDescription] = useState("");
    const [yearsOfExperience, setYearsOfExperience] = useState<number | undefined>(undefined);
    const [includeCodeExamples, setIncludeCodeExamples] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<InterviewQuestionsResponse | null>(null);
    const [expandedQuestions, setExpandedQuestions] = useState<Set<number>>(new Set());
    const [useDetailedView, setUseDetailedView] = useState(true);

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
                jobDescription || undefined,
                yearsOfExperience,
                includeCodeExamples
            );
            setResult(data);
            // Use detailed view if available
            if (data.detailed_questions && data.detailed_questions.length > 0) {
                setUseDetailedView(true);
            }
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
            {isLoading && <LogoLoader message="Preparing Your Interview Questions" />}
            <div className="flex min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
                <Sidebar />
                <div className="flex-1 py-8 px-4 sm:px-8 lg:ml-64">
                    <div className="max-w-4xl mx-auto space-y-8">
                    <header className="text-center">
                        <Logo size="lg" className="mb-4" />
                        <h1 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold text-slate-900 mb-2">Interview Preparation</h1>
                        <p className="text-sm sm:text-base text-slate-600">Get personalized interview questions and suggested answers based on your resume</p>
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

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="years_experience">Years of Experience (Optional)</Label>
                                    <Input
                                        id="years_experience"
                                        type="number"
                                        min="0"
                                        max="50"
                                        placeholder="e.g. 3"
                                        value={yearsOfExperience || ""}
                                        onChange={(e) => setYearsOfExperience(e.target.value ? parseInt(e.target.value) : undefined)}
                                    />
                                    <p className="text-xs text-slate-500">Helps generate appropriate technical questions</p>
                                </div>

                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={includeCodeExamples}
                                            onChange={(e) => setIncludeCodeExamples(e.target.checked)}
                                            className="w-4 h-4"
                                        />
                                        Include Code Examples
                                    </Label>
                                    <p className="text-xs text-slate-500">Add code examples for technical questions</p>
                                </div>
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
                            {/* Statistics */}
                            {(result.technical_questions_count || result.behavioral_questions_count || result.system_design_questions_count) && (
                                <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
                                    <CardContent className="pt-6">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            {result.technical_questions_count && (
                                                <div className="text-center">
                                                    <div className="text-2xl font-bold text-indigo-600">{result.technical_questions_count}</div>
                                                    <div className="text-sm text-slate-600">Technical Questions</div>
                                                </div>
                                            )}
                                            {result.behavioral_questions_count && (
                                                <div className="text-center">
                                                    <div className="text-2xl font-bold text-purple-600">{result.behavioral_questions_count}</div>
                                                    <div className="text-sm text-slate-600">Behavioral Questions</div>
                                                </div>
                                            )}
                                            {result.system_design_questions_count && (
                                                <div className="text-center">
                                                    <div className="text-2xl font-bold text-pink-600">{result.system_design_questions_count}</div>
                                                    <div className="text-sm text-slate-600">System Design Questions</div>
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Category Tags */}
                            {result.categories && result.categories.length > 0 && (
                                <Card className="bg-indigo-50 border-indigo-200">
                                    <CardContent className="pt-6">
                                        <div className="flex flex-wrap gap-2">
                                            {Array.from(new Set(result.categories)).map((category: string, i: number) => (
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

                            {/* Detailed Questions View */}
                            {useDetailedView && result.detailed_questions && result.detailed_questions.length > 0 ? (
                                <div className="space-y-4">
                                    {result.detailed_questions.map((dq: InterviewQuestion, index: number) => (
                                        <Card
                                            key={index}
                                            className="hover:shadow-lg transition-shadow"
                                        >
                                            <CardHeader>
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <CardTitle className="text-lg">
                                                                {index + 1}. {dq.question}
                                                            </CardTitle>
                                                        </div>
                                                        <div className="flex flex-wrap gap-2">
                                                            <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded text-xs font-medium">
                                                                {dq.category}
                                                            </span>
                                                            {dq.difficulty && (
                                                                <span className={`px-2 py-1 rounded text-xs font-medium ${
                                                                    dq.difficulty === "easy" ? "bg-green-100 text-green-700" :
                                                                    dq.difficulty === "medium" ? "bg-yellow-100 text-yellow-700" :
                                                                    "bg-red-100 text-red-700"
                                                                }`}>
                                                                    {dq.difficulty.toUpperCase()}
                                                                </span>
                                                            )}
                                                            {dq.experience_level && (
                                                                <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium">
                                                                    {dq.experience_level}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => toggleQuestion(index)}
                                                    >
                                                        {expandedQuestions.has(index) ? (
                                                            <ChevronUp className="w-4 h-4" />
                                                        ) : (
                                                            <ChevronDown className="w-4 h-4" />
                                                        )}
                                                    </Button>
                                                </div>
                                            </CardHeader>
                                            {expandedQuestions.has(index) && (
                                                <CardContent className="pt-0 space-y-4">
                                                    {/* Answer */}
                                                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                                                        <p className="text-sm font-semibold text-slate-700 mb-2">Suggested Answer:</p>
                                                        <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">
                                                            {dq.answer}
                                                        </p>
                                                    </div>

                                                    {/* Key Points */}
                                                    {dq.key_points && dq.key_points.length > 0 && (
                                                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                                                            <p className="text-sm font-semibold text-blue-700 mb-2 flex items-center gap-2">
                                                                <Target className="w-4 h-4" />
                                                                Key Points to Cover:
                                                            </p>
                                                            <ul className="list-disc list-inside space-y-1">
                                                                {dq.key_points.map((point, i) => (
                                                                    <li key={i} className="text-sm text-blue-600">{point}</li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    )}

                                                    {/* Code Examples */}
                                                    {dq.code_examples && dq.code_examples.length > 0 && (
                                                        <div className="space-y-3">
                                                            <p className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                                                <Code className="w-4 h-4" />
                                                                Code Examples:
                                                            </p>
                                                            {dq.code_examples.map((example, exIndex) => (
                                                                <div key={exIndex} className="bg-slate-900 rounded-lg overflow-hidden border border-slate-700">
                                                                    <div className="bg-slate-800 px-4 py-2 flex items-center justify-between">
                                                                        <span className="text-sm font-medium text-slate-300">{example.language}</span>
                                                                        <div className="flex items-center gap-4 text-xs text-slate-400">
                                                                            {example.time_complexity && (
                                                                                <span className="flex items-center gap-1">
                                                                                    <Clock className="w-3 h-3" />
                                                                                    {example.time_complexity}
                                                                                </span>
                                                                            )}
                                                                            {example.space_complexity && (
                                                                                <span className="flex items-center gap-1">
                                                                                    <Zap className="w-3 h-3" />
                                                                                    {example.space_complexity}
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                    <pre className="p-4 overflow-x-auto text-sm text-slate-100">
                                                                        <code>{example.code}</code>
                                                                    </pre>
                                                                    {example.explanation && (
                                                                        <div className="bg-slate-800 px-4 py-2 border-t border-slate-700">
                                                                            <p className="text-xs text-slate-300">{example.explanation}</p>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}

                                                    {/* Follow-up Questions */}
                                                    {dq.follow_up_questions && dq.follow_up_questions.length > 0 && (
                                                        <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                                                            <p className="text-sm font-semibold text-amber-700 mb-2">Potential Follow-up Questions:</p>
                                                            <ul className="list-disc list-inside space-y-1">
                                                                {dq.follow_up_questions.map((followUp, i) => (
                                                                    <li key={i} className="text-sm text-amber-600">{followUp}</li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    )}
                                                </CardContent>
                                            )}
                                        </Card>
                                    ))}
                                </div>
                            ) : (
                                /* Fallback to Simple View */
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
                            )}
                        </div>
                    )}
                    </div>
                </div>
            </div>
        </>
    );
}

export default function InterviewPrepPage() {
    return (
        <ProtectedRoute>
            <InterviewPrepPageContent />
        </ProtectedRoute>
    );
}

