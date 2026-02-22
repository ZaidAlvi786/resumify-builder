"use client";

import React from "react";
import AIResumeAgent from "@/components/AIResumeAgent";
import ProtectedRoute from "@/components/ProtectedRoute";
import { motion } from "framer-motion";

function AIAgentPageContent() {
    return (
        <div className="flex min-h-screen bg-slate-50 overflow-hidden">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
                className="flex-1 relative flex flex-col h-screen"
            >
                <div className="flex-1 flex flex-col h-full">
                    <AIResumeAgent className="h-full border-none shadow-none rounded-none" />
                </div>
            </motion.div>
        </div>
    );
}

export default function AIAgentPage() {
    return (
        <ProtectedRoute>
            <AIAgentPageContent />
        </ProtectedRoute>
    );
}


