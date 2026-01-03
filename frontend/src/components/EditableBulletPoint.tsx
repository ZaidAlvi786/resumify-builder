"use client";

import React, { useState } from "react";
import { Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import BulletPointRewriter from "./BulletPointRewriter";

interface EditableBulletPointProps {
    bullet: string;
    targetRole: string;
    onUpdate: (newBullet: string) => void;
    context?: string;
}

export default function EditableBulletPoint({
    bullet,
    targetRole,
    onUpdate,
    context
}: EditableBulletPointProps) {
    const [showRewriter, setShowRewriter] = useState(false);

    return (
        <>
            <motion.li
                className="group relative flex items-start gap-2 text-sm text-slate-700 hover:bg-slate-50 rounded-lg p-2 -ml-2 transition-colors"
                whileHover={{ x: 4 }}
            >
                <span className="mt-1.5 flex-shrink-0">•</span>
                <span className="flex-1">{bullet}</span>
                <button
                    onClick={() => setShowRewriter(true)}
                    className="opacity-0 group-hover:opacity-100 flex items-center gap-1 px-2 py-1 text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-all flex-shrink-0"
                    title="Rewrite with AI"
                >
                    <Sparkles className="w-3 h-3" />
                    <span className="hidden sm:inline">AI Rewrite</span>
                </button>
            </motion.li>

            {showRewriter && (
                <BulletPointRewriter
                    originalBullet={bullet}
                    targetRole={targetRole}
                    context={context}
                    onImproved={(improved) => {
                        onUpdate(improved);
                        setShowRewriter(false);
                    }}
                    onClose={() => setShowRewriter(false)}
                />
            )}
        </>
    );
}

