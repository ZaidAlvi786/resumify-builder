"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { simulateSalaryNegotiation } from "@/services/api";
import { Loader2, DollarSign, AlertCircle, Sparkles, MessageSquare, TrendingUp, Lightbulb, XCircle } from "lucide-react";
import { motion } from "framer-motion";
import ProtectedRoute from "@/components/ProtectedRoute";

function SalaryNegotiationPageContent() {
    const [resumeText, setResumeText] = useState("");
    const [targetRole, setTargetRole] = useState("");
    const [currentSalary, setCurrentSalary] = useState("");
    const [yearsOfExperience, setYearsOfExperience] = useState<string>("");
    const [location, setLocation] = useState("");
    const [companyName, setCompanyName] = useState("");
    const [jobDescription, setJobDescription] = useState("");
    const [initialOffer, setInitialOffer] = useState("");
    const [negotiationScenario, setNegotiationScenario] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState("");

    const handleSimulate = async () => {
        if (!resumeText.trim() || !targetRole.trim()) {
            setError("Please provide resume text and target role");
            return;
        }

        setLoading(true);
        setError("");
        setResult(null);

        try {
            const data = await simulateSalaryNegotiation(
                resumeText,
                targetRole,
                currentSalary || undefined,
                yearsOfExperience ? parseInt(yearsOfExperience) : undefined,
                location || undefined,
                companyName || undefined,
                jobDescription || undefined,
                initialOffer || undefined,
                negotiationScenario || undefined
            );
            setResult(data);
        } catch (err: any) {
            setError(err.message || "Failed to simulate salary negotiation");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-slate-50">
            <Sidebar />
            <div className="flex-1 py-8 px-4 sm:px-8 max-w-7xl mx-auto w-full lg:ml-64">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg">
                            <DollarSign className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold text-slate-900">Salary Negotiation Simulator</h1>
                            <p className="text-slate-600 mt-1">
                                Practice salary negotiations with AI-powered realistic scenarios
                            </p>
                        </div>
                    </div>
                </motion.div>

                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>Negotiation Setup</CardTitle>
                        <CardDescription>
                            Enter your details to generate a personalized salary negotiation simulation
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label htmlFor="resume-text">Resume Text *</Label>
                            <Textarea
                                id="resume-text"
                                value={resumeText}
                                onChange={(e) => setResumeText(e.target.value)}
                                placeholder="Paste your resume text here..."
                                className="mt-1"
                                rows={4}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="target-role">Target Role *</Label>
                                <Input
                                    id="target-role"
                                    value={targetRole}
                                    onChange={(e) => setTargetRole(e.target.value)}
                                    placeholder="Software Engineer"
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label htmlFor="current-salary">Current Salary (Optional)</Label>
                                <Input
                                    id="current-salary"
                                    value={currentSalary}
                                    onChange={(e) => setCurrentSalary(e.target.value)}
                                    placeholder="$80,000 or 80k"
                                    className="mt-1"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <Label htmlFor="experience">Years of Experience (Optional)</Label>
                                <Input
                                    id="experience"
                                    type="number"
                                    value={yearsOfExperience}
                                    onChange={(e) => setYearsOfExperience(e.target.value)}
                                    placeholder="5"
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label htmlFor="location">Location (Optional)</Label>
                                <Input
                                    id="location"
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    placeholder="San Francisco, CA"
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label htmlFor="company">Company Name (Optional)</Label>
                                <Input
                                    id="company"
                                    value={companyName}
                                    onChange={(e) => setCompanyName(e.target.value)}
                                    placeholder="Tech Corp"
                                    className="mt-1"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="initial-offer">Initial Offer (Optional)</Label>
                                <Input
                                    id="initial-offer"
                                    value={initialOffer}
                                    onChange={(e) => setInitialOffer(e.target.value)}
                                    placeholder="$85,000"
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label htmlFor="scenario">Negotiation Scenario (Optional)</Label>
                                <Input
                                    id="scenario"
                                    value={negotiationScenario}
                                    onChange={(e) => setNegotiationScenario(e.target.value)}
                                    placeholder="entry-level, senior, remote, promotion"
                                    className="mt-1"
                                />
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="jd">Job Description (Optional)</Label>
                            <Textarea
                                id="jd"
                                value={jobDescription}
                                onChange={(e) => setJobDescription(e.target.value)}
                                placeholder="Paste job description for more accurate simulation..."
                                className="mt-1"
                                rows={3}
                            />
                        </div>

                        <Button
                            onClick={handleSimulate}
                            disabled={loading}
                            className="w-full md:w-auto bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Generating Simulation...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="mr-2 h-4 w-4" />
                                    Start Negotiation Simulation
                                </>
                            )}
                        </Button>

                        {error && (
                            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-center gap-2">
                                <AlertCircle className="w-5 h-5" />
                                {error}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {result && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        {/* Salary Benchmark */}
                        {result.salary_benchmark && (
                            <Card className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 shadow-lg">
                                <CardContent className="pt-6">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="text-sm opacity-90 mb-1">Market Salary Range</p>
                                            <p className="text-3xl font-bold">
                                                {result.salary_benchmark.market_range || "Available upon request"}
                                            </p>
                                            {result.salary_benchmark.percentile_50 && (
                                                <p className="text-sm opacity-90 mt-2">
                                                    Median: {result.salary_benchmark.percentile_50} | 75th Percentile: {result.salary_benchmark.percentile_75}
                                                </p>
                                            )}
                                        </div>
                                        <TrendingUp className="h-16 w-16 opacity-50" />
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Negotiation Conversation */}
                        {result.negotiation_conversation && result.negotiation_conversation.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <MessageSquare className="w-5 h-5" />
                                        Negotiation Conversation
                                    </CardTitle>
                                    <CardDescription>
                                        Simulated conversation between recruiter and candidate
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {result.negotiation_conversation.map((msg: any, idx: number) => (
                                            <div
                                                key={idx}
                                                className={`p-4 rounded-lg ${
                                                    msg.role === "recruiter"
                                                        ? "bg-blue-50 border-l-4 border-blue-500 ml-8"
                                                        : "bg-green-50 border-l-4 border-green-500 mr-8"
                                                }`}
                                            >
                                                <div className="flex justify-between items-start mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <span
                                                            className={`px-2 py-1 rounded text-xs font-medium ${
                                                                msg.role === "recruiter"
                                                                    ? "bg-blue-100 text-blue-700"
                                                                    : "bg-green-100 text-green-700"
                                                            }`}
                                                        >
                                                            {msg.role === "recruiter" ? "Recruiter" : "You"}
                                                        </span>
                                                        {msg.strategy && (
                                                            <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs">
                                                                {msg.strategy}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <span className="text-xs text-slate-500">{msg.timestamp || ""}</span>
                                                </div>
                                                <p className="text-slate-700">{msg.message}</p>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Negotiation Scripts */}
                        {result.recommended_scripts && result.recommended_scripts.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Recommended Negotiation Scripts</CardTitle>
                                    <CardDescription>
                                        Practice scripts for different negotiation scenarios
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {result.recommended_scripts.map((script: any, idx: number) => (
                                            <div key={idx} className="p-4 bg-slate-50 rounded-lg border">
                                                <div className="flex justify-between items-start mb-3">
                                                    <div>
                                                        <h4 className="font-semibold text-lg">{script.scenario_name}</h4>
                                                        <p className="text-sm text-slate-600 mt-1">{script.description}</p>
                                                    </div>
                                                    <span
                                                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                            script.difficulty === "easy"
                                                                ? "bg-green-100 text-green-700"
                                                                : script.difficulty === "medium"
                                                                ? "bg-yellow-100 text-yellow-700"
                                                                : "bg-red-100 text-red-700"
                                                        }`}
                                                    >
                                                        {script.difficulty}
                                                    </span>
                                                </div>

                                                {script.key_points && script.key_points.length > 0 && (
                                                    <div className="mb-3">
                                                        <p className="text-sm font-medium mb-2">Key Points:</p>
                                                        <ul className="list-disc list-inside space-y-1 text-sm text-slate-600">
                                                            {script.key_points.map((point: string, pIdx: number) => (
                                                                <li key={pIdx}>{point}</li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}

                                                {script.suggested_responses && script.suggested_responses.length > 0 && (
                                                    <div className="mb-3">
                                                        <p className="text-sm font-medium mb-2">Suggested Responses:</p>
                                                        <div className="space-y-2">
                                                            {script.suggested_responses.map((response: string, rIdx: number) => (
                                                                <div
                                                                    key={rIdx}
                                                                    className="p-2 bg-white rounded border border-green-200 text-sm"
                                                                >
                                                                    {response}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {script.counter_offer_suggestions && script.counter_offer_suggestions.length > 0 && (
                                                    <div>
                                                        <p className="text-sm font-medium mb-2">Counter-Offer Suggestions:</p>
                                                        <div className="flex gap-2 flex-wrap">
                                                            {script.counter_offer_suggestions.map((suggestion: string, sIdx: number) => (
                                                                <span
                                                                    key={sIdx}
                                                                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
                                                                >
                                                                    {suggestion}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Tips and Mistakes */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {result.negotiation_tips && result.negotiation_tips.length > 0 && (
                                <Card className="bg-green-50 border-green-200">
                                    <CardHeader>
                                        <CardTitle className="text-green-800 flex items-center gap-2">
                                            <Lightbulb className="w-5 h-5" />
                                            Negotiation Tips
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <ul className="list-disc list-inside space-y-2">
                                            {result.negotiation_tips.map((tip: string, idx: number) => (
                                                <li key={idx} className="text-slate-700">
                                                    {tip}
                                                </li>
                                            ))}
                                        </ul>
                                    </CardContent>
                                </Card>
                            )}

                            {result.common_mistakes_to_avoid && result.common_mistakes_to_avoid.length > 0 && (
                                <Card className="bg-red-50 border-red-200">
                                    <CardHeader>
                                        <CardTitle className="text-red-800 flex items-center gap-2">
                                            <XCircle className="w-5 h-5" />
                                            Common Mistakes to Avoid
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <ul className="list-disc list-inside space-y-2">
                                            {result.common_mistakes_to_avoid.map((mistake: string, idx: number) => (
                                                <li key={idx} className="text-slate-700">
                                                    {mistake}
                                                </li>
                                            ))}
                                        </ul>
                                    </CardContent>
                                </Card>
                            )}
                        </div>

                        {/* Power Phrases */}
                        {result.power_phrases && result.power_phrases.length > 0 && (
                            <Card className="bg-purple-50 border-purple-200">
                                <CardHeader>
                                    <CardTitle className="text-purple-800">Power Phrases</CardTitle>
                                    <CardDescription className="text-purple-700">
                                        Phrases that strengthen your negotiation position
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {result.power_phrases.map((phrase: string, idx: number) => (
                                            <div
                                                key={idx}
                                                className="p-3 bg-white rounded-lg border border-purple-200 text-sm italic text-slate-700"
                                            >
                                                "{phrase}"
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </motion.div>
                )}
            </div>
        </div>
    );
}

export default function SalaryNegotiationPage() {
    return (
        <ProtectedRoute>
            <SalaryNegotiationPageContent />
        </ProtectedRoute>
    );
}

