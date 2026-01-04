"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { translateResume } from "@/services/api";
import { Loader2, Globe, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import ProtectedRoute from "@/components/ProtectedRoute";

const LANGUAGES = [
    { code: "Spanish", name: "Spanish (Español)" },
    { code: "French", name: "French (Français)" },
    { code: "German", name: "German (Deutsch)" },
    { code: "Italian", name: "Italian (Italiano)" },
    { code: "Portuguese", name: "Portuguese (Português)" },
    { code: "Chinese", name: "Chinese (中文)" },
    { code: "Japanese", name: "Japanese (日本語)" },
    { code: "Korean", name: "Korean (한국어)" },
    { code: "Arabic", name: "Arabic (العربية)" },
    { code: "Russian", name: "Russian (Русский)" },
    { code: "Dutch", name: "Dutch (Nederlands)" },
    { code: "Hindi", name: "Hindi (हिन्दी)" },
];

function TranslatePageContent() {
    const [resumeText, setResumeText] = useState("");
    const [targetLanguage, setTargetLanguage] = useState("Spanish");
    const [loading, setLoading] = useState(false);
    const [translation, setTranslation] = useState<any>(null);
    const [error, setError] = useState("");

    const handleTranslate = async () => {
        if (!resumeText.trim()) {
            setError("Please provide resume text");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const result = await translateResume(resumeText, targetLanguage, true);
            setTranslation(result);
        } catch (err: any) {
            setError(err.message || "Failed to translate resume");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-slate-50">
            <Sidebar />
            <div className="flex-1 py-8 px-4 sm:px-8 max-w-6xl mx-auto w-full lg:ml-64">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 mb-2">
                        Multi-Language Resume Generator
                    </h1>
                    <p className="text-slate-600">
                        Translate your resume to any language with cultural adaptations for global opportunities
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Original Resume</CardTitle>
                            <CardDescription>
                                Enter your resume and select target language
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label htmlFor="language">Target Language *</Label>
                                <select
                                    id="language"
                                    value={targetLanguage}
                                    onChange={(e) => setTargetLanguage(e.target.value)}
                                    className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2"
                                >
                                    {LANGUAGES.map((lang) => (
                                        <option key={lang.code} value={lang.code}>
                                            {lang.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <Label htmlFor="resume">Resume Text *</Label>
                                <Textarea
                                    id="resume"
                                    value={resumeText}
                                    onChange={(e) => setResumeText(e.target.value)}
                                    placeholder="Paste your resume text here..."
                                    className="min-h-[400px]"
                                />
                            </div>
                            {error && (
                                <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
                                    {error}
                                </div>
                            )}
                            <Button
                                onClick={handleTranslate}
                                disabled={loading}
                                className="w-full"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Translating...
                                    </>
                                ) : (
                                    <>
                                        <Globe className="mr-2 h-4 w-4" />
                                        Translate Resume
                                    </>
                                )}
                            </Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>
                                Translated Resume ({translation?.language || targetLanguage})
                            </CardTitle>
                            <CardDescription>
                                {translation?.confidence_score && (
                                    <span>Confidence: {(translation.confidence_score * 100).toFixed(0)}%</span>
                                )}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {translation ? (
                                <div className="space-y-4">
                                    <div className="bg-slate-50 rounded-lg p-4 min-h-[400px] whitespace-pre-wrap text-slate-900">
                                        {translation.translated_resume}
                                    </div>
                                    
                                    {translation.cultural_adaptations.length > 0 && (
                                        <div className="border-t pt-4">
                                            <h4 className="font-semibold mb-2 flex items-center gap-2">
                                                <CheckCircle2 className="h-4 w-4 text-blue-500" />
                                                Cultural Adaptations
                                            </h4>
                                            <ul className="space-y-1 text-sm text-slate-600">
                                                {translation.cultural_adaptations.map((adaptation: string, idx: number) => (
                                                    <li key={idx} className="flex items-start gap-2">
                                                        <span className="text-blue-500 mt-1">•</span>
                                                        <span>{adaptation}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    <Button
                                        onClick={() => {
                                            navigator.clipboard.writeText(translation.translated_resume);
                                        }}
                                        variant="outline"
                                        className="w-full"
                                    >
                                        Copy Translated Resume
                                    </Button>
                                </div>
                            ) : (
                                <div className="flex items-center justify-center min-h-[400px]">
                                    <div className="text-center text-slate-400">
                                        <Globe className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                        <p>Enter your resume and select a language to see the translation</p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

export default function TranslatePage() {
    return (
        <ProtectedRoute>
            <TranslatePageContent />
        </ProtectedRoute>
    );
}

