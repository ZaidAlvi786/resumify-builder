"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, Send, Upload, FileText, X, Bot, User, Loader2, Target, TrendingUp, Briefcase } from "lucide-react";
import { chatWithAIAgent, ChatMessage, ResumeData } from "@/services/api";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Logo from "@/components/ui/Logo";

function AIAgentPageContent() {
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            role: "assistant",
            content: "Hello! I'm your AI Resume Agent. How can I help you with your resume and job search today? I can help you:\n\n• Improve your resume score\n• Target your resume for specific jobs\n• Find job opportunities\n• Optimize keywords\n• Prepare for interviews\n• And much more!"
        }
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [resumeData, setResumeData] = useState<ResumeData | null>(null);
    const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage: ChatMessage = {
            role: "user",
            content: input.trim()
        };

        setMessages(prev => [...prev, userMessage]);
        setInput("");
        setIsLoading(true);

        try {
            const response = await chatWithAIAgent(
                [...messages, userMessage],
                resumeData || undefined,
                resumeData ? `User has uploaded a resume for ${resumeData.full_name || 'their profile'}` : undefined
            );

            const assistantMessage: ChatMessage = {
                role: "assistant",
                content: response.message
            };

            setMessages(prev => [...prev, assistantMessage]);
        } catch (error) {
            console.error("Chat error:", error);
            const errorMessage: ChatMessage = {
                role: "assistant",
                content: "I apologize, but I encountered an error. Please try again or rephrase your question."
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.type !== "application/pdf" && !file.type.startsWith("text/")) {
            alert("Please upload a PDF or text file");
            return;
        }

        setUploadedFileName(file.name);
        setIsLoading(true);

        try {
            const text = await file.text();
            // Simple parsing - in production, use a proper PDF parser
            const parsedData: Partial<ResumeData> = {
                full_name: "",
                email: "",
                phone: "",
                location: "",
                target_role: "",
                skills: [],
                experience: [],
                education: [],
                projects: []
            };

            // Add a message about the upload
            const uploadMessage: ChatMessage = {
                role: "assistant",
                content: `I've received your resume file "${file.name}". I can now help you improve it, target it for specific jobs, or answer questions about it. What would you like to do?`
            };
            setMessages(prev => [...prev, uploadMessage]);
        } catch (error) {
            console.error("File upload error:", error);
            alert("Failed to process the file. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const quickActions = [
        {
            label: "Improve My Resume Score",
            icon: TrendingUp,
            prompt: "How can I improve my resume score? Analyze my resume and give me specific recommendations."
        },
        {
            label: "Target My Resume",
            icon: Target,
            prompt: "Help me target my resume for a specific job. What keywords and skills should I add?"
        },
        {
            label: "Find Jobs",
            icon: Briefcase,
            prompt: "Help me find job opportunities that match my skills and experience."
        }
    ];

    const handleQuickAction = async (prompt: string) => {
        const userMessage: ChatMessage = {
            role: "user",
            content: prompt
        };

        setMessages(prev => [...prev, userMessage]);
        setIsLoading(true);

        try {
            const response = await chatWithAIAgent(
                [...messages, userMessage],
                resumeData || undefined,
                resumeData ? `User has uploaded a resume for ${resumeData.full_name || 'their profile'}` : undefined
            );

            const assistantMessage: ChatMessage = {
                role: "assistant",
                content: response.message
            };

            setMessages(prev => [...prev, assistantMessage]);
        } catch (error) {
            console.error("Chat error:", error);
            const errorMessage: ChatMessage = {
                role: "assistant",
                content: "I apologize, but I encountered an error. Please try again or rephrase your question."
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
            {/* Header */}
            <div className="border-b border-slate-200/60 bg-white/70 backdrop-blur-xl shadow-sm sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-4 group">
                        <Logo size="md" showText={true} />
                        <div className="h-6 w-px bg-slate-300" />
                        <div>
                            <h1 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                                AI Resume Agent
                            </h1>
                            <p className="text-xs text-slate-500">Your intelligent career assistant</p>
                        </div>
                    </Link>
                    <div className="flex items-center gap-3">
                        {uploadedFileName && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg text-sm border border-blue-200/50 shadow-sm"
                            >
                                <FileText className="w-4 h-4 text-blue-600" />
                                <span className="text-blue-700 font-medium">{uploadedFileName}</span>
                                <button
                                    onClick={() => {
                                        setUploadedFileName(null);
                                        setResumeData(null);
                                    }}
                                    className="text-blue-600 hover:text-blue-800 transition-colors ml-1"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </motion.div>
                        )}
                        <Link href="/">
                            <Button variant="outline" size="sm" className="border-slate-200 hover:border-blue-300 hover:bg-blue-50">
                                Home
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-hidden flex">
                {/* Main Chat Area */}
                <div className="flex-1 flex flex-col max-w-5xl mx-auto w-full">
                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto px-6 py-8 space-y-6">
                        {messages.length === 1 && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-center py-16"
                            >
                                <motion.div
                                    initial={{ scale: 0.9, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: 0.2 }}
                                    className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 mb-6 shadow-lg"
                                >
                                    <Sparkles className="w-10 h-10 text-white" />
                                </motion.div>
                                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 mb-3 bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
                                    How can AI Resume Agent help with your resume and job search?
                                </h2>
                                <p className="text-sm sm:text-base text-slate-600 mb-8 max-w-2xl mx-auto">
                                    Get personalized assistance with resume optimization, job targeting, and career guidance
                                </p>
                                
                                {/* Quick Action Buttons */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-10 max-w-4xl mx-auto">
                                    {quickActions.map((action, idx) => (
                                        <motion.button
                                            key={idx}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.1 + 0.3 }}
                                            whileHover={{ scale: 1.03, y: -4 }}
                                            whileTap={{ scale: 0.97 }}
                                            onClick={() => handleQuickAction(action.prompt)}
                                            className="relative p-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-slate-200/60 hover:shadow-xl hover:border-blue-300/60 transition-all text-left group overflow-hidden"
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            <div className="relative">
                                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-md">
                                                    <action.icon className="w-6 h-6 text-white" />
                                                </div>
                                                <div className="font-bold text-slate-900 text-base group-hover:text-blue-700 transition-colors">
                                                    {action.label}
                                                </div>
                                            </div>
                                        </motion.button>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        <AnimatePresence>
                            {messages.map((message, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.2 }}
                                    className={`flex gap-4 items-start ${message.role === "user" ? "justify-end" : "justify-start"}`}
                                >
                                    {message.role === "assistant" && (
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 flex items-center justify-center flex-shrink-0 shadow-md"
                                        >
                                            <Bot className="w-5 h-5 text-white" />
                                        </motion.div>
                                    )}
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className={`max-w-[75%] rounded-2xl px-5 py-4 ${
                                            message.role === "user"
                                                ? "bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg"
                                                : "bg-white/90 backdrop-blur-sm text-slate-900 shadow-md border border-slate-200/60"
                                        }`}
                                    >
                                        <div className="whitespace-pre-wrap text-sm leading-relaxed">
                                            {message.content}
                                        </div>
                                    </motion.div>
                                    {message.role === "user" && (
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center flex-shrink-0 shadow-sm"
                                        >
                                            <User className="w-5 h-5 text-slate-700" />
                                        </motion.div>
                                    )}
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        {isLoading && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex gap-4 items-start justify-start"
                            >
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 flex items-center justify-center shadow-md">
                                    <Bot className="w-5 h-5 text-white" />
                                </div>
                                <div className="bg-white/90 backdrop-blur-sm rounded-2xl px-5 py-4 shadow-md border border-slate-200/60">
                                    <div className="flex items-center gap-2">
                                        <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                                        <span className="text-sm text-slate-600">Thinking...</span>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="border-t border-slate-200/60 bg-white/70 backdrop-blur-xl p-6 shadow-lg">
                        <div className="max-w-5xl mx-auto">
                            {/* File Upload Button */}
                            <div className="mb-3 flex items-center gap-2">
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".pdf,.txt,.doc,.docx"
                                    onChange={handleFileUpload}
                                    className="hidden"
                                    id="resume-upload"
                                />
                                <label htmlFor="resume-upload">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="text-xs border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-all"
                                        disabled={isLoading}
                                    >
                                        <Upload className="w-3.5 h-3.5 mr-1.5" />
                                        Attach Resume
                                    </Button>
                                </label>
                                <span className="text-xs text-slate-500">PDF, TXT, DOC, DOCX supported</span>
                            </div>

                            {/* Input Field */}
                            <div className="flex gap-3">
                                <div className="flex-1 relative">
                                    <Input
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        onKeyPress={(e) => {
                                            if (e.key === "Enter" && !e.shiftKey) {
                                                e.preventDefault();
                                                handleSend();
                                            }
                                        }}
                                        placeholder="Describe your task or question, or attach a resume..."
                                        className="w-full pr-12 py-6 text-base border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 rounded-xl shadow-sm"
                                        disabled={isLoading}
                                    />
                                </div>
                                <Button
                                    onClick={handleSend}
                                    disabled={!input.trim() || isLoading}
                                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <Send className="w-5 h-5" />
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
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

