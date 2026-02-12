"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { 
    getSummaryVariations, 
    SummaryVariationsResponse, 
    ResumeData 
} from "@/services/api";
import { Loader2, Sparkles, Copy, Check, RefreshCw, Briefcase, User, GraduationCap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface SummaryVariationsGeneratorProps {
    initialResumeData?: ResumeData;
}

const SummaryVariationsGenerator: React.FC<SummaryVariationsGeneratorProps> = ({ initialResumeData }) => {
    const [targetRole, setTargetRole] = useState(initialResumeData?.target_role || "");
    const [currentSummary, setCurrentSummary] = useState(initialResumeData?.summary || "");
    const [skills, setSkills] = useState(initialResumeData?.skills?.join(", ") || "");
    const [experience, setExperience] = useState(
        initialResumeData?.experience?.map(e => `${e.title} at ${e.company}: ${e.description}`).join("\n\n") || ""
    );
    
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<SummaryVariationsResponse | null>(null);
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

    const handleGenerate = async () => {
        if (!targetRole.trim()) return;

        setIsLoading(true);
        setResult(null);

        // Construct mock resume data if not provided
        const mockResumeData: ResumeData = initialResumeData || {
            full_name: "Candidate",
            email: "candidate@example.com",
            phone: "",
            location: "",
            target_role: targetRole,
            summary: currentSummary,
            skills: skills.split(",").map(s => s.trim()).filter(Boolean),
            experience: experience ? [{
                title: "Professional Experience",
                company: "Various",
                start_date: "2020",
                end_date: "Present",
                description: experience,
                bullet_points: []
            }] : [],
            education: [],
            projects: []
        };

        try {
            const data = await getSummaryVariations(mockResumeData, targetRole);
            setResult(data);
        } catch (error) {
            console.error("Error generating summaries:", error);
            // Handle error
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
        <div className="max-w-5xl mx-auto p-4 space-y-8">
            <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent inline-flex items-center gap-2">
                    <Sparkles className="w-8 h-8 text-blue-600" />
                    Professional Summary Generator
                </h2>
                <p className="text-slate-600">Instantly generate professional, tailored resume summaries.</p>
            </div>

            <div className="grid lg:grid-cols-12 gap-8">
                {/* Input Section */}
                <div className="lg:col-span-5 space-y-6">
                    <Card className="border-blue-100 shadow-lg h-full">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <User className="w-5 h-5 text-blue-500" />
                                Your Details
                            </CardTitle>
                            <CardDescription>
                                Provide context to generate the best summaries.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="target-role">Target Role <span className="text-red-500">*</span></Label>
                                <div className="relative">
                                    <Briefcase className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                    <Input 
                                        id="target-role"
                                        placeholder="e.g. Senior Product Manager" 
                                        value={targetRole}
                                        onChange={(e) => setTargetRole(e.target.value)}
                                        className="pl-9"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="current-summary">Current Summary (Optional)</Label>
                                <Textarea
                                    id="current-summary"
                                    placeholder="Paste your existing summary..."
                                    value={currentSummary}
                                    onChange={(e) => setCurrentSummary(e.target.value)}
                                    className="min-h-[80px]"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="skills">Key Skills</Label>
                                <Input 
                                    id="skills"
                                    placeholder="e.g. React, Node.js, Leadership (comma separated)" 
                                    value={skills}
                                    onChange={(e) => setSkills(e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="experience">Experience Highlights</Label>
                                <Textarea
                                    id="experience"
                                    placeholder="Briefly describe your key achievements and roles..."
                                    value={experience}
                                    onChange={(e) => setExperience(e.target.value)}
                                    className="min-h-[120px]"
                                />
                            </div>

                            <Button 
                                onClick={handleGenerate} 
                                disabled={isLoading || !targetRole.trim()}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white mt-4"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Generating Variations...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="w-4 h-4 mr-2" />
                                        Generate Summaries
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
                                className="space-y-4"
                            >
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-semibold text-slate-800">Generated Variations</h3>
                                    <span className="text-sm text-slate-500">{result.variations.length} options found</span>
                                </div>

                                <div className="space-y-4 max-h-[700px] overflow-y-auto pr-2 custom-scrollbar">
                                    {result.variations.map((variation, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                        >
                                            <Card 
                                                className={`border transition-all hover:shadow-md ${
                                                    index === result.recommended_variation 
                                                        ? "border-blue-400 bg-blue-50/30 ring-1 ring-blue-400/20" 
                                                        : "border-slate-200 hover:border-blue-200"
                                                }`}
                                            >
                                                <CardContent className="p-4 space-y-3">
                                                    <div className="flex justify-between items-start gap-4">
                                                        <div className="flex flex-wrap gap-2 mb-2">
                                                            <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full text-xs font-medium uppercase tracking-wide">
                                                                {variation.style.replace(/-/g, " ")}
                                                            </span>
                                                            <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full text-xs font-medium">
                                                                {variation.length}
                                                            </span>
                                                            {index === result.recommended_variation && (
                                                                <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1">
                                                                    <Sparkles className="w-3 h-3" /> Recommended
                                                                </span>
                                                            )}
                                                        </div>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleCopy(variation.summary_text, index)}
                                                            className="h-8 w-8 p-0 text-slate-400 hover:text-blue-600"
                                                        >
                                                            {copiedIndex === index ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                                        </Button>
                                                    </div>
                                                    
                                                    <p className="text-slate-700 leading-relaxed text-sm">
                                                        {variation.summary_text}
                                                    </p>
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
                            <Briefcase className="w-12 h-12 mb-4 opacity-20" />
                            <p className="text-lg font-medium text-slate-500">No summaries generated yet</p>
                            <p className="text-sm">Fill in your details and click generate to see options.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SummaryVariationsGenerator;
