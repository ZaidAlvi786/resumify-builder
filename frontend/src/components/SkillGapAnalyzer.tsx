"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
    analyzeSkillGaps, 
    SkillGapAnalyzerResponse 
} from "@/services/api";
import { Loader2, Target, BookOpen, AlertCircle, CheckCircle, TrendingUp, Briefcase, GraduationCap, LinkIcon, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const SkillGapAnalyzer = () => {
    const [resumeText, setResumeText] = useState("");
    const [targetRole, setTargetRole] = useState("");
    const [jobDescription, setJobDescription] = useState("");
    const [currentSkillsInput, setCurrentSkillsInput] = useState("");
    
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<SkillGapAnalyzerResponse | null>(null);

    const handleAnalyze = async () => {
        if (!targetRole.trim()) return;

        setIsLoading(true);
        setResult(null);

        const currentSkills = currentSkillsInput 
            ? currentSkillsInput.split(",").map(s => s.trim()).filter(Boolean)
            : undefined;

        try {
            const data = await analyzeSkillGaps(
                resumeText,
                targetRole,
                jobDescription,
                currentSkills
            );
            setResult(data);
        } catch (error) {
            console.error("Error analyzing skill gaps:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto p-4 space-y-8">
            <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent inline-flex items-center gap-2">
                    <Target className="w-8 h-8 text-cyan-600" />
                    AI Skill Gap Analyzer
                </h2>
                <p className="text-slate-600">Identify missing skills and get a personalized learning roadmap.</p>
            </div>

            <div className="grid lg:grid-cols-12 gap-8">
                {/* Input Section */}
                <div className="lg:col-span-4 space-y-6">
                    <Card className="border-cyan-100 shadow-lg h-full">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Briefcase className="w-5 h-5 text-cyan-500" />
                                Career Context
                            </CardTitle>
                            <CardDescription>
                                Tell us about your goal and current status.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="target-role">Target Role <span className="text-red-500">*</span></Label>
                                <div className="relative">
                                    <Target className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                    <Input 
                                        id="target-role"
                                        placeholder="e.g. Senior Machine Learning Engineer" 
                                        value={targetRole}
                                        onChange={(e) => setTargetRole(e.target.value)}
                                        className="pl-9"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="current-skills">Current Skills (Optional)</Label>
                                <Textarea
                                    id="current-skills"
                                    placeholder="Python, SQL, AWS, Communication... (comma separated)"
                                    value={currentSkillsInput}
                                    onChange={(e) => setCurrentSkillsInput(e.target.value)}
                                    className="min-h-[80px]"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="resume-text">Resume Summary / Highlights</Label>
                                <Textarea
                                    id="resume-text"
                                    placeholder="Paste your resume summary or key experience highlights..."
                                    value={resumeText}
                                    onChange={(e) => setResumeText(e.target.value)}
                                    className="min-h-[100px]"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="job-desc">Job Description (Optional)</Label>
                                <Textarea
                                    id="job-desc"
                                    placeholder="Paste a specific job description to analyze against..."
                                    value={jobDescription}
                                    onChange={(e) => setJobDescription(e.target.value)}
                                    className="min-h-[100px]"
                                />
                            </div>

                            <Button 
                                onClick={handleAnalyze} 
                                disabled={isLoading || !targetRole.trim()}
                                className="w-full bg-cyan-600 hover:bg-cyan-700 text-white mt-4"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Analyzing Gaps...
                                    </>
                                ) : (
                                    <>
                                        <TrendingUp className="w-4 h-4 mr-2" />
                                        Analyze Skill Gaps
                                    </>
                                )}
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* Results Section */}
                <div className="lg:col-span-8 space-y-6">
                    <AnimatePresence>
                        {result && (
                            <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="space-y-6"
                            >
                                {/* Overview Card */}
                                <div className="grid md:grid-cols-2 gap-4">
                                    <Card className="border-cyan-100 bg-cyan-50/30">
                                        <CardContent className="p-6 text-center">
                                            <div className="text-3xl font-bold text-cyan-700 mb-1">{result.overall_readiness_score}%</div>
                                            <div className="text-sm font-medium text-cyan-600 uppercase tracking-wide">Role Readiness</div>
                                            <Progress value={result.overall_readiness_score} className="h-2 mt-3 bg-cyan-200" indicatorClassName="bg-cyan-600" />
                                        </CardContent>
                                    </Card>
                                    <Card className="border-slate-100">
                                        <CardContent className="p-6">
                                            <h4 className="font-semibold text-slate-700 mb-2">Estimated Timeline</h4>
                                            <div className="flex items-center gap-2 text-slate-600">
                                                <AlertCircle className="w-5 h-5 text-amber-500" />
                                                <span>{result.timeline_estimate} to bridge gaps</span>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Skills Breakdown */}
                                <div className="grid md:grid-cols-2 gap-6">
                                    {/* Missing Skills */}
                                    <Card className="border-red-100 h-full">
                                        <CardHeader className="py-3 bg-red-50/50 border-b border-red-100">
                                            <CardTitle className="text-base text-red-700 flex items-center gap-2">
                                                <AlertCircle className="w-4 h-4" />
                                                Critical Gaps
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="p-4">
                                            <div className="flex flex-wrap gap-2">
                                                {result.skill_gaps.map((skill, i) => (
                                                    <Badge key={i} variant="secondary" className="bg-red-50 text-red-700 border-red-200 hover:bg-red-100">
                                                        {skill}
                                                    </Badge>
                                                ))}
                                                {result.skill_gaps.length === 0 && <span className="text-sm text-slate-500 italic">No critical gaps found!</span>}
                                            </div>
                                        </CardContent>
                                    </Card>
                                    
                                    {/* Present Skills */}
                                    <Card className="border-green-100 h-full">
                                        <CardHeader className="py-3 bg-green-50/50 border-b border-green-100">
                                            <CardTitle className="text-base text-green-700 flex items-center gap-2">
                                                <CheckCircle className="w-4 h-4" />
                                                Verified Skills
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="p-4">
                                            <div className="flex flex-wrap gap-2">
                                                {result.current_skills.map((skill, i) => (
                                                    <Badge key={i} variant="secondary" className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100">
                                                        {skill}
                                                    </Badge>
                                                ))}
                                                 {result.current_skills.length === 0 && <span className="text-sm text-slate-500 italic">No matching skills found yet.</span>}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Learning Paths */}
                                <div className="space-y-4">
                                    <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                        <GraduationCap className="w-6 h-6 text-cyan-600" />
                                        Personalized Learning Paths
                                    </h3>
                                    
                                    {result.learning_paths.map((path, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                        >
                                            <Card className="border-slate-200 overflow-hidden hover:border-cyan-200 transition-colors">
                                                <CardHeader className="py-3 bg-slate-50 border-b">
                                                    <div className="flex justify-between items-center">
                                                        <CardTitle className="text-base font-semibold">{path.skill_name}</CardTitle>
                                                        <div className="flex items-center gap-2 text-xs">
                                                            <span className="px-2 py-1 bg-white border rounded text-slate-500">
                                                                {path.difficulty}
                                                            </span>
                                                            <span className="px-2 py-1 bg-white border rounded text-slate-500">
                                                                {path.estimated_time}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </CardHeader>
                                                <CardContent className="p-4 space-y-3">
                                                    <div className="flex items-center gap-2 text-sm text-slate-600 mb-2">
                                                        <span>Current: <span className="font-medium text-slate-900">{path.current_level}</span></span>
                                                        <ArrowRight className="w-3 h-3" />
                                                        <span>Target: <span className="font-medium text-cyan-700">{path.target_level}</span></span>
                                                    </div>
                                                    
                                                    <div className="space-y-2">
                                                         {path.learning_resources.map((resource, idx) => (
                                                             <div key={idx} className="flex items-start gap-3 p-2 rounded hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all">
                                                                 <div className="mt-1">
                                                                    {resource.type === 'course' ? <BookOpen className="w-4 h-4 text-cyan-500" /> : <LinkIcon className="w-4 h-4 text-slate-400" />}
                                                                 </div>
                                                                 <div className="flex-1">
                                                                     <div className="text-sm font-medium text-slate-800 hover:text-cyan-600 cursor-pointer">
                                                                        {resource.title}
                                                                     </div>
                                                                     <div className="text-xs text-slate-500 mt-0.5">
                                                                        {resource.provider} • {resource.cost || "Free"} • {resource.duration}
                                                                     </div>
                                                                     <div className="text-xs text-slate-400 mt-1 line-clamp-1">
                                                                        {resource.description}
                                                                     </div>
                                                                 </div>
                                                             </div>
                                                         ))}
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {!result && !isLoading && (
                        <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-slate-400 p-8 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                            <Target className="w-12 h-12 mb-4 opacity-20" />
                            <p className="text-lg font-medium text-slate-500">Ready to Analyze</p>
                            <p className="text-sm">Enter a target role to check your readiness.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SkillGapAnalyzer;


