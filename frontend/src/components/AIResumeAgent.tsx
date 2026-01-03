"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Send, Upload, Sparkles, X, FileText, Target, TrendingUp, Briefcase, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { chatWithAIAgent, ChatMessage, ResumeData } from "@/services/api";

interface Message {
    id: string;
    role: "user" | "assistant";
    content: string;
    timestamp: Date;
    attachments?: string[];
}

interface AIResumeAgentProps {
    onQuickAction?: (action: "improve_score" | "target_resume" | "find_jobs") => void;
    resumeData?: any;
    className?: string;
}

const AIResumeAgent: React.FC<AIResumeAgentProps> = ({ onQuickAction, resumeData, className }) => {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: "1",
            role: "assistant",
            content: "Hello! I'm your AI Resume Agent. How can I help you with your resume and job search today?",
            timestamp: new Date(),
        },
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [attachedResume, setAttachedResume] = useState<File | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() && !attachedResume) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: "user",
            content: input,
            timestamp: new Date(),
            attachments: attachedResume ? [attachedResume.name] : undefined,
        };

        setMessages((prev) => [...prev, userMessage]);
        const currentInput = input;
        setInput("");
        setIsLoading(true);

        try {
            // Convert messages to API format
            const apiMessages: ChatMessage[] = messages.map(msg => ({
                role: msg.role,
                content: msg.content
            }));
            apiMessages.push({
                role: "user",
                content: currentInput
            });

            // Call the API
            const response = await chatWithAIAgent(
                apiMessages,
                resumeData,
                attachedResume ? `User attached resume file: ${attachedResume.name}` : undefined
            );

            const assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: response.message,
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, assistantMessage]);
        } catch (error) {
            console.error("Error chatting with AI:", error);
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: "I apologize, but I'm having trouble processing your request right now. Please try again in a moment.",
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
            setAttachedResume(null);
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.type === "application/pdf" || file.type.startsWith("image/")) {
                setAttachedResume(file);
            } else {
                alert("Please upload a PDF or image file");
            }
        }
    };

    const handleQuickAction = (action: "improve_score" | "target_resume" | "find_jobs") => {
        if (onQuickAction) {
            onQuickAction(action);
        } else {
            const actionMessages = {
                improve_score: "I'd like to improve my resume score. Can you analyze my resume and provide specific recommendations?",
                target_resume: "I want to target my resume for a specific job. Can you help me optimize it?",
                find_jobs: "Can you help me find jobs that match my resume and skills?",
            };

            setInput(actionMessages[action]);
            handleSend();
        }
    };

    return (
        <div className={`flex flex-col h-full ${className}`}>
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    <h3 className="font-semibold">AI Resume Agent</h3>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-white hover:bg-white/20"
                        onClick={() => handleQuickAction("improve_score")}
                    >
                        <TrendingUp className="w-4 h-4 mr-1" />
                        Improve Score
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-white hover:bg-white/20"
                        onClick={() => handleQuickAction("target_resume")}
                    >
                        <Target className="w-4 h-4 mr-1" />
                        Target Resume
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-white hover:bg-white/20"
                        onClick={() => handleQuickAction("find_jobs")}
                    >
                        <Briefcase className="w-4 h-4 mr-1" />
                        Find Jobs
                    </Button>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
                <AnimatePresence>
                    {messages.map((message) => (
                        <motion.div
                            key={message.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                        >
                            <div
                                className={`max-w-[80%] rounded-lg p-3 ${
                                    message.role === "user"
                                        ? "bg-blue-600 text-white"
                                        : "bg-white text-slate-900 shadow-sm border"
                                }`}
                            >
                                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                                {message.attachments && (
                                    <div className="mt-2 flex items-center gap-2 text-xs opacity-80">
                                        <FileText className="w-3 h-3" />
                                        {message.attachments.join(", ")}
                                    </div>
                                )}
                                <p className="text-xs opacity-70 mt-1">
                                    {message.timestamp.toLocaleTimeString()}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-white rounded-lg p-3 shadow-sm border">
                            <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t bg-white">
                {attachedResume && (
                    <div className="mb-2 flex items-center gap-2 p-2 bg-blue-50 rounded-lg">
                        <FileText className="w-4 h-4 text-blue-600" />
                        <span className="text-sm text-blue-900 flex-1">{attachedResume.name}</span>
                        <button
                            onClick={() => setAttachedResume(null)}
                            className="text-blue-600 hover:text-blue-800"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                )}
                <div className="flex gap-2">
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf,image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                    />
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex-shrink-0"
                    >
                        <Upload className="w-4 h-4" />
                    </Button>
                    <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                        placeholder="Describe your task or question, or attach a resume..."
                        className="flex-1"
                    />
                    <Button
                        onClick={handleSend}
                        disabled={!input.trim() && !attachedResume}
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        <Send className="w-4 h-4" />
                    </Button>
                </div>
                <p className="text-xs text-slate-500 mt-2 text-center">
                    Ask me anything about your resume, job search, or career goals
                </p>
            </div>
        </div>
    );
};

export default AIResumeAgent;

