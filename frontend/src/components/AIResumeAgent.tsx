"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
    Send,
    Sparkles,
    Bot,
    User,
    Loader2,
    Trash2,
    Plus,
    History,
    X,
    MessageSquare,
    TrendingUp,
    FileText,
    Upload,
    ChevronRight,
    Search
} from "lucide-react";
import { chatWithAIAgent, ChatMessage, ResumeData } from "@/services/api";

interface Message {
    id: string;
    role: "user" | "assistant";
    content: string;
    timestamp: Date;
    attachments?: string[];
    suggestions?: string[];
}

interface ChatSession {
    id: string;
    title: string;
    messages: Message[];
    lastUpdated: Date;
}

interface AIResumeAgentProps {
    onQuickAction?: (action: "improve_score" | "target_resume" | "find_jobs") => void;
    resumeData?: any;
    className?: string;
}

const AIResumeAgent: React.FC<AIResumeAgentProps> = ({ onQuickAction, resumeData, className }) => {
    const [sessions, setSessions] = useState<ChatSession[]>([]);
    const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [attachedResume, setAttachedResume] = useState<File | null>(null);
    const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
    const [abortController, setAbortController] = useState<AbortController | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const createNewSession = useCallback(() => {
        const newSession: ChatSession = {
            id: Date.now().toString(),
            title: "New Chat",
            messages: [
                {
                    id: "1",
                    role: "assistant",
                    content: "Hello! I'm your AI Resume Agent. How can I help you with your resume and job search today?",
                    timestamp: new Date(),
                },
            ],
            lastUpdated: new Date()
        };
        setSessions(prev => [newSession, ...prev]);
        setActiveSessionId(newSession.id);
    }, []);

    // Load sessions from localStorage on mount
    useEffect(() => {
        const savedSessions = localStorage.getItem("ai_chat_sessions_v2");
        if (savedSessions) {
            try {
                const parsed = JSON.parse(savedSessions);
                const restoredSessions = parsed.map((s: any) => ({
                    ...s,
                    lastUpdated: new Date(s.lastUpdated),
                    messages: s.messages.map((m: any) => ({
                        ...m,
                        timestamp: new Date(m.timestamp)
                    }))
                }));
                setSessions(restoredSessions);
                if (restoredSessions.length > 0) {
                    setActiveSessionId(restoredSessions[0].id);
                }
            } catch (e) {
                console.error("Failed to parse sessions", e);
            }
        }
        
        // Handle migration from old format
        const oldHistory = localStorage.getItem("ai_chat_history");
        if (oldHistory && !savedSessions) {
            try {
                const messages = JSON.parse(oldHistory).map((m: any) => ({
                    ...m,
                    timestamp: new Date(m.timestamp)
                }));
                const initialSession: ChatSession = {
                    id: Date.now().toString(),
                    title: messages[0]?.content.substring(0, 30) || "Previous Chat",
                    messages,
                    lastUpdated: new Date()
                };
                setSessions([initialSession]);
                setActiveSessionId(initialSession.id);
                localStorage.removeItem("ai_chat_history");
            } catch (e) {
                console.error("Failed to migrate chat", e);
            }
        }

        if (!savedSessions && !oldHistory) {
            createNewSession();
        }
    }, [createNewSession]);

    // Save sessions to localStorage
    useEffect(() => {
        if (sessions.length > 0) {
            localStorage.setItem("ai_chat_sessions_v2", JSON.stringify(sessions));
        }
    }, [sessions]);

    const activeSession = sessions.find(s => s.id === activeSessionId);
    const messages = activeSession?.messages || [];

    const updateActiveSessionMessages = useCallback((updateFn: (prevMessages: Message[]) => Message[]) => {
        setSessions(prev => prev.map(s => {
            if (s.id === activeSessionId) {
                const newMessages = updateFn(s.messages);
                let newTitle = s.title;
                if (s.title === "New Chat" && newMessages.length > 1) {
                    newTitle = newMessages[1].content.split("\n")[0].substring(0, 40);
                    if (newMessages[1].content.length > 40) newTitle += "...";
                }
                return {
                    ...s,
                    messages: newMessages,
                    lastUpdated: new Date(),
                    title: newTitle
                };
            }
            return s;
        }));
    }, [activeSessionId]);

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
        updateActiveSessionMessages(() => newMessages);
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

            updateActiveSessionMessages((prev) => [...prev, initialAssistantMessage]);

            const apiMessages: ChatMessage[] = newMessages.map((m) => ({
                role: m.role,
                content: m.content,
            }));

            await chatWithAIAgent(
                apiMessages,
                resumeData,
                attachedResume ? `User attached resume file: ${attachedResume.name}` : undefined,
                (chunk) => {
                    updateActiveSessionMessages((prev) => {
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
                    updateActiveSessionMessages((prev) => {
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
                undefined,
                undefined,
                controller.signal
            );
        } catch (error: any) {
            if (error.name === 'AbortError') {
                console.log("Response generation canceled by user");
            } else {
                console.error("Error fetching AI response:", error);
                updateActiveSessionMessages((prev) => {
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

    const deleteSession = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (sessions.length === 1) {
            clearHistory();
            return;
        }
        setSessions(prev => prev.filter(s => s.id !== id));
        if (activeSessionId === id) {
            setActiveSessionId(sessions.find(s => s.id !== id)?.id || sessions[0].id);
        }
    };

    const clearHistory = () => {
        if (confirm("Are you sure you want to clear your chat history? This will delete all sessions.")) {
            localStorage.removeItem("ai_chat_sessions_v2");
            createNewSession();
            setSessions(prev => [prev[prev.length - 1]]);
        }
    };

    return (
        <div className={`flex h-full w-full overflow-hidden bg-[#f8fafc] border rounded-2xl shadow-xl ${className}`}>
            {/* History Sidebar */}
            <AnimatePresence>
                {isSidebarOpen && (
                    <motion.div
                        initial={{ width: 0, opacity: 0 }}
                        animate={{ width: 280, opacity: 1 }}
                        exit={{ width: 0, opacity: 0 }}
                        className="h-full border-r bg-slate-900 text-slate-300 flex flex-col z-20"
                    >
                        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                            <h3 className="font-bold text-sm text-white flex items-center gap-2">
                                <FileText className="w-4 h-4" /> History
                            </h3>
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-slate-400 hover:text-white"
                                onClick={() => setIsSidebarOpen(false)}
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        </div>
                        
                        <div className="p-3">
                            <Button 
                                onClick={createNewSession}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white gap-2 h-10 rounded-xl transition-all shadow-lg shadow-blue-900/20"
                            >
                                <Sparkles className="w-4 h-4" /> New Chat
                            </Button>
                        </div>

                        <div className="flex-1 overflow-y-auto px-2 py-2 space-y-1 scrollbar-hide">
                            {sessions.map((session) => (
                                <div
                                    key={session.id}
                                    onClick={() => setActiveSessionId(session.id)}
                                    className={`group relative flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                                        activeSessionId === session.id
                                            ? "bg-slate-800 text-white shadow-inner"
                                            : "hover:bg-slate-800/50 text-slate-400"
                                    }`}
                                >
                                    <FileText className="w-4 h-4 flex-shrink-0" />
                                    <div className="flex-1 truncate text-xs font-medium">
                                        {session.title || "Untitled Chat"}
                                    </div>
                                    <button 
                                        onClick={(e) => deleteSession(session.id, e)}
                                        className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 transition-all ml-1"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div className="p-4 border-t border-slate-800">
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                className="w-full text-slate-500 hover:text-red-400 justify-start gap-2 hover:bg-red-500/5"
                                onClick={clearHistory}
                            >
                                <X className="w-4 h-4" /> Clear History
                            </Button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col h-full relative overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b bg-white/80 backdrop-blur-md sticky top-0 z-10">
                    <div className="flex items-center gap-3">
                        {!isSidebarOpen && (
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-9 w-9 text-slate-500 hover:bg-slate-100"
                                onClick={() => setIsSidebarOpen(true)}
                            >
                                <TrendingUp className="w-5 h-5 -rotate-90" />
                            </Button>
                        )}
                        <div className="flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-blue-600" />
                            <h3 className="font-bold tracking-tight text-slate-800">AI Career Pro</h3>
                            <span className="text-[10px] bg-blue-100 text-blue-700 font-black px-1.5 py-0.5 rounded uppercase tracking-tighter">Ultra Legend</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="hidden lg:flex gap-1.5 mr-2">
                            <Button variant="outline" size="sm" className="h-8 text-xs font-semibold rounded-lg border-slate-200 hover:bg-blue-50 hover:text-blue-600 transition-all" onClick={() => handleQuickAction("improve_score")}>Score</Button>
                            <Button variant="outline" size="sm" className="h-8 text-xs font-semibold rounded-lg border-slate-200 hover:bg-blue-50 hover:text-blue-600 transition-all" onClick={() => handleQuickAction("target_resume")}>Target</Button>
                            <Button variant="outline" size="sm" className="h-8 text-xs font-semibold rounded-lg border-slate-200 hover:bg-blue-50 hover:text-blue-600 transition-all" onClick={() => handleQuickAction("find_jobs")}>Jobs</Button>
                            <div className="w-px h-4 bg-slate-200 mx-1" />
                            <Link href="/">
                                <Button variant="ghost" size="sm" className="h-8 text-xs font-semibold rounded-lg text-slate-500 hover:text-slate-900 transition-all">Home</Button>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 bg-[#f8fafc] scrollbar-hide">
                    <AnimatePresence initial={false}>
                        {messages.map((message) => (
                            <motion.div
                                key={message.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                            >
                                <div
                                    className={`group relative max-w-[85%] rounded-2xl p-4 transition-all shadow-sm ${
                                        message.role === "user"
                                            ? "bg-blue-600 text-white shadow-blue-200"
                                            : "bg-white text-slate-800 border border-slate-200"
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
                                        <div className="mt-2 flex items-center gap-2 text-xs font-medium bg-black/10 p-1.5 rounded-lg">
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
                                    <div className="mt-2 flex items-center justify-between opacity-50">
                                        <p className="text-[10px] font-medium">
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
                <div className="p-4 bg-white border-t">
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

                    <div className="flex gap-2 items-end max-w-4xl mx-auto">
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
                            className="flex-shrink-0 h-11 w-11 rounded-xl border-slate-200 hover:bg-slate-50 transition-colors"
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
                                placeholder="High-speed AI Career Assistant..."
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all overflow-y-auto resize-none min-h-[44px] max-h-[136px]"
                                rows={1}
                            />
                        </div>
                        {isLoading ? (
                            <Button
                                onClick={handleCancel}
                                variant="destructive"
                                className="h-11 w-11 rounded-xl shadow-lg transition-transform hover:scale-105"
                            >
                                <X className="w-5 h-5" />
                            </Button>
                        ) : (
                            <Button
                                onClick={() => handleSend(input, editingMessageId || undefined)}
                                disabled={!input.trim() && !attachedResume}
                                className="h-11 w-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200 transition-all disabled:opacity-50 disabled:shadow-none hover:scale-105 active:scale-95"
                            >
                                <Send className="w-5 h-5" />
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AIResumeAgent;
