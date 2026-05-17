"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Columns, Layout, Palette, Sparkles, Filter, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ResumeThemes, ResumeTemplate } from "./templates/ResumeTemplates";

interface TemplateGalleryProps {
    currentTemplate: string;
    currentTheme: string;
    onSelect: (template: string, theme: string) => void;
    recommendedTemplate?: string;
}

const LAYOUTS = [
    { id: "modern", name: "Modern Edge", icon: <Layout className="w-4 h-4" />, description: "Clean, professional, and balanced." },
    { id: "executive", name: "The Executive", icon: <Columns className="w-4 h-4" />, description: "Strong sidebar with a high-end feel." },
    { id: "bold", name: "Bold Impact", icon: <Layout className="w-4 h-4" />, description: "Heavy typography for a lasting impression." },
    { id: "technical", name: "Technical Pro", icon: <Layout className="w-4 h-4" />, description: "Optimized for engineers and developers." },
];

const TemplateGallery: React.FC<TemplateGalleryProps> = ({ 
    currentTemplate, 
    currentTheme, 
    onSelect,
    recommendedTemplate 
}) => {
    const [searchQuery, setSearchQuery] = useState("");
    const themes = Object.values(ResumeThemes);

    const filteredThemes = themes.filter(t => 
        t.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex flex-col h-full bg-slate-50 border-l animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="p-6 border-b bg-white/80 backdrop-blur-md sticky top-0 z-10">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
                             Gallery <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full uppercase tracking-tighter">100+ Pro</span>
                        </h2>
                        <p className="text-xs text-slate-500 font-medium mt-1">Select your layout and visual style</p>
                    </div>
                    <div className="bg-blue-600 text-white p-2 rounded-xl shadow-lg shadow-blue-200 animate-pulse">
                        <Sparkles className="w-5 h-5" />
                    </div>
                </div>

                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="Find a style..." 
                            className="w-full bg-slate-100 border-none rounded-xl pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <Button variant="outline" size="icon" className="rounded-xl border-slate-200">
                        <Filter className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-10 scrollbar-hide">
                {/* Layouts Section */}
                <section>
                    <div className="flex items-center gap-2 mb-4 px-1">
                        <Layout className="w-4 h-4 text-slate-400" />
                        <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Core Layouts</h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {LAYOUTS.map((layout) => (
                            <button
                                key={layout.id}
                                onClick={() => onSelect(layout.id, currentTheme)}
                                className={`group relative flex flex-col p-4 rounded-2xl border-2 transition-all ${
                                    currentTemplate === layout.id 
                                        ? "bg-white border-blue-600 shadow-xl shadow-blue-100" 
                                        : "bg-white border-transparent hover:border-slate-200 hover:shadow-lg"
                                }`}
                            >
                                {recommendedTemplate === layout.id && (
                                    <div className="absolute -top-2 -right-2 bg-yellow-400 text-[9px] font-black uppercase px-2 py-1 rounded-lg shadow-md z-10 flex items-center gap-1">
                                        <Sparkles className="w-2 h-2" /> Best Match
                                    </div>
                                )}
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-colors ${
                                    currentTemplate === layout.id ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-400 group-hover:bg-slate-200"
                                }`}>
                                    {layout.icon}
                                </div>
                                <div className="text-sm font-bold text-slate-800 mb-1">{layout.name}</div>
                                <div className="text-[10px] text-slate-400 leading-tight font-medium">{layout.description}</div>
                                
                                {currentTemplate === layout.id && (
                                    <div className="absolute top-4 right-4 text-blue-600">
                                        <div className="bg-blue-50 p-1 rounded-full">
                                            <Check className="w-3 h-3" />
                                        </div>
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                </section>

                {/* Themes Section */}
                <section>
                    <div className="flex items-center gap-2 mb-4 px-1">
                        <Palette className="w-4 h-4 text-slate-400" />
                        <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Visual Themes</h3>
                    </div>
                    <div className="space-y-3">
                        {filteredThemes.map((theme) => (
                            <button
                                key={theme.name}
                                onClick={() => onSelect(currentTemplate, theme.name)}
                                className={`w-full group relative flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${
                                    currentTheme === theme.name 
                                        ? "bg-white border-blue-600 shadow-xl shadow-blue-100" 
                                        : "bg-white border-transparent hover:border-slate-200 hover:shadow-lg"
                                }`}
                            >
                                <div className="flex flex-col gap-1 w-12">
                                    <div className="h-4 w-full rounded-md shadow-sm" style={{ backgroundColor: theme.primaryColor }}></div>
                                    <div className="flex gap-1">
                                        <div className="h-2 w-1/2 rounded-sm opacity-60" style={{ backgroundColor: theme.secondaryColor }}></div>
                                        <div className="h-2 w-1/2 rounded-sm opacity-30" style={{ backgroundColor: theme.accentColor }}></div>
                                    </div>
                                </div>
                                
                                <div className="flex-1 text-left">
                                    <div className="text-sm font-bold text-slate-800">{theme.name}</div>
                                    <div className="text-[10px] text-slate-400 font-medium uppercase tracking-tighter">
                                        {theme.headingFont.split(",")[0].replace(/'/g, "")} • High Contrast
                                    </div>
                                </div>

                                {currentTheme === theme.name && (
                                    <div className="text-blue-600">
                                        <div className="bg-blue-50 p-1.5 rounded-full">
                                            <Check className="w-4 h-4" />
                                        </div>
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                </section>
            </div>

            <div className="p-6 bg-white border-t">
                <Button className="w-full bg-slate-900 hover:bg-black text-white rounded-xl h-12 font-bold shadow-xl shadow-slate-200">
                    Apply Combination
                </Button>
            </div>
        </div>
    );
};

export default TemplateGallery;
