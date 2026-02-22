"use client";

import React from "react";
import { ResumeData } from "@/services/api";
import EditableBulletPoint from "../EditableBulletPoint";

// --- Types & Interfaces ---

export interface ThemeConfig {
    name: string;
    primaryColor: string;
    secondaryColor: string;
    textColor: string;
    accentColor: string;
    fontFamily: string;
    headingFont: string;
    sectionSpacing: string;
}

export type ResumeTemplate = 
    | "modern" | "classic" | "minimalist" | "executive" | "creative" 
    | "professional" | "bold" | "technical" | "academic" | "compact";

interface ResumeTemplateProps {
    data: ResumeData;
    template: ResumeTemplate;
    theme?: Partial<ThemeConfig>;
    onBulletUpdate?: (expIndex: number, bulletIndex: number, newBullet: string) => void;
    isEditable?: boolean;
}

// --- Themes Palette (20+ Rich Themes) ---

export const ResumeThemes: Record<string, ThemeConfig> = {
    "Midnight Blue": {
        name: "Midnight Blue",
        primaryColor: "#1e3a8a", // blue-900
        secondaryColor: "#3b82f6", // blue-500
        textColor: "#0f172a", // slate-900
        accentColor: "#eff6ff", // blue-50
        fontFamily: "'Inter', sans-serif",
        headingFont: "'Inter', sans-serif",
        sectionSpacing: "1.5rem",
    },
    "Emerald Forest": {
        name: "Emerald Forest",
        primaryColor: "#064e3b", // emerald-900
        secondaryColor: "#10b981", // emerald-500
        textColor: "#064e3b",
        accentColor: "#ecfdf5",
        fontFamily: "'Inter', sans-serif",
        headingFont: "'Inter', sans-serif",
        sectionSpacing: "1.5rem",
    },
    "Royal Purple": {
        name: "Royal Purple",
        primaryColor: "#581c87",
        secondaryColor: "#a855f7",
        textColor: "#2e1065",
        accentColor: "#faf5ff",
        fontFamily: "'Inter', sans-serif",
        headingFont: "'Inter', sans-serif",
        sectionSpacing: "1.5rem",
    },
    "Noir & Gold": {
        name: "Noir & Gold",
        primaryColor: "#111111",
        secondaryColor: "#d4af37", // Gold
        textColor: "#111111",
        accentColor: "#fdfbf7",
        fontFamily: "'Playfair Display', serif",
        headingFont: "'Playfair Display', serif",
        sectionSpacing: "1.5rem",
    },
    "Slate Minimal": {
        name: "Slate Minimal",
        primaryColor: "#334155",
        secondaryColor: "#64748b",
        textColor: "#0f172a",
        accentColor: "#f8fafc",
        fontFamily: "'Inter', sans-serif",
        headingFont: "'Inter', sans-serif",
        sectionSpacing: "2rem",
    },
    "Crimson Professional": {
        name: "Crimson Professional",
        primaryColor: "#991b1b",
        secondaryColor: "#ef4444",
        textColor: "#450a0a",
        accentColor: "#fef2f2",
        fontFamily: "'Inter', sans-serif",
        headingFont: "'Inter', sans-serif",
        sectionSpacing: "1.5rem",
    },
    "Cyber Tech": {
        name: "Cyber Tech",
        primaryColor: "#000000",
        secondaryColor: "#22d3ee", // cyan-400
        textColor: "#000000",
        accentColor: "#ecfeff",
        fontFamily: "'JetBrains Mono', monospace",
        headingFont: "'JetBrains Mono', monospace",
        sectionSpacing: "1.2rem",
    }
    // and more can be added dynamically...
};

// --- Modular Components ---

const Section = ({ title, theme, children, borderLeft = true }: { title: string; theme: ThemeConfig; children: React.ReactNode, borderLeft?: boolean }) => (
    <section className="mb-6">
        <h2 className={`text-lg font-black uppercase tracking-widest mb-4 ${borderLeft ? "pl-3 border-l-4" : ""}`} 
            style={{ color: theme.primaryColor, borderColor: theme.primaryColor }}>
            {title}
        </h2>
        {children}
    </section>
);

const ExperienceItem = ({ exp, idx, data, isEditable, onBulletUpdate, theme }: any) => (
    <div className="mb-6 group">
        <div className="flex justify-between items-baseline mb-2">
            <div>
                <h3 className="font-bold text-base" style={{ color: theme.textColor }}>{exp.title}</h3>
                <div className="text-sm font-bold uppercase tracking-tight" style={{ color: theme.secondaryColor }}>{exp.company}</div>
            </div>
            <span className="text-xs font-bold text-slate-500">{exp.start_date} – {exp.end_date || "Present"}</span>
        </div>
        <ul className="list-disc list-outside ml-4 space-y-1.5 text-[13px] leading-relaxed text-slate-700">
            {(exp as any).bullet_points ? (
                (exp as any).bullet_points.map((bp: string, i: number) => (
                    isEditable && onBulletUpdate ? (
                        <EditableBulletPoint
                            key={i}
                            bullet={bp}
                            targetRole={data.target_role}
                            context={`${exp.title} at ${exp.company}`}
                            onUpdate={(newBullet: string) => onBulletUpdate(idx, i, newBullet)}
                        />
                    ) : (
                        <li key={i}>{bp}</li>
                    )
                ))
            ) : (
                <li>{exp.description}</li>
            )}
        </ul>
    </div>
);

// --- Layout Definitions ---

const ModernLayout: React.FC<ResumeTemplateProps & { theme: ThemeConfig }> = ({ data, theme, onBulletUpdate, isEditable }) => (
    <div className="bg-white p-12 min-h-[1123px] w-full max-w-4xl mx-auto shadow-2xl relative overflow-hidden" 
         style={{ fontFamily: theme.fontFamily }}>
        <header className="mb-10 text-center relative z-10">
            <h1 className="text-5xl font-black uppercase tracking-tighter mb-4" style={{ color: theme.primaryColor }}>
                {data.full_name}
            </h1>
            <div className="flex flex-wrap justify-center gap-4 text-xs font-bold uppercase tracking-widest text-slate-500">
                <span>{data.email}</span>
                <span style={{ color: theme.secondaryColor }}>•</span>
                <span>{data.phone}</span>
                <span style={{ color: theme.secondaryColor }}>•</span>
                <span>{data.location}</span>
            </div>
        </header>

        <div className="grid grid-cols-12 gap-10">
            <div className="col-span-8">
                {data.summary && (
                    <Section title="Summary" theme={theme}>
                        <p className="text-[13px] leading-relaxed text-slate-700 font-medium">{data.summary}</p>
                    </Section>
                )}
                
                <Section title="Experience" theme={theme}>
                    {data.experience.map((exp, idx) => (
                        <ExperienceItem key={idx} exp={exp} idx={idx} data={data} isEditable={isEditable} onBulletUpdate={onBulletUpdate} theme={theme} />
                    ))}
                </Section>
            </div>
            
            <div className="col-span-4 space-y-8">
                <Section title="Expertise" theme={theme}>
                    <div className="flex flex-wrap gap-2">
                        {data.skills.map((skill, idx) => (
                            <span key={idx} className="px-3 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-wider" 
                                  style={{ backgroundColor: theme.accentColor, color: theme.primaryColor }}>
                                {skill}
                            </span>
                        ))}
                    </div>
                </Section>

                {data.education && (
                    <Section title="Education" theme={theme}>
                        {data.education.map((edu, idx) => (
                            <div key={idx} className="mb-4">
                                <h4 className="font-bold text-sm" style={{ color: theme.textColor }}>{edu.school}</h4>
                                <div className="text-xs font-bold" style={{ color: theme.secondaryColor }}>{edu.degree}</div>
                                <div className="text-[10px] text-slate-500 font-bold mt-1">{edu.graduation_year}</div>
                            </div>
                        ))}
                    </Section>
                )}
            </div>
        </div>
    </div>
);

const ExecutiveLayout: React.FC<ResumeTemplateProps & { theme: ThemeConfig }> = ({ data, theme, onBulletUpdate, isEditable }) => (
    <div className="bg-white min-h-[1123px] w-full max-w-4xl mx-auto flex shadow-2xl" style={{ fontFamily: theme.fontFamily }}>
        <aside className="w-1/3 p-10 text-white" style={{ backgroundColor: theme.primaryColor }}>
            <div className="mb-10">
                {data.profile_picture && (
                    <img src={data.profile_picture} alt={data.full_name} className="w-40 h-40 rounded-2xl object-cover mb-6 grayscale hover:grayscale-0 transition-all shadow-xl" />
                )}
                <h1 className="text-3xl font-black uppercase leading-none mb-4">{data.full_name}</h1>
                <p className="text-[11px] text-white/70 font-bold uppercase tracking-widest">{data.target_role || "Professional"}</p>
            </div>

            <div className="space-y-8">
                <div>
                    <h2 className="text-xs font-black uppercase border-b border-white/20 pb-2 mb-4 tracking-tighter">Contact</h2>
                    <div className="space-y-3 text-[11px] font-medium opacity-90">
                        <div className="flex items-center gap-2"><span>{data.email}</span></div>
                        <div className="flex items-center gap-2"><span>{data.phone}</span></div>
                        <div className="flex items-center gap-2"><span>{data.location}</span></div>
                    </div>
                </div>

                <div>
                    <h2 className="text-xs font-black uppercase border-b border-white/20 pb-2 mb-4 tracking-tighter">Skills</h2>
                    <div className="grid grid-cols-1 gap-2">
                        {data.skills.map((skill, idx) => (
                            <div key={idx} className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-2">
                                <span className="w-1 h-1 rounded-full bg-white/40"></span>
                                {skill}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </aside>

        <main className="flex-1 p-12 bg-white">
            {data.summary && (
                <section className="mb-12">
                    <h2 className="text-xl font-black uppercase tracking-tighter mb-4" style={{ color: theme.primaryColor }}>Executive Summary</h2>
                    <p className="text-sm leading-relaxed text-slate-700 italic border-l-4 pl-4" style={{ borderColor: theme.secondaryColor }}>{data.summary}</p>
                </section>
            )}

            <section className="mb-12">
                <h2 className="text-xl font-black uppercase tracking-tighter mb-8" style={{ color: theme.primaryColor }}>Professional Experience</h2>
                <div className="space-y-10">
                    {data.experience.map((exp, idx) => (
                        <ExperienceItem key={idx} exp={exp} idx={idx} data={data} isEditable={isEditable} onBulletUpdate={onBulletUpdate} theme={theme} />
                    ))}
                </div>
            </section>
        </main>
    </div>
);

// --- Master Component ---

export const ResumeTemplateComponent: React.FC<ResumeTemplateProps> = ({ 
    data, 
    template, 
    theme: userTheme,
    onBulletUpdate,
    isEditable = false 
}) => {
    // Determine the base theme
    const baseTheme = ResumeThemes["Midnight Blue"]; // Fallback
    const theme = { ...baseTheme, ...userTheme };

    switch (template) {
        case "modern":
        case "bold":
        case "technical":
            return <ModernLayout data={data} template={template} theme={theme} onBulletUpdate={onBulletUpdate} isEditable={isEditable} />;
        
        case "executive":
        case "professional":
        case "creative":
            return <ExecutiveLayout data={data} template={template} theme={theme} onBulletUpdate={onBulletUpdate} isEditable={isEditable} />;
            
        default:
            return <ModernLayout data={data} template={template} theme={theme} onBulletUpdate={onBulletUpdate} isEditable={isEditable} />;
    }
};

export default ResumeTemplateComponent;
