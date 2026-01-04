"use client";

import ResumeBuilder from "@/components/ResumeBuilder/ResumeBuilder";
import Sidebar from "@/components/Sidebar";
import AIResumeAgent from "@/components/AIResumeAgent";
import ProtectedRoute from "@/components/ProtectedRoute";
import { motion } from "framer-motion";
import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

function BuilderPageContent() {
    const [showAIAgent, setShowAIAgent] = useState(false);

    const handleQuickAction = (action: "improve_score" | "target_resume" | "find_jobs") => {
        setShowAIAgent(true);
        // Handle quick actions - can navigate to specific pages or trigger functions
        if (action === "improve_score") {
            window.location.href = "/reviewer";
        } else if (action === "target_resume") {
            // Could open a modal or navigate
        } else if (action === "find_jobs") {
            // Could integrate with job search
        }
    };

    return (
        <div className="flex min-h-screen bg-slate-50 overflow-x-hidden">
            <Sidebar />
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="flex-1 py-8 px-4 sm:px-8 lg:ml-64 relative"
            >
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1, duration: 0.4 }}
                        className="mb-8 flex items-center justify-between"
                    >
                        <div>
                            <h1 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold text-slate-900 mb-2">
                                Resume Builder
                            </h1>
                            <p className="text-sm sm:text-base text-slate-600 font-display">
                                Follow the steps to generate your professional resume.
                            </p>
                        </div>
                        <Button
                            onClick={() => setShowAIAgent(!showAIAgent)}
                            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                        >
                            {showAIAgent ? "Hide" : "Show"} AI Agent
                        </Button>
                    </motion.div>
                    <div className="flex gap-6">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2, duration: 0.4 }}
                            className="flex-1"
                        >
                            <ResumeBuilder />
                        </motion.div>
                        {showAIAgent && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="w-96 flex-shrink-0"
                            >
                                <div className="sticky top-8 h-[calc(100vh-4rem)]">
                                    <AIResumeAgent onQuickAction={handleQuickAction} />
                                </div>
                            </motion.div>
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

export default function BuilderPage() {
    return (
        <ProtectedRoute>
            <BuilderPageContent />
        </ProtectedRoute>
    );
}
