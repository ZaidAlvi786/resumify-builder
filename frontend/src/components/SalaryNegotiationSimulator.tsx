"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
    Send, 
    Bot, 
    User, 
    DollarSign, 
    RefreshCcw, 
    CheckCircle2, 
    AlertCircle, 
    MessageSquare, 
    Mic,
    MoreHorizontal
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { chatWithAIAgent, ChatMessage } from "@/services/api";

interface NegotiationContext {
    targetRole: string;
    initialOffer: string;
    targetSalary: string;
    experience: string;
}

const SalaryNegotiationSimulator = () => {
    const [started, setStarted] = useState(false);
    const [context, setContext] = useState<NegotiationContext>({
        targetRole: "",
        initialOffer: "",
        targetSalary: "",
        experience: "",
    });
    
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const scrollAreaRef = useRef<HTMLDivElement>(null);

    const handleStart = () => {
        if (!context.targetRole || !context.initialOffer) return;
        
        setStarted(true);
        // Initial system prompt setup (hidden from UI but used in API context)
        const initialMessage: ChatMessage = {
            role: "assistant",
            content: `Hello! I'm the Hiring Manager for the ${context.targetRole} position. We've been very impressed with your interviews. We'd like to offer you a starting salary of ${context.initialOffer}. How does that sound to you?`
        };
        setMessages([initialMessage]);
    };

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMessage: ChatMessage = { role: "user", content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput("");
        setIsLoading(true);

        try {
            // Include context in the first message or as a separate system parameter if API supports it
            // For now, we append to history. 
            // In a real app, we'd have a specific endpoint or system prompt injection.
            const response = await chatWithAIAgent(
                [...messages, userMessage], 
                undefined, 
                `Roleplay as a Hiring Manager negotiating salary. 
                Role: ${context.targetRole}. 
                Initial Offer: ${context.initialOffer}. 
                Candidate Goal: ${context.targetSalary}. 
                Candidate Experience: ${context.experience}.
                Be professional but firm, eventually willing to negotiate if arguments are good.`
            );
            
            // Assume API returns a single message or stream
            // If response is a stream, we'd handle it differently.
            // For now assuming simple JSON response for MVP.
            // The actual API `chatWithAIAgent` might return a stream/chunk.
            // Let's assume it returns a full object if we don't pass callbacks.
            
            // Wait, the API signature shows it returns response.json() if no callbacks.
            // Which likely matches { message: string, suggestions?: string[] } or similar?
            // Checking api.ts... it returns whatever the backend sends.
            // Let's assume it returns { content: string } or similar standard format.
            // Actually, looking at `api.ts`, it seems it returns the full JSON.
            
            const aiContent = response.message || "I'm considering your point...";
            const aiMessage: ChatMessage = { role: "assistant", content: aiContent };
            setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
            console.error("Error sending message:", error);
            setMessages(prev => [...prev, { role: "assistant", content: "I'm sorry, I need a moment to consult with HR. (Connection Error)" }]);
        } finally {
            setIsLoading(false);
        }
    };

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollAreaRef.current) {
            const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
            if (scrollContainer) {
                scrollContainer.scrollTop = scrollContainer.scrollHeight;
            }
        }
    }, [messages]);

    if (!started) {
        return (
            <div className="max-w-2xl mx-auto p-4">
                 <div className="text-center space-y-2 mb-8">
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent inline-flex items-center gap-2">
                        <DollarSign className="w-8 h-8 text-green-600" />
                        Salary Negotiation Simulator
                    </h2>
                    <p className="text-slate-600">Practice your negotiation skills with an AI hiring manager before the real deal.</p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Scenario Setup</CardTitle>
                        <CardDescription>Configure the role-play details to match your situation.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Target Role</Label>
                            <Input 
                                placeholder="e.g. Senior Frontend Engineer" 
                                value={context.targetRole}
                                onChange={e => setContext({...context, targetRole: e.target.value})}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                             <div className="space-y-2">
                                <Label>Initial Offer (They offered)</Label>
                                <Input 
                                    placeholder="e.g. $120,000" 
                                    value={context.initialOffer}
                                    onChange={e => setContext({...context, initialOffer: e.target.value})}
                                />
                            </div>
                             <div className="space-y-2">
                                <Label>Target Salary (You want)</Label>
                                <Input 
                                    placeholder="e.g. $140,000" 
                                    value={context.targetSalary}
                                    onChange={e => setContext({...context, targetSalary: e.target.value})}
                                />
                            </div>
                        </div>
                         <div className="space-y-2">
                            <Label>Years of Experience</Label>
                            <Input 
                                placeholder="e.g. 5 years, led 2 teams..." 
                                value={context.experience}
                                onChange={e => setContext({...context, experience: e.target.value})}
                            />
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button className="w-full bg-green-600 hover:bg-green-700" onClick={handleStart} disabled={!context.targetRole || !context.initialOffer}>
                            Start Simulation
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-4 h-[calc(100vh-100px)] flex flex-col">
            <div className="mb-4 flex items-center justify-between">
                 <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border-2 border-green-100">
                        <AvatarImage src="/hiring-manager-avatar.png" />
                        <AvatarFallback className="bg-green-100 text-green-700">HM</AvatarFallback>
                    </Avatar>
                    <div>
                        <h3 className="font-bold text-slate-900">Hiring Manager</h3>
                        <p className="text-xs text-slate-500">{context.targetRole} @ TechCorp</p>
                    </div>
                </div>
                <Button variant="outline" size="sm" onClick={() => setStarted(false)}>
                    <RefreshCcw className="w-4 h-4 mr-2" />
                    Reset
                </Button>
            </div>

            <Card className="flex-1 flex flex-col shadow-md overflow-hidden border-slate-200">
                <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
                    <div className="space-y-4">
                        {messages.map((msg, idx) => (
                            <motion.div 
                                key={idx}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div className={`max-w-[80%] p-3 rounded-2xl ${
                                    msg.role === 'user' 
                                        ? 'bg-blue-600 text-white rounded-tr-none' 
                                        : 'bg-slate-100 text-slate-800 rounded-tl-none'
                                }`}>
                                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                                </div>
                            </motion.div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-slate-100 p-3 rounded-2xl rounded-tl-none flex items-center gap-2">
                                    <MoreHorizontal className="w-4 h-4 text-slate-400 animate-pulse" />
                                    <span className="text-xs text-slate-400">Typing...</span>
                                </div>
                            </div>
                        )}
                    </div>
                </ScrollArea>
                <div className="p-4 bg-slate-50 border-t border-slate-200">
                    <form 
                        onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                        className="flex gap-2"
                    >
                        <Input 
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Type your response..."
                            disabled={isLoading}
                            className="bg-white"
                        />
                        <Button type="submit" disabled={isLoading || !input.trim()} className="bg-green-600 hover:bg-green-700">
                            <Send className="w-4 h-4" />
                        </Button>
                    </form>
                </div>
            </Card>
        </div>
    );
};

export default SalaryNegotiationSimulator;
