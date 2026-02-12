"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { 
    expandKeywordSynonyms, 
    KeywordSynonymExpanderResponse 
} from "@/services/api";
import { Loader2, Search, ArrowRight, ShieldCheck, FileText, Briefcase } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const KeywordExpander = () => {
    const [resumeText, setResumeText] = useState("");
    const [targetRole, setTargetRole] = useState("");
    const [jobDescription, setJobDescription] = useState("");
    const [avoidStuffing, setAvoidStuffing] = useState(true);
    
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<KeywordSynonymExpanderResponse | null>(null);

    const handleExpand = async () => {
        if (!resumeText.trim() || !targetRole.trim()) return;

        setIsLoading(true);
        setResult(null);

        try {
            const data = await expandKeywordSynonyms(
                resumeText, 
                targetRole, 
                jobDescription, 
                avoidStuffing
            );
            setResult(data);
        } catch (error) {
            console.error("Error expanding keywords:", error);
            // Handle error
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto p-4 space-y-8">
            <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent inline-flex items-center gap-2">
                    <Search className="w-8 h-8 text-purple-600" />
                    Keyword Synonym Expander
                </h2>
                <p className="text-slate-600">Enrich your resume vocabulary and bypass ATS filters smartly.</p>
            </div>

            <div className="grid lg:grid-cols-12 gap-8">
                {/* Input Section */}
                <div className="lg:col-span-5 space-y-6">
                    <Card className="border-purple-100 shadow-lg h-full">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <FileText className="w-5 h-5 text-purple-500" />
                                Content Analysis
                            </CardTitle>
                            <CardDescription>
                                Paste the text you want to analyze and improve.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="resume-text">Resume Text / Achievement <span className="text-red-500">*</span></Label>
                                <Textarea
                                    id="resume-text"
                                    placeholder="Paste a bullet point or paragraph from your resume..."
                                    value={resumeText}
                                    onChange={(e) => setResumeText(e.target.value)}
                                    className="min-h-[150px]"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="target-role">Target Role <span className="text-red-500">*</span></Label>
                                <div className="relative">
                                    <Briefcase className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                    <Input 
                                        id="target-role"
                                        placeholder="e.g. Data Scientist" 
                                        value={targetRole}
                                        onChange={(e) => setTargetRole(e.target.value)}
                                        className="pl-9"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="job-desc">Job Description (Optional)</Label>
                                <Textarea
                                    id="job-desc"
                                    placeholder="Paste job description for better context matching..."
                                    value={jobDescription}
                                    onChange={(e) => setJobDescription(e.target.value)}
                                    className="min-h-[100px]"
                                />
                            </div>

                            <div className="flex items-center space-x-2 pt-2">
                                <Checkbox 
                                    id="avoid-stuffing" 
                                    checked={avoidStuffing}
                                    onCheckedChange={(checked) => setAvoidStuffing(checked as boolean)}
                                />
                                <Label htmlFor="avoid-stuffing" className="cursor-pointer text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                    Avoid Keyword Stuffing (Recommended)
                                </Label>
                            </div>

                            <Button 
                                onClick={handleExpand} 
                                disabled={isLoading || !resumeText.trim() || !targetRole.trim()}
                                className="w-full bg-purple-600 hover:bg-purple-700 text-white mt-4"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Analyzing Keywords...
                                    </>
                                ) : (
                                    <>
                                        <Search className="w-4 h-4 mr-2" />
                                        Analyze & Expand
                                    </>
                                )}
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* Results Section */}
                <div className="lg:col-span-7 space-y-4">
                    <AnimatePresence>
                        {result && (
                            <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="space-y-6"
                            >
                                {/* Recommendations */}
                                {result.recommendations && result.recommendations.length > 0 && (
                                     <Card className="border-amber-100 bg-amber-50/50">
                                        <CardContent className="p-4">
                                            <h4 className="font-semibold text-amber-800 mb-2 flex items-center gap-2">
                                                <ShieldCheck className="w-4 h-4"/> Strategy Tips
                                            </h4>
                                            <ul className="space-y-1 text-sm text-amber-700 list-disc ml-4">
                                                {result.recommendations.map((rec, i) => (
                                                    <li key={i}>{rec}</li>
                                                ))}
                                            </ul>
                                        </CardContent>
                                    </Card>
                                )}

                                {/* Keywords Grid */}
                                <div className="grid gap-4">
                                    {result.keyword_synonyms.map((item, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                        >
                                            <Card className="border-slate-200 hover:border-purple-200 transition-colors">
                                                <CardContent className="p-4">
                                                    <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                                                        <div className="min-w-[120px]">
                                                            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Original</div>
                                                            <div className="inline-block bg-slate-100 px-3 py-1 rounded-md font-medium text-slate-700">
                                                                {item.original_keyword}
                                                            </div>
                                                        </div>
                                                        
                                                        <div className="hidden sm:block text-slate-300 mt-2">
                                                            <ArrowRight className="w-5 h-5" />
                                                        </div>

                                                        <div className="flex-1">
                                                            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Details</div>
                                                            <p className="text-sm text-slate-600 mb-3 italic">
                                                                "{item.context}"
                                                            </p>
                                                            
                                                            <div className="space-y-2">
                                                                <div className="text-xs font-semibold text-purple-600">Synonyms & Alternatives:</div>
                                                                <div className="flex flex-wrap gap-2">
                                                                    {item.synonyms.map((syn, idx) => (
                                                                        <span 
                                                                            key={idx} 
                                                                            className="bg-purple-50 text-purple-700 border border-purple-100 px-2 py-1 rounded-md text-sm font-medium hover:bg-purple-100 cursor-default transition-colors"
                                                                        >
                                                                            {syn}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            </div>

                                                            <div className="mt-3 flex items-center gap-2">
                                                                <span className="text-xs text-slate-400">ATS Impact:</span>
                                                                <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                                                                    item.ats_impact?.toLowerCase() === 'high' ? 'bg-green-100 text-green-700' :
                                                                    item.ats_impact?.toLowerCase() === 'medium' ? 'bg-blue-100 text-blue-700' :
                                                                    'bg-slate-100 text-slate-600'
                                                                }`}>
                                                                    {item.ats_impact?.toUpperCase() || "UNKNOWN"}
                                                                </span>
                                                            </div>
                                                        </div>
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
                            <Search className="w-12 h-12 mb-4 opacity-20" />
                            <p className="text-lg font-medium text-slate-500">Ready to Analyze</p>
                            <p className="text-sm">Enter your content to find smarter keywords.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default KeywordExpander;
