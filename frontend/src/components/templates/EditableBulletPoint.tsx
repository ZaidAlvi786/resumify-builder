"use client";

import React, { useState } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import BulletRewriter from "@/components/BulletRewriter";

interface EditableBulletPointProps {
    bullet: string;
    expIndex: number;
    bulletIndex: number;
    targetRole: string;
    onUpdate: (expIndex: number, bulletIndex: number, newBullet: string) => void;
    isEditable?: boolean;
}

export default function EditableBulletPoint({
    bullet,
    expIndex,
    bulletIndex,
    targetRole,
    onUpdate,
    isEditable = true
}: EditableBulletPointProps) {
    const [showRewriter, setShowRewriter] = useState(false);

    if (!isEditable) {
        return <li>{bullet}</li>;
    }

    return (
        <>
            <li className="group relative">
                <span>{bullet}</span>
                <Button
                    variant="ghost"
                    size="sm"
                    className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity h-6 px-2 text-xs"
                    onClick={() => setShowRewriter(true)}
                >
                    <Sparkles className="w-3 h-3 mr-1" />
                    Rewrite
                </Button>
            </li>
            {showRewriter && (
                <div className="mt-2 mb-4">
                    <BulletRewriter
                        originalBullet={bullet}
                        targetRole={targetRole}
                        onImproved={(improvedBullet) => {
                            onUpdate(expIndex, bulletIndex, improvedBullet);
                            setShowRewriter(false);
                        }}
                        onClose={() => setShowRewriter(false)}
                    />
                </div>
            )}
        </>
    );
}

