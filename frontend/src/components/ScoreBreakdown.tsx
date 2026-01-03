"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface ScoreBreakdown {
    keyword_optimization: number;
    formatting_quality: number;
    content_relevance: number;
    quantifiable_achievements: number;
    action_verbs: number;
    length_appropriateness: number;
    contact_info_completeness: number;
    education_section: number;
    experience_section: number;
    skills_section: number;
    summary_quality: number;
    ats_compatibility: number;
    grammar_spelling: number;
    consistency: number;
    professional_tone: number;
}

interface ScoreBreakdownProps {
    breakdown: ScoreBreakdown;
    overallScore: number;
}

const criteriaLabels: Record<keyof ScoreBreakdown, string> = {
    keyword_optimization: "Keyword Optimization",
    formatting_quality: "Formatting Quality",
    content_relevance: "Content Relevance",
    quantifiable_achievements: "Quantifiable Achievements",
    action_verbs: "Action Verbs Usage",
    length_appropriateness: "Length Appropriateness",
    contact_info_completeness: "Contact Info Completeness",
    education_section: "Education Section",
    experience_section: "Experience Section",
    skills_section: "Skills Section",
    summary_quality: "Summary Quality",
    ats_compatibility: "ATS Compatibility",
    grammar_spelling: "Grammar & Spelling",
    consistency: "Consistency",
    professional_tone: "Professional Tone"
};

const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
};

const getScoreBgColor = (score: number) => {
    if (score >= 80) return "bg-green-100";
    if (score >= 60) return "bg-yellow-100";
    return "bg-red-100";
};

const getScoreBarColor = (score: number) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-yellow-500";
    return "bg-red-500";
};

export default function ScoreBreakdownComponent({ breakdown, overallScore }: ScoreBreakdownProps) {
    const averageScore = Math.round(
        Object.values(breakdown).reduce((sum, score) => sum + score, 0) / Object.keys(breakdown).length
    );

    const getTrend = (score: number) => {
        if (score > averageScore) return <TrendingUp className="w-4 h-4 text-green-600" />;
        if (score < averageScore) return <TrendingDown className="w-4 h-4 text-red-600" />;
        return <Minus className="w-4 h-4 text-slate-400" />;
    };

    return (
        <Card className="border-t-4 border-t-blue-500">
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <span>Detailed Score Breakdown</span>
                    <span className="text-sm font-normal text-slate-600">
                        Average: <span className="font-bold text-blue-600">{averageScore}/100</span>
                    </span>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Object.entries(breakdown).map(([key, score], index) => {
                        const label = criteriaLabels[key as keyof ScoreBreakdown];
                        return (
                            <motion.div
                                key={key}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="p-4 bg-slate-50 rounded-lg border border-slate-200 hover:border-blue-300 transition-colors"
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-semibold text-slate-700">{label}</span>
                                        {getTrend(score)}
                                    </div>
                                    <span className={`text-lg font-bold ${getScoreColor(score)}`}>
                                        {score}/100
                                    </span>
                                </div>
                                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${score}%` }}
                                        transition={{ duration: 0.8, delay: index * 0.05 }}
                                        className={`h-full ${getScoreBarColor(score)} rounded-full`}
                                    />
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}

