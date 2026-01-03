"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { rewriteBulletPoint } from "@/services/api";
import { Sparkles, Loader2, CheckCircle2, Copy, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface BulletPointRewriterProps {
    originalBullet: string;
    targetRole: string;
    context?: string;
    onImproved: (improvedBullet: string) => void;
    onClose: () => void;
}

export default function BulletPointRewriter({
    originalBullet,
    targetRole,
    context,
    onImproved,
    onClose
}: BulletPointRewriterProps) {
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
            alert(`Failed to rewrite bullet: ${error.message || "An unexpected error occurred."}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUseImproved = () => {
        if (improvedBullet) {
            onImproved(improvedBullet);
            onClose();
        }
    };

    const handleCopy = () => {
        if (improvedBullet) {
            navigator.clipboard.writeText(improvedBullet);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ y: 20 }}
                animate={{ y: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
                <Card className="border-0 shadow-none">
                    <CardHeader className="flex flex-row items-center justify-between pb-4">
                        <CardTitle className="flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-blue-600" />
                            AI Bullet Point Rewriter
                        </CardTitle>
                        <Button variant="ghost" size="sm" onClick={onClose}>
                            <X className="w-4 h-4" />
                        </Button>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Original Bullet */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">Original Bullet Point</label>
                            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                                <p className="text-slate-700">{originalBullet}</p>
                            </div>
                        </div>

                        {/* Target Role */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">Target Role</label>
                            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                                <p className="text-blue-700 font-medium">{targetRole}</p>
                            </div>
                        </div>

                        {/* Rewrite Button */}
                        {!improvedBullet && (
                            <Button
                                onClick={handleRewrite}
                                disabled={isLoading}
                                className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
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
                        )}

                        {/* Improved Bullet */}
                        <AnimatePresence>
                            {improvedBullet && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="space-y-4"
                                >
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-green-700 flex items-center gap-2">
                                            <CheckCircle2 className="w-4 h-4" />
                                            Improved Bullet Point
                                        </label>
                                        <div className="p-4 bg-green-50 rounded-lg border-2 border-green-200">
                                            <p className="text-slate-900 font-medium">{improvedBullet}</p>
                                        </div>
                                    </div>

                                    {/* Improvements Made */}
                                    {improvements.length > 0 && (
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-slate-700">Improvements Made</label>
                                            <ul className="space-y-2">
                                                {improvements.map((improvement, idx) => (
                                                    <li key={idx} className="flex items-start gap-2 text-sm text-slate-600">
                                                        <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                                                        <span>{improvement}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {/* Keywords Added */}
                                    {keywords.length > 0 && (
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-slate-700">Keywords Added</label>
                                            <div className="flex flex-wrap gap-2">
                                                {keywords.map((keyword, idx) => (
                                                    <span
                                                        key={idx}
                                                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium"
                                                    >
                                                        {keyword}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Actions */}
                                    <div className="flex gap-3 pt-4 border-t">
                                        <Button
                                            onClick={handleUseImproved}
                                            className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                                        >
                                            <CheckCircle2 className="mr-2 w-4 h-4" />
                                            Use This Version
                                        </Button>
                                        <Button
                                            variant="outline"
                                            onClick={handleCopy}
                                            className="flex-shrink-0"
                                        >
                                            <Copy className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            variant="outline"
                                            onClick={() => {
                                                setImprovedBullet(null);
                                                setImprovements([]);
                                                setKeywords([]);
                                            }}
                                        >
                                            Try Again
                                        </Button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </CardContent>
                </Card>
            </motion.div>
        </motion.div>
    );
}
