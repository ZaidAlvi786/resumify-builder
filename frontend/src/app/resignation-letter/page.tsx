"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { generateResignationLetter } from "@/services/api";
import { FileText, Download, Copy, CheckCircle2 } from "lucide-react";
import NeuralLoader from "@/components/ui/NeuralLoader";
import Sidebar from "@/components/Sidebar";
import { motion, AnimatePresence } from "framer-motion";

export default function ResignationLetterPage() {
    const [employeeName, setEmployeeName] = useState("");
    const [companyName, setCompanyName] = useState("");
    const [position, setPosition] = useState("");
    const [lastWorkingDay, setLastWorkingDay] = useState("");
    const [reason, setReason] = useState("");
    const [tone, setTone] = useState<"professional" | "friendly" | "formal">("professional");
    const [isLoading, setIsLoading] = useState(false);
    const [resignationLetter, setResignationLetter] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    const handleGenerate = async () => {
        if (!employeeName || !companyName || !position || !lastWorkingDay) {
            alert("Please fill in all required fields.");
            return;
        }

        setIsLoading(true);
        try {
            const data = await generateResignationLetter(
                employeeName,
                companyName,
                position,
                lastWorkingDay,
                reason || undefined,
                tone
            );
            setResignationLetter(data.resignation_letter);
        } catch (error) {
            console.error(error);
            alert("Failed to generate resignation letter.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopy = () => {
        if (resignationLetter) {
            navigator.clipboard.writeText(resignationLetter);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleDownload = () => {
        if (resignationLetter) {
            const blob = new Blob([resignationLetter], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `resignation-letter-${companyName}.txt`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
    };

    return (
        <>
            {isLoading && <NeuralLoader message="Crafting Your Professional Resignation Letter" />}
            <div className="flex min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
                <Sidebar />
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="flex-1 py-8 px-4 sm:px-8 lg:ml-64"
                >
                    <div className="max-w-4xl mx-auto space-y-8">
                        <motion.header
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-center"
                        >
                            <h1 className="text-4xl font-display font-bold text-slate-900 mb-2">Resignation Letter Generator</h1>
                            <p className="text-slate-600">Create a professional resignation letter that maintains positive relationships</p>
                        </motion.header>

                        <Card className="shadow-xl">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <FileText className="w-5 h-5" />
                                    Generate Your Resignation Letter
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="employee_name">Your Name *</Label>
                                        <Input
                                            id="employee_name"
                                            placeholder="John Doe"
                                            value={employeeName}
                                            onChange={(e) => setEmployeeName(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="position">Your Position *</Label>
                                        <Input
                                            id="position"
                                            placeholder="Senior Software Engineer"
                                            value={position}
                                            onChange={(e) => setPosition(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="company_name">Company Name *</Label>
                                    <Input
                                        id="company_name"
                                        placeholder="Google"
                                        value={companyName}
                                        onChange={(e) => setCompanyName(e.target.value)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="last_working_day">Last Working Day *</Label>
                                    <Input
                                        id="last_working_day"
                                        type="date"
                                        value={lastWorkingDay}
                                        onChange={(e) => setLastWorkingDay(e.target.value)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="tone">Tone</Label>
                                    <select
                                        id="tone"
                                        value={tone}
                                        onChange={(e) => setTone(e.target.value as "professional" | "friendly" | "formal")}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="professional">Professional</option>
                                        <option value="friendly">Friendly</option>
                                        <option value="formal">Formal</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="reason">Reason for Leaving (Optional)</Label>
                                    <Textarea
                                        id="reason"
                                        placeholder="e.g., Pursuing new opportunities, career growth, relocation..."
                                        className="min-h-[100px]"
                                        value={reason}
                                        onChange={(e) => setReason(e.target.value)}
                                    />
                                </div>

                                <Button
                                    onClick={handleGenerate}
                                    disabled={isLoading}
                                    className="w-full h-12 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold"
                                >
                                    Generate Resignation Letter
                                </Button>
                            </CardContent>
                        </Card>

                        <AnimatePresence>
                            {resignationLetter && (
                                <motion.div
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.5 }}
                                >
                                    <Card className="shadow-xl border-t-4 border-t-indigo-500">
                                        <CardHeader>
                                            <div className="flex items-center justify-between">
                                                <CardTitle>Your Resignation Letter</CardTitle>
                                                <div className="flex gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={handleCopy}
                                                        className="flex items-center gap-2"
                                                    >
                                                        {copied ? (
                                                            <>
                                                                <CheckCircle2 className="w-4 h-4 text-green-600" />
                                                                Copied!
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Copy className="w-4 h-4" />
                                                                Copy
                                                            </>
                                                        )}
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={handleDownload}
                                                        className="flex items-center gap-2"
                                                    >
                                                        <Download className="w-4 h-4" />
                                                        Download
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="prose max-w-none bg-white p-6 rounded-lg border border-slate-200 whitespace-pre-wrap text-slate-700 leading-relaxed">
                                                {resignationLetter}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </motion.div>
            </div>
        </>
    );
}

