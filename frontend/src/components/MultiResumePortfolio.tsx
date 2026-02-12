"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
    generateMultiResumePortfolio, // Need to verify export name
    MultiResumePortfolioResponse,
    ResumeData
} from "@/services/api";
import { Loader2, Layers, Briefcase, FilePlus, Eye, Download, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Mock Sample Resume Data
const sampleResume: ResumeData = {
    full_name: "Alex Johnson",
    email: "alex.j@example.com",
    phone: "555-0123",
    location: "San Francisco, CA",
    target_role: "Software Engineer",
    summary: "Experienced software engineer with a focus on full-stack development. Proven track record of delivering scalable web applications.",
    skills: ["React", "Node.js", "Python", "AWS", "Docker", "TypeScript", "SQL"],
    experience: [
        {
            title: "Senior Developer",
            company: "Tech Solutions Inc.",
            start_date: "2021-03",
            end_date: "Present",
            description: "Leading a team of 5 developers. Architecting new features for the main SaaS platform.",
            bullet_points: [
                "Reduced load time by 40% through code optimization",
                "Mentored junior developers and conducted code reviews",
                "Implemented CI/CD pipelines using GitHub Actions"
            ]
        },
        {
            title: "Web Developer",
            company: "Creative Agency",
            start_date: "2018-06",
            end_date: "2021-02",
            description: "Built responsive websites for various clients.",
            bullet_points: [
                "Developed 20+ client websites using React and Next.js",
                "Collaborated with designers to implement pixel-perfect UIs"
            ]
        }
    ],
    education: [
        {
            degree: "BS Computer Science",
            school: "State University",
            graduation_year: "2018"
        }
    ]
};

const MultiResumePortfolio = () => {
    const [resumeData, setResumeData] = useState<ResumeData | null>(null);
    const [jsonInput, setJsonInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<MultiResumePortfolioResponse | null>(null);

    const handleLoadSample = () => {
        setResumeData(sampleResume);
        setJsonInput(JSON.stringify(sampleResume, null, 2));
    };

    const handleJsonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setJsonInput(e.target.value);
        try {
            setResumeData(JSON.parse(e.target.value));
        } catch (error) {
            // Invalid JSON
        }
    };

    const handleGenerate = async () => {
        if (!resumeData) return;

        setIsLoading(true);
        setResult(null);

        try {
            // Call API
            // Note: Update function name based on valid export from api.ts
            // Assuming generateMultiResumePortfolio or similar exists
             const data = await generateMultiResumePortfolio(resumeData, ["Technical Lead", "Product Manager"], ["Tech"], ["technical", "executive"], 3);
             setResult(data);
        } catch (error) {
            console.error("Error generating portfolio:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto p-4 space-y-8">
            <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent inline-flex items-center gap-2">
                    <Layers className="w-8 h-8 text-orange-500" />
                    Multi-Resume Portfolio
                </h2>
                <p className="text-slate-600">Generate multiple tailored versions of your resume in one click.</p>
            </div>

            <div className="grid lg:grid-cols-12 gap-8">
                {/* Input Section */}
                <div className="lg:col-span-4 space-y-6">
                    <Card className="border-orange-100 shadow-lg h-full">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Briefcase className="w-5 h-5 text-orange-500" />
                                Master Resume Data
                            </CardTitle>
                            <CardDescription>
                                Input your master resume to generate variations.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {!resumeData ? (
                                <div className="text-center py-8 space-y-4">
                                     <Button variant="outline" onClick={handleLoadSample} className="w-full border-dashed border-2 h-32 flex flex-col gap-2 hover:bg-orange-50 hover:border-orange-200 hover:text-orange-600">
                                        <FilePlus className="w-8 h-8 opacity-50" />
                                        <span>Load Sample Data</span>
                                     </Button>
                                     <div className="text-xs text-slate-400 uppercase tracking-widest font-semibold">OR</div>
                                     <Textarea 
                                        placeholder="Paste Resume JSON here..." 
                                        value={jsonInput}
                                        onChange={handleJsonChange}
                                        className="min-h-[200px] font-mono text-xs"
                                     />
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="bg-slate-50 p-4 rounded-lg border text-sm space-y-2">
                                        <div className="font-semibold">{resumeData.full_name}</div>
                                        <div className="text-slate-500">{resumeData.target_role}</div>
                                        <div className="text-xs text-slate-400 truncate">{resumeData.email}</div>
                                        <Button variant="link" size="sm" onClick={() => setResumeData(null)} className="px-0 text-red-500 h-auto">
                                            Clear & Reset
                                        </Button>
                                    </div>
                                    
                                    <Button 
                                        onClick={handleGenerate} 
                                        disabled={isLoading}
                                        className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                                    >
                                        {isLoading ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                Generating Versions...
                                            </>
                                        ) : (
                                            <>
                                                <Layers className="w-4 h-4 mr-2" />
                                                Generate Portfolio
                                            </>
                                        )}
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Results Section */}
                <div className="lg:col-span-8 space-y-4">
                    <AnimatePresence>
                        {result && (
                            <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="space-y-6"
                            >
                                <Tabs defaultValue={result.versions[0]?.version_id} className="w-full">
                                    <TabsList className="w-full justify-start h-auto flex-wrap gap-2 bg-transparent p-0">
                                        {result.versions.map((version) => (
                                            <TabsTrigger 
                                                key={version.version_id} 
                                                value={version.version_id}
                                                className="data-[state=active]:bg-orange-100 data-[state=active]:text-orange-700 data-[state=active]:shadow-none border border-slate-200 bg-white"
                                            >
                                                {version.version_name}
                                            </TabsTrigger>
                                        ))}
                                    </TabsList>
                                    
                                    {result.versions.map((version) => (
                                        <TabsContent key={version.version_id} value={version.version_id} className="mt-6">
                                            <Card className="border-orange-100/50 shadow-md">
                                                <CardHeader className="bg-orange-50/30 border-b border-orange-100/50">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <CardTitle className="text-xl text-slate-800">{version.target_role || version.version_name}</CardTitle>
                                                            <div className="flex items-center gap-2 mt-2">
                                                                <Badge variant="secondary" className="bg-white border-slate-200 text-slate-600">
                                                                    {version.style} Style
                                                                </Badge>
                                                                {version.industry && (
                                                                    <Badge variant="secondary" className="bg-white border-slate-200 text-slate-600">
                                                                        {version.industry}
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <Button variant="outline" size="sm">
                                                            <Download className="w-4 h-4 mr-2" /> Export PDF
                                                        </Button>
                                                    </div>
                                                </CardHeader>
                                                <CardContent className="p-6 space-y-6">
                                                    {/* Strategy / Key Changes */}
                                                    <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-100">
                                                        <h4 className="text-sm font-semibold text-blue-800 mb-2 flex items-center gap-2">
                                                            <Eye className="w-4 h-4" /> Strategy & Key Changes
                                                        </h4>
                                                        <ul className="space-y-1 text-sm text-blue-700/80 list-disc ml-4">
                                                            {version.key_changes.map((change, i) => (
                                                                <li key={i}>{change}</li>
                                                            ))}
                                                        </ul>
                                                    </div>

                                                    {/* Resume Preview (Simplified) */}
                                                    <div className="space-y-4 border rounded-lg p-6 bg-white min-h-[400px] shadow-sm">
                                                        <div className="text-center border-b pb-4 mb-4">
                                                            <h3 className="text-xl font-bold uppercase tracking-wide">{version.resume_data.full_name}</h3>
                                                            <p className="text-sm text-slate-500">{version.resume_data.target_role} | {version.resume_data.location}</p>
                                                        </div>
                                                        
                                                        <div>
                                                            <h4 className="text-xs font-bold uppercase text-slate-400 tracking-widest mb-2 border-b">Professional Summary</h4>
                                                            <p className="text-sm text-slate-700 leading-relaxed">{version.resume_data.summary}</p>
                                                        </div>

                                                        <div>
                                                            <h4 className="text-xs font-bold uppercase text-slate-400 tracking-widest mb-2 border-b">Skills</h4>
                                                            <div className="flex flex-wrap gap-1">
                                                                {version.resume_data.skills.map((skill: string, i: number) => (
                                                                    <span key={i} className="text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-700">{skill}</span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                        
                                                        {version.resume_data.experience && (
                                                            <div>
                                                                <h4 className="text-xs font-bold uppercase text-slate-400 tracking-widest mb-2 border-b">Experience</h4>
                                                                <div className="space-y-4">
                                                                    {version.resume_data.experience.map((exp: any, i: number) => (
                                                                        <div key={i}>
                                                                            <div className="flex justify-between text-sm font-semibold">
                                                                                <span>{exp.title}</span>
                                                                                <span className="text-slate-500 font-normal">{exp.start_date} - {exp.end_date}</span>
                                                                            </div>
                                                                            <div className="text-xs font-semibold text-slate-600 mb-1">{exp.company}</div>
                                                                            <ul className="list-disc ml-4 text-xs text-slate-600 space-y-0.5">
                                                                                {exp.bullet_points?.map((bp: string, j: number) => (
                                                                                    <li key={j}>{bp}</li>
                                                                                ))}
                                                                            </ul>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </TabsContent>
                                    ))}
                                </Tabs>
                            </motion.div>
                        )}
                    </AnimatePresence>
                     
                    {!result && !isLoading && (
                        <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-slate-400 p-8 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                            <Layers className="w-12 h-12 mb-4 opacity-20" />
                            <p className="text-lg font-medium text-slate-500">No portfolio generated</p>
                            <p className="text-sm">Load sample data or paste JSON to start.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MultiResumePortfolio;
