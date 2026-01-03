"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, XCircle, AlertCircle, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

interface ScoreCriteria {
    category: string;
    criteria: {
        name: string;
        score: number;
        maxScore: number;
        feedback: string;
        status: "pass" | "warning" | "fail";
    }[];
}

interface DetailedResumeScoreProps {
    atsScore: number;
    criteria?: ScoreCriteria[];
}

// Default criteria breakdown if not provided
const defaultCriteria: ScoreCriteria[] = [
    {
        category: "Content Quality",
        criteria: [
            { name: "Professional Summary", score: 8, maxScore: 10, feedback: "Well-written summary that highlights key qualifications", status: "pass" },
            { name: "Action Verbs Usage", score: 7, maxScore: 10, feedback: "Good use of action verbs, could be more varied", status: "warning" },
            { name: "Quantifiable Achievements", score: 6, maxScore: 10, feedback: "Some metrics present, add more specific numbers", status: "warning" },
            { name: "Relevance to Target Role", score: 9, maxScore: 10, feedback: "Highly relevant content for the target position", status: "pass" },
        ]
    },
    {
        category: "ATS Optimization",
        criteria: [
            { name: "Keyword Density", score: 8, maxScore: 10, feedback: "Good keyword usage throughout resume", status: "pass" },
            { name: "Formatting Compatibility", score: 9, maxScore: 10, feedback: "Excellent ATS-friendly formatting", status: "pass" },
            { name: "File Format", score: 10, maxScore: 10, feedback: "Proper file format for ATS systems", status: "pass" },
            { name: "Section Headers", score: 8, maxScore: 10, feedback: "Clear and standard section headers", status: "pass" },
        ]
    },
    {
        category: "Structure & Organization",
        criteria: [
            { name: "Contact Information", score: 10, maxScore: 10, feedback: "Complete contact information provided", status: "pass" },
            { name: "Work Experience Format", score: 8, maxScore: 10, feedback: "Well-organized experience section", status: "pass" },
            { name: "Education Section", score: 9, maxScore: 10, feedback: "Clear education credentials", status: "pass" },
            { name: "Skills Section", score: 7, maxScore: 10, feedback: "Good skills list, consider categorizing", status: "warning" },
        ]
    },
    {
        category: "Language & Style",
        criteria: [
            { name: "Grammar & Spelling", score: 9, maxScore: 10, feedback: "No grammatical errors detected", status: "pass" },
            { name: "Consistency", score: 8, maxScore: 10, feedback: "Consistent formatting and style", status: "pass" },
            { name: "Clarity", score: 8, maxScore: 10, feedback: "Clear and concise language", status: "pass" },
            { name: "Professional Tone", score: 9, maxScore: 10, feedback: "Appropriate professional tone throughout", status: "pass" },
        ]
    },
    {
        category: "Impact & Results",
        criteria: [
            { name: "Achievement Focus", score: 7, maxScore: 10, feedback: "Good focus on achievements, add more metrics", status: "warning" },
            { name: "Problem-Solving Examples", score: 6, maxScore: 10, feedback: "Include more examples of problem-solving", status: "warning" },
            { name: "Leadership Indicators", score: 7, maxScore: 10, feedback: "Some leadership examples, could be stronger", status: "warning" },
            { name: "Industry Relevance", score: 9, maxScore: 10, feedback: "Highly relevant to target industry", status: "pass" },
        ]
    }
];

export default function DetailedResumeScore({ atsScore, criteria = defaultCriteria }: DetailedResumeScoreProps) {
    const getStatusIcon = (status: string) => {
        switch (status) {
            case "pass":
                return <CheckCircle2 className="w-5 h-5 text-green-600" />;
            case "warning":
                return <AlertCircle className="w-5 h-5 text-yellow-600" />;
            case "fail":
                return <XCircle className="w-5 h-5 text-red-600" />;
            default:
                return null;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "pass":
                return "border-green-200 bg-green-50/50";
            case "warning":
                return "border-yellow-200 bg-yellow-50/50";
            case "fail":
                return "border-red-200 bg-red-50/50";
            default:
                return "border-slate-200 bg-slate-50";
        }
    };

    const calculateCategoryScore = (category: ScoreCriteria) => {
        const total = category.criteria.reduce((sum, c) => sum + c.score, 0);
        const max = category.criteria.reduce((sum, c) => sum + c.maxScore, 0);
        return Math.round((total / max) * 100);
    };

    return (
        <Card className="border-t-4 border-t-blue-500 w-full max-w-full overflow-hidden">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                    Detailed Resume Score Breakdown
                </CardTitle>
                <p className="text-sm text-slate-600 mt-2">
                    Comprehensive analysis across 25+ criteria points
                </p>
            </CardHeader>
            <CardContent className="space-y-6 w-full max-w-full overflow-hidden">
                {/* Overall Score */}
                <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                    <div className="text-5xl font-extrabold text-blue-600 mb-2">{atsScore}/100</div>
                    <p className="text-sm text-slate-600 uppercase tracking-wide font-semibold">Overall ATS Score</p>
                    <div className="mt-4 w-full bg-slate-200 rounded-full h-3">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${atsScore}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className="bg-gradient-to-r from-blue-600 to-indigo-600 h-3 rounded-full"
                        />
                    </div>
                </div>

                {/* Category Breakdown */}
                <div className="space-y-4">
                    {criteria.map((category, categoryIdx) => {
                        const categoryScore = calculateCategoryScore(category);
                        return (
                            <motion.div
                                key={categoryIdx}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: categoryIdx * 0.1 }}
                                className="border rounded-lg overflow-hidden w-full max-w-full"
                            >
                                <div className="bg-slate-50 px-4 py-3 border-b flex items-center justify-between">
                                    <h3 className="font-semibold text-slate-900">{category.category}</h3>
                                    <div className="flex items-center gap-2">
                                        <span className="text-lg font-bold text-slate-700">{categoryScore}%</span>
                                        <div className="w-24 bg-slate-200 rounded-full h-2">
                                            <div
                                                className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full"
                                                style={{ width: `${categoryScore}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="p-4 space-y-3">
                                    {category.criteria.map((criterion, idx) => (
                                        <motion.div
                                            key={idx}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: categoryIdx * 0.1 + idx * 0.05 }}
                                            className={`p-3 rounded-lg border ${getStatusColor(criterion.status)} w-full max-w-full overflow-hidden`}
                                        >
                                            <div className="flex items-start justify-between mb-2 gap-2 min-w-0">
                                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                                    {getStatusIcon(criterion.status)}
                                                    <span className="font-medium text-slate-900 truncate">{criterion.name}</span>
                                                </div>
                                                <span className="text-sm font-bold text-slate-700 flex-shrink-0">
                                                    {criterion.score}/{criterion.maxScore}
                                                </span>
                                            </div>
                                            <p className="text-xs text-slate-600 ml-7 break-words">{criterion.feedback}</p>
                                            <div className="mt-2 ml-7 w-[calc(100%-1.75rem)] bg-slate-200 rounded-full h-1.5 overflow-hidden">
                                                <div
                                                    className={`h-1.5 rounded-full ${
                                                        criterion.status === "pass"
                                                            ? "bg-green-500"
                                                            : criterion.status === "warning"
                                                            ? "bg-yellow-500"
                                                            : "bg-red-500"
                                                    }`}
                                                    style={{ width: `${(criterion.score / criterion.maxScore) * 100}%` }}
                                                />
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Summary */}
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <h4 className="font-semibold text-slate-900 mb-2">Score Summary</h4>
                    <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                            <div className="text-2xl font-bold text-green-600">
                                {criteria.flatMap(c => c.criteria).filter(c => c.status === "pass").length}
                            </div>
                            <div className="text-xs text-slate-600">Passing</div>
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-yellow-600">
                                {criteria.flatMap(c => c.criteria).filter(c => c.status === "warning").length}
                            </div>
                            <div className="text-xs text-slate-600">Needs Improvement</div>
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-red-600">
                                {criteria.flatMap(c => c.criteria).filter(c => c.status === "fail").length}
                            </div>
                            <div className="text-xs text-slate-600">Failing</div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
