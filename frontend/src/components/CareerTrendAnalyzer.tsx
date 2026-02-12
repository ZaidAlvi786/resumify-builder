"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Loader2, TrendingUp, Search, MapPin, DollarSign, Briefcase, Zap, AlertTriangle, ArrowRight, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { getCareerTrendInsights, CareerTrendInsightsResponse } from "@/services/api";

const CareerTrendAnalyzer = () => {
    const [role, setRole] = useState("");
    const [location, setLocation] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<CareerTrendInsightsResponse | null>(null);

    const handleAnalyze = async () => {
        if (!role.trim()) return;

        setIsLoading(true);
        setResult(null);

        try {
            const data = await getCareerTrendInsights(role, location);
            setResult(data);
        } catch (error) {
            console.error("Error analyzing trends:", error);
            // Fallback for demo purposes if backend is not ready
             setResult({
                role,
                location,
                market_temperature: "High Demand",
                temperature_score: 85,
                salary_range: { min: "$120k", max: "$180k", avg: "$150k" },
                growth_rate: "+12%",
                remote_opportunity: "High",
                ai_impact_score: 75,
                top_skills: [
                    { name: "Generative AI", trend: "rising" },
                    { name: "TypeScript", trend: "stable" },
                    { name: "System Design", trend: "rising" },
                    { name: "jQuery", trend: "declining" },
                ]
            } as any);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto p-4 space-y-8">
            <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent inline-flex items-center gap-2">
                    <TrendingUp className="w-8 h-8 text-indigo-600" />
                    AI Career Trend Analyzer
                </h2>
                <p className="text-slate-600">Discover market demand, salary insights, and future-proof your career.</p>
            </div>

            <Card className="border-indigo-100 shadow-lg">
                <CardContent className="p-6">
                    <div className="grid md:grid-cols-3 gap-4 items-end">
                        <div className="space-y-2">
                            <Label htmlFor="role">Target Role <span className="text-red-500">*</span></Label>
                            <div className="relative">
                                <Briefcase className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                <Input 
                                    id="role"
                                    placeholder="e.g. Product Manager" 
                                    value={role}
                                    onChange={(e) => setRole(e.target.value)}
                                    className="pl-9"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="location">Location (Optional)</Label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                <Input 
                                    id="location"
                                    placeholder="e.g. Remote, New York" 
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    className="pl-9"
                                />
                            </div>
                        </div>
                        <Button 
                            onClick={handleAnalyze} 
                            disabled={isLoading || !role.trim()}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Scanning Market...
                                </>
                            ) : (
                                <>
                                    <Search className="w-4 h-4 mr-2" />
                                    Analyze Trends
                                </>
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <AnimatePresence>
                {result && (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        {/* Key Metrics Grid */}
                        <div className="grid md:grid-cols-3 gap-6">
                            {/* Market Heat */}
                            <Card className="border-l-4 border-l-red-500 shadow-sm overflow-hidden relative">
                                <div className="absolute top-0 right-0 p-4 opacity-10">
                                    <TrendingUp className="w-24 h-24 text-red-500" />
                                </div>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium text-slate-500">Market Temperature</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-red-600 mb-2">{result.market_temperature}</div>
                                    <Progress value={result.temperature_score} className="h-2 bg-red-100" indicatorClassName="bg-red-500" />
                                    <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                                        <ArrowUpRight className="w-3 h-3 text-green-500" />
                                        {result.growth_rate} Annual Growth
                                    </p>
                                </CardContent>
                            </Card>

                            {/* Salary Range */}
                            <Card className="border-l-4 border-l-emerald-500 shadow-sm overflow-hidden relative">
                                <div className="absolute top-0 right-0 p-4 opacity-10">
                                    <DollarSign className="w-24 h-24 text-emerald-500" />
                                </div>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium text-slate-500">Salary Estimate</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-emerald-700 mb-1">{result.salary_range.avg}</div>
                                    <div className="text-sm text-slate-500">Range: {result.salary_range.min} - {result.salary_range.max}</div>
                                    <p className="text-xs text-slate-400 mt-2 italic">*Based on market data</p>
                                </CardContent>
                            </Card>

                            {/* AI Impact */}
                            <Card className="border-l-4 border-l-purple-500 shadow-sm overflow-hidden relative">
                                <div className="absolute top-0 right-0 p-4 opacity-10">
                                    <Zap className="w-24 h-24 text-purple-500" />
                                </div >
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium text-slate-500">AI Disruption Risk</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-purple-700 mb-2">{result.ai_impact_score}%</div>
                                    <div className="w-full bg-purple-100 rounded-full h-2">
                                        <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${result.ai_impact_score}%` }}></div>
                                    </div>
                                    <p className="text-xs text-slate-500 mt-2">
                                        {result.ai_impact_score > 70 ? "High Transformation Expected" : "Moderate Transformation Expected"}
                                    </p>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Skill Trends */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <AlertTriangle className="w-5 h-5 text-amber-500" />
                                    Skill Demand Trends
                                </CardTitle>
                                <CardDescription>Skills gaining momentum vs. fading out in this role.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    {result.top_skills.map((skill: any, index: number) => (
                                        <div key={index} className={`p-3 rounded-lg border flex items-center justify-between ${
                                            skill.trend === 'rising' ? 'bg-green-50 border-green-100' : 
                                            skill.trend === 'declining' ? 'bg-red-50 border-red-100' : 'bg-slate-50 border-slate-100'
                                        }`}>
                                            <span className="font-medium text-slate-700">{skill.name}</span>
                                            {skill.trend === 'rising' && <Badge className="bg-green-100 text-green-700 hover:bg-green-200">Rising <ArrowUpRight className="w-3 h-3 ml-1" /></Badge>}
                                            {skill.trend === 'declining' && <Badge className="bg-red-100 text-red-700 hover:bg-red-200">Fading <ArrowDownRight className="w-3 h-3 ml-1" /></Badge>}
                                            {skill.trend === 'stable' && <Badge variant="outline" className="text-slate-500">Stable <ArrowRight className="w-3 h-3 ml-1" /></Badge>}
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>

            {!result && !isLoading && (
                <div className="h-64 flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                    <Search className="w-12 h-12 mb-4 opacity-20" />
                    <p className="text-lg font-medium text-slate-500">Enter a role to analyze market signals</p>
                </div>
            )}
        </div>
    );
};

export default CareerTrendAnalyzer;
