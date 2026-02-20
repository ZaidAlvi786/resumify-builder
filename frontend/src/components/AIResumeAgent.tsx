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
    suggestions?: string[];
}

interface AIResumeAgentProps {
    onQuickAction?: (action: "improve_score" | "target_resume" | "find_jobs") => void;
    resumeData?: any;
    className?: string;
}

const AIResumeAgent: React.FC<AIResumeAgentProps> = ({ onQuickAction, resumeData, className }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [attachedResume, setAttachedResume] = useState<File | null>(null);
    const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
    const [abortController, setAbortController] = useState<AbortController | null>(null);
    
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Load messages from localStorage on mount
    useEffect(() => {
        const savedMessages = localStorage.getItem("ai_chat_history");
        if (savedMessages) {
            try {
                const parsed = JSON.parse(savedMessages);
                setMessages(parsed.map((m: any) => ({
                    ...m,
                    timestamp: new Date(m.timestamp)
                })));
            } catch (e) {
                console.error("Failed to parse chat history", e);
            }
        } else {
            setMessages([
                {
                    id: "1",
                    role: "assistant",
                    content: "Hello! I'm your AI Resume Agent. How can I help you with your resume and job search today?",
                    timestamp: new Date(),
                },
            ]);
        }
    }, []);

    // Save messages to localStorage whenever they change
    useEffect(() => {
        if (messages.length > 0) {
            localStorage.setItem("ai_chat_history", JSON.stringify(messages));
        }
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    const handleCancel = () => {
        if (abortController) {
            abortController.abort();
            setAbortController(null);
            setIsLoading(false);
        }
    };

    const handleSend = async (overrideInput?: string, editId?: string) => {
        const messageContent = overrideInput || input;
        if (!messageContent.trim() && !attachedResume) return;

        // If editing, remove all messages after the edited message
        let currentMessages = [...messages];
        if (editId) {
            const editIndex = currentMessages.findIndex(m => m.id === editId);
            if (editIndex !== -1) {
                currentMessages = currentMessages.slice(0, editIndex);
            }
        }

        const userMessage: Message = {
            id: editId || Date.now().toString(),
            role: "user",
            content: messageContent,
            timestamp: new Date(),
            attachments: attachedResume ? [attachedResume.name] : undefined,
        };

        const newMessages = [...currentMessages, userMessage];
        setMessages(newMessages);
        setInput("");
        setAttachedResume(null);
        setEditingMessageId(null);
        setIsLoading(true);

        const controller = new AbortController();
        setAbortController(controller);

        try {
            const assistantMessageId = (Date.now() + 1).toString();
            const initialAssistantMessage: Message = {
                id: assistantMessageId,
                role: "assistant",
                content: "",
                timestamp: new Date(),
            };

            setMessages((prev) => [...prev, initialAssistantMessage]);

            const apiMessages: ChatMessage[] = newMessages.map((m) => ({
                role: m.role,
                content: m.content,
            }));

            await chatWithAIAgent(
                apiMessages,
                resumeData,
                attachedResume ? `User attached resume file: ${attachedResume.name}` : undefined,
                (chunk) => {
                    setMessages((prev) => {
                        const updated = [...prev];
                        const index = updated.findIndex(m => m.id === assistantMessageId);
                        if (index !== -1) {
                            updated[index] = {
                                ...updated[index],
                                content: updated[index].content + chunk,
                            };
                        }
                        return updated;
                    });
                },
                (suggestions) => {
                    setMessages((prev) => {
                        const updated = [...prev];
                        const index = updated.findIndex(m => m.id === assistantMessageId);
                        if (index !== -1) {
                            updated[index] = {
                                ...updated[index],
                                suggestions: suggestions,
                            };
                        }
                        return updated;
                    });
                },
                controller.signal
            );
        } catch (error: any) {
            if (error.name === 'AbortError') {
                console.log("Response generation canceled by user");
            } else {
                console.error("Error fetching AI response:", error);
                setMessages((prev) => {
                    const updated = [...prev];
                    const lastMsg = updated[updated.length - 1];
                    if (lastMsg && lastMsg.role === "assistant" && !lastMsg.content) {
                        updated[updated.length - 1] = {
                            ...lastMsg,
                            content: "I apologize, but I'm having trouble processing your request right now. Please try again.",
                        };
                    }
                    return updated;
                });
            }
        } finally {
            setIsLoading(false);
            setAbortController(null);
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
            handleSend(actionMessages[action]);
        }
    };

    const clearHistory = () => {
        if (confirm("Are you sure you want to clear your chat history?")) {
            localStorage.removeItem("ai_chat_history");
            setMessages([
                {
                    id: "1",
                    role: "assistant",
                    content: "Hello! I'm your AI Resume Agent. How can I help you with your resume and job search today?",
                    timestamp: new Date(),
                },
            ]);
        }
    };

    return (
        <div className={`flex flex-col h-full ${className}`}>
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-blue-700 to-indigo-800 text-white shadow-md">
                <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-yellow-400" />
                    <h3 className="font-bold tracking-tight">AI Career Pro</h3>
                </div>
                <div className="flex items-center gap-2">
                    <div className="hidden lg:flex gap-1.5 mr-4">
                        <Button variant="ghost" size="sm" className="text-white hover:bg-white/10 h-8 px-2" onClick={() => handleQuickAction("improve_score")}>Score</Button>
                        <Button variant="ghost" size="sm" className="text-white hover:bg-white/10 h-8 px-2" onClick={() => handleQuickAction("target_resume")}>Target</Button>
                        <Button variant="ghost" size="sm" className="text-white hover:bg-white/10 h-8 px-2" onClick={() => handleQuickAction("find_jobs")}>Jobs</Button>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-white hover:bg-white/20 h-8 w-8"
                        onClick={clearHistory}
                        title="Clear History"
                    >
                        <X className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-[#f8fafc]">
                <AnimatePresence initial={false}>
                    {messages.map((message) => (
                        <motion.div
                            key={message.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                        >
                            <div
                                className={`group relative max-w-[85%] rounded-2xl p-4 transition-all ${
                                    message.role === "user"
                                        ? "bg-blue-600 text-white shadow-blue-200 shadow-lg"
                                        : "bg-white text-slate-800 shadow-sm border border-slate-200"
                                }`}
                            >
                                {message.role === "user" && !editingMessageId && (
                                    <button 
                                        onClick={() => {
                                            setEditingMessageId(message.id);
                                            setInput(message.content);
                                        }}
                                        className="absolute -left-8 top-1 opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-blue-500 transition-all"
                                        title="Edit message"
                                    >
                                        <FileText className="w-4 h-4" />
                                    </button>
                                )}

                                <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                                
                                {message.attachments && (
                                    <div className="mt-2 flex items-center gap-2 text-xs font-medium bg-white/10 p-1.5 rounded-lg">
                                        <Upload className="w-3 h-3" />
                                        {message.attachments.join(", ")}
                                    </div>
                                )}

                                {message.suggestions && message.suggestions.length > 0 && (
                                    <div className="mt-4 space-y-2 border-t pt-3 border-slate-100">
                                        <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Quick Responses</p>
                                        <div className="flex flex-wrap gap-2">
                                            {message.suggestions.map((suggestion, idx) => (
                                                <button 
                                                    key={idx}
                                                    onClick={() => handleSend(suggestion)}
                                                    className="text-xs bg-slate-50 text-slate-700 font-medium px-3 py-1.5 rounded-full hover:bg-blue-50 hover:text-blue-700 transition-all border border-slate-200"
                                                >
                                                    {suggestion}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                <div className="mt-2 flex items-center justify-between">
                                    <p className="text-[10px] opacity-50 font-medium">
                                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 flex items-center gap-3">
                            <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                            <span className="text-xs font-medium text-slate-500 italic">Thinking...</span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t bg-white shadow-[0_-4px_10px_rgba(0,0,0,0.02)]">
                {attachedResume && (
                    <div className="mb-3 flex items-center gap-2 p-2.5 bg-blue-50 border border-blue-100 rounded-xl animate-in slide-in-from-bottom-2">
                        <FileText className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-900 flex-1 truncate">{attachedResume.name}</span>
                        <button onClick={() => setAttachedResume(null)} className="text-blue-400 hover:text-blue-600">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                )}
                
                {editingMessageId && (
                    <div className="mb-3 flex items-center justify-between p-2.5 bg-yellow-50 border border-yellow-100 rounded-xl">
                        <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-yellow-600" />
                            <span className="text-sm font-medium text-yellow-900">Editing message...</span>
                        </div>
                        <button onClick={() => {setEditingMessageId(null); setInput("");}} className="text-xs font-bold text-yellow-700 hover:underline">Cancel</button>
                    </div>
                )}

                <div className="flex gap-2 items-end">
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf,image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                    />
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex-shrink-0 h-11 w-11 rounded-xl border-slate-200 hover:bg-slate-50"
                    >
                        <Upload className="w-4 h-4 text-slate-500" />
                    </Button>
                    <div className="relative flex-1 group">
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSend(input, editingMessageId || undefined);
                                }
                            }}
                            placeholder="Type your message..."
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all scrollbar-hide resize-none min-h-[44px] max-h-[120px]"
                            rows={1}
                        />
                    </div>
                    {isLoading ? (
                        <Button
                            onClick={handleCancel}
                            variant="destructive"
                            className="h-11 w-11 rounded-xl bg-red-500 hover:bg-red-600 text-white shadow-lg"
                        >
                            <X className="w-5 h-5" />
                        </Button>
                    ) : (
                        <Button
                            onClick={() => handleSend(input, editingMessageId || undefined)}
                            disabled={!input.trim() && !attachedResume}
                            className="h-11 w-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200 transition-all disabled:opacity-50 disabled:shadow-none"
                        >
                            <Send className="w-5 h-5" />
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
};
export default AIResumeAgent;

