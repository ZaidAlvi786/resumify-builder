"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button"; // Assuming these exist
import { Textarea } from "@/components/ui/textarea"; // Assuming this exists or I'll use textarea
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { quantifyAchievement, AchievementQuantifierResponse } from "@/services/api";
import { Loader2, Zap, Copy, Check, TrendingUp, BarChart2, Lightbulb } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const AchievementQuantifier = () => {
    const [achievement, setAchievement] = useState("");
    const [role, setRole] = useState("");
    const [company, setCompany] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<AchievementQuantifierResponse | null>(null);
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

    const handleQuantify = async () => {
        if (!achievement.trim()) return;

        setIsLoading(true);
        setResult(null);
        try {
            const data = await quantifyAchievement(achievement, role, company);
            setResult(data);
        } catch (error) {
            console.error("Error quantifying achievement:", error);
            // Handle error (toast, etc.)
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopy = (text: string, index: number) => {
        navigator.clipboard.writeText(text);
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    return (
        <div className="max-w-4xl mx-auto p-4 space-y-8">
            <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent inline-flex items-center gap-2">
                    <TrendingUp className="w-8 h-8 text-emerald-600" />
                    Achievement Quantifier
                </h2>
                <p className="text-slate-600">Transform vague tasks into powerful, measurable achievements.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                {/* Input Section */}
                <Card className="border-emerald-100 shadow-lg">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Zap className="w-5 h-5 text-emerald-500" />
                            Your Achievement
                        </CardTitle>
                        <CardDescription>
                            Enter a bullet point from your resume.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">What did you do?</label>
                            <Textarea
                                placeholder="e.g., Improved team productivity"
                                value={achievement}
                                onChange={(e) => setAchievement(e.target.value)}
                                className="min-h-[100px] border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                            />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Role (Optional)</label>
                                <Input 
                                    placeholder="e.g. Sales Manager" 
                                    value={role}
                                    onChange={(e) => setRole(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Company (Optional)</label>
                                <Input 
                                    placeholder="e.g. Acme Corp" 
                                    value={company}
                                    onChange={(e) => setCompany(e.target.value)}
                                />
                            </div>
                        </div>

                        <Button 
                            onClick={handleQuantify} 
                            disabled={isLoading || !achievement.trim()}
                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Quantifying...
                                </>
                            ) : (
                                <>
                                    <BarChart2 className="w-4 h-4 mr-2" />
                                    Quantify Achievement
                                </>
                            )}
                        </Button>
                    </CardContent>
                </Card>

                {/* Results Section */}
                <div className="space-y-4">
                <AnimatePresence>
                    {result && (
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-4"
                        >
                            {/* Suggestions */}
                            {result.quantified_suggestions.map((suggestion, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <Card className="border-emerald-50 hover:border-emerald-200 transition-all hover:shadow-md group">
                                        <CardContent className="p-4 space-y-3">
                                            <div className="flex justify-between items-start gap-4">
                                                <div className="space-y-1">
                                                    <p className="font-medium text-slate-800">{suggestion.quantified_version}</p>
                                                    <div className="flex items-center gap-2 text-xs text-slate-500">
                                                        <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-medium">
                                                            {suggestion.metric_type}
                                                        </span>
                                                        <span className="text-emerald-600/60 font-medium">
                                                            {suggestion.confidence} confidence
                                                        </span>
                                                    </div>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleCopy(suggestion.quantified_version, index)}
                                                    className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-emerald-600"
                                                >
                                                    {copiedIndex === index ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                                </Button>
                                            </div>
                                            
                                            <div className="bg-slate-50 p-3 rounded-lg text-sm text-slate-600">
                                                <div className="flex items-start gap-2">
                                                    <Lightbulb className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                                                    <p>{suggestion.explanation}</p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
                
                {!result && !isLoading && (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400 p-8 border-2 border-dashed border-slate-200 rounded-xl">
                        <BarChart2 className="w-12 h-12 mb-4 opacity-20" />
                        <p>Results will appear here</p>
                    </div>
                )}
                </div>
            </div>
        </div>
    );
};

export default AchievementQuantifier;
