"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { rewriteBulletPoint } from "@/services/api";
import { Sparkles, Loader2, CheckCircle2, Copy, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface BulletRewriterProps {
    originalBullet: string;
    targetRole: string;
    context?: string;
    onImproved: (improvedBullet: string) => void;
    onClose?: () => void;
}

export default function BulletRewriter({
    originalBullet,
    targetRole,
    context,
    onImproved,
    onClose
}: BulletRewriterProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [improvedBullet, setImprovedBullet] = useState<string | null>(null);
    const [improvements, setImprovements] = useState<string[]>([]);
    const [keywords, setKeywords] = useState<string[]>([]);

    const handleRewrite = async () => {
        setIsLoading(true);
        try {
            const result = await rewriteBulletPoint(originalBullet, targetRole, context);
            setImprovedBullet(result.improved_bullet);
            setImprovements(result.improvements_made || []);
            setKeywords(result.keywords_added || []);
        } catch (error: any) {
            console.error(error);
            alert(`Failed to rewrite bullet: ${error.message || "An unexpected error occurred."}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUseImproved = () => {
        if (improvedBullet) {
            onImproved(improvedBullet);
            if (onClose) onClose();
        }
    };

    const handleCopy = () => {
        if (improvedBullet) {
            navigator.clipboard.writeText(improvedBullet);
        }
    };

    return (
        <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-blue-700">
                        <Sparkles className="w-5 h-5" />
                        AI Bullet Point Rewriter
                    </CardTitle>
                    {onClose && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onClose}
                            className="h-8 w-8 p-0"
                        >
                            <X className="w-4 h-4" />
                        </Button>
                    )}
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <label className="text-sm font-semibold text-slate-700 mb-2 block">
                        Original Bullet Point:
                    </label>
                    <div className="p-3 bg-white rounded-lg border border-slate-200 text-sm text-slate-600">
                        {originalBullet}
                    </div>
                </div>

                <Button
                    onClick={handleRewrite}
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                            Rewriting...
                        </>
                    ) : (
                        <>
                            <Sparkles className="mr-2 w-4 h-4" />
                            Rewrite with AI
                        </>
                    )}
                </Button>

                <AnimatePresence>
                    {improvedBullet && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-4"
                        >
                            <div>
                                <label className="text-sm font-semibold text-green-700 mb-2 block">
                                    Improved Bullet Point:
                                </label>
                                <div className="p-3 bg-white rounded-lg border-2 border-green-200 text-sm text-slate-700 font-medium">
                                    {improvedBullet}
                                </div>
                            </div>

                            {improvements.length > 0 && (
                                <div>
                                    <label className="text-sm font-semibold text-slate-700 mb-2 block">
                                        Improvements Made:
                                    </label>
                                    <ul className="space-y-1">
                                        {improvements.map((improvement, idx) => (
                                            <li key={idx} className="flex items-start text-sm text-slate-600">
                                                <CheckCircle2 className="w-4 h-4 mr-2 text-green-600 mt-0.5 flex-shrink-0" />
                                                {improvement}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {keywords.length > 0 && (
                                <div>
                                    <label className="text-sm font-semibold text-slate-700 mb-2 block">
                                        Keywords Added:
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        {keywords.map((keyword, idx) => (
                                            <span
                                                key={idx}
                                                className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium"
                                            >
                                                {keyword}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-2">
                                <Button
                                    onClick={handleUseImproved}
                                    className="flex-1 bg-green-600 hover:bg-green-700"
                                >
                                    <CheckCircle2 className="mr-2 w-4 h-4" />
                                    Use This Version
                                </Button>
                                <Button
                                    onClick={handleCopy}
                                    variant="outline"
                                    size="sm"
                                >
                                    <Copy className="w-4 h-4" />
                                </Button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </CardContent>
        </Card>
    );
}

