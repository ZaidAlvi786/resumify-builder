"use client";

import React, { useState } from "react";
import { ResumeData } from "@/services/api";
import EditableBulletPoint from "../EditableBulletPoint";

export type ResumeTemplate = "modern" | "classic" | "minimalist" | "executive" | "creative";

interface ResumeTemplateProps {
    data: ResumeData;
    template: ResumeTemplate;
    onBulletUpdate?: (expIndex: number, bulletIndex: number, newBullet: string) => void;
    isEditable?: boolean;
}

export const ResumeTemplateComponent: React.FC<ResumeTemplateProps> = ({ 
    data, 
    template, 
    onBulletUpdate,
    isEditable = false 
}) => {
    switch (template) {
        case "modern":
            return <ModernTemplate data={data} onBulletUpdate={onBulletUpdate} isEditable={isEditable} />;
        case "classic":
            return <ClassicTemplate data={data} onBulletUpdate={onBulletUpdate} isEditable={isEditable} />;
        case "minimalist":
            return <MinimalistTemplate data={data} onBulletUpdate={onBulletUpdate} isEditable={isEditable} />;
        case "executive":
            return <ExecutiveTemplate data={data} onBulletUpdate={onBulletUpdate} isEditable={isEditable} />;
        case "creative":
            return <CreativeTemplate data={data} onBulletUpdate={onBulletUpdate} isEditable={isEditable} />;
        default:
            return <ModernTemplate data={data} onBulletUpdate={onBulletUpdate} isEditable={isEditable} />;
    }
};

// Modern Template - Clean with colored accent
const ModernTemplate: React.FC<{ 
    data: ResumeData; 
    onBulletUpdate?: (expIndex: number, bulletIndex: number, newBullet: string) => void;
    isEditable?: boolean;
}> = ({ data, onBulletUpdate, isEditable = false }) => {
    return (
        <div className="bg-white text-slate-900 p-12 min-h-[1123px] w-full max-w-[794px] mx-auto">
            {/* Header with colored bar */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 -mx-12 -mt-12 mb-8 px-12 pt-8 pb-6 text-white">
                <div className="flex items-center gap-6 mb-3">
                    {data.profile_picture && (
                        <img
                            src={data.profile_picture}
                            alt={data.full_name}
                            className="w-24 h-24 rounded-full object-cover border-4 border-white/30"
                        />
                    )}
                    <div className="flex-1">
                        <h1 className="text-4xl font-bold">{data.full_name}</h1>
                    </div>
                </div>
                <div className="flex flex-wrap gap-4 text-sm font-light">
                    <span>{data.email}</span>
                    <span>•</span>
                    <span>{data.phone}</span>
                    <span>•</span>
                    <span>{data.location}</span>
                    {data.linkedin && <><span>•</span><a href={data.linkedin} target="_blank" rel="noreferrer" className="underline">{data.linkedin}</a></>}
                    {data.website && <><span>•</span><a href={data.website} target="_blank" rel="noreferrer" className="underline">{data.website}</a></>}
                </div>
            </div>

            {(data as any).summary && (
                <section className="mb-6">
                    <h2 className="text-xl font-bold text-slate-900 mb-3 border-l-4 border-blue-600 pl-3">Professional Summary</h2>
                    <p className="text-sm leading-relaxed text-slate-700">{(data as any).summary}</p>
                </section>
            )}

            <section className="mb-6">
                <h2 className="text-xl font-bold text-slate-900 mb-3 border-l-4 border-blue-600 pl-3">Skills</h2>
                <div className="flex flex-wrap gap-2">
                    {data.skills.map((skill, idx) => (
                        <span key={idx} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                            {skill}
                        </span>
                    ))}
                </div>
            </section>

            <section className="mb-6">
                <h2 className="text-xl font-bold text-slate-900 mb-4 border-l-4 border-blue-600 pl-3">Experience</h2>
                <div className="space-y-5">
                    {data.experience.map((exp, idx) => (
                        <div key={idx} className="border-l-2 border-slate-200 pl-4">
                            <div className="flex justify-between items-start mb-1">
                                <div>
                                    <h3 className="font-bold text-lg text-slate-900">{exp.title}</h3>
                                    <div className="text-sm font-semibold text-blue-600">{exp.company}</div>
                                </div>
                                <span className="text-sm text-slate-600 whitespace-nowrap">{exp.start_date} – {exp.end_date || "Present"}</span>
                            </div>
                            <ul className="list-disc list-outside ml-4 space-y-1 text-sm text-slate-700 mt-2">
                                {(exp as any).bullet_points ? (
                                    (exp as any).bullet_points.map((bp: string, i: number) => (
                                        isEditable && onBulletUpdate ? (
                                            <EditableBulletPoint
                                                key={i}
                                                bullet={bp}
                                                targetRole={data.target_role}
                                                context={`${exp.title} at ${exp.company}`}
                                                onUpdate={(newBullet) => onBulletUpdate(idx, i, newBullet)}
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
                    ))}
                </div>
            </section>

            {data.education && data.education.length > 0 && (
                <section className="mb-6">
                    <h2 className="text-xl font-bold text-slate-900 mb-4 border-l-4 border-blue-600 pl-3">Education</h2>
                    <div className="space-y-3">
                        {data.education.map((edu, idx) => (
                            <div key={idx} className="flex justify-between items-baseline">
                                <div>
                                    <h3 className="font-bold text-md text-slate-900">{edu.school}</h3>
                                    <div className="text-sm text-slate-700">{edu.degree}</div>
                                </div>
                                <span className="text-sm font-medium text-slate-600">{edu.graduation_year}</span>
                            </div>
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
};

// Classic Template - Traditional with border
const ClassicTemplate: React.FC<{ 
    data: ResumeData; 
    onBulletUpdate?: (expIndex: number, bulletIndex: number, newBullet: string) => void;
    isEditable?: boolean;
}> = ({ data, onBulletUpdate, isEditable = false }) => {
    return (
        <div className="bg-white text-slate-900 p-12 min-h-[1123px] w-full max-w-[794px] mx-auto border-2 border-slate-900">
            <header className="border-b-4 border-slate-900 pb-6 mb-6 text-center">
                <h1 className="text-5xl font-bold uppercase tracking-wide mb-3">{data.full_name}</h1>
                <div className="flex flex-wrap justify-center gap-4 text-sm text-slate-600 font-medium">
                    <span>{data.email}</span>
                    <span>|</span>
                    <span>{data.phone}</span>
                    <span>|</span>
                    <span>{data.location}</span>
                    {data.linkedin && <><span>|</span><a href={data.linkedin} target="_blank" rel="noreferrer" className="underline">{data.linkedin}</a></>}
                    {data.website && <><span>|</span><a href={data.website} target="_blank" rel="noreferrer" className="underline">{data.website}</a></>}
                </div>
            </header>

            {(data as any).summary && (
                <section className="mb-6">
                    <h2 className="text-2xl font-bold uppercase tracking-wider mb-3 border-b-2 border-slate-900 pb-1">Professional Summary</h2>
                    <p className="text-sm leading-relaxed text-slate-700">{(data as any).summary}</p>
                </section>
            )}

            <section className="mb-6">
                <h2 className="text-2xl font-bold uppercase tracking-wider mb-3 border-b-2 border-slate-900 pb-1">Skills</h2>
                <p className="text-sm text-slate-700">{data.skills.join(" • ")}</p>
            </section>

            <section className="mb-6">
                <h2 className="text-2xl font-bold uppercase tracking-wider mb-4 border-b-2 border-slate-900 pb-1">Experience</h2>
                <div className="space-y-5">
                    {data.experience.map((exp, idx) => (
                        <div key={idx}>
                            <div className="flex justify-between items-baseline mb-1">
                                <h3 className="font-bold text-lg">{exp.title}</h3>
                                <span className="text-sm font-medium text-slate-600">{exp.start_date} – {exp.end_date || "Present"}</span>
                            </div>
                            <div className="text-sm font-semibold text-slate-700 mb-2 italic">{exp.company}</div>
                            <ul className="list-none space-y-1 text-sm text-slate-700">
                                {(exp as any).bullet_points ? (
                                    (exp as any).bullet_points.map((bp: string, i: number) => (
                                        isEditable && onBulletUpdate ? (
                                            <EditableBulletPoint
                                                key={i}
                                                bullet={bp}
                                                targetRole={data.target_role}
                                                context={`${exp.title} at ${exp.company}`}
                                                onUpdate={(newBullet) => onBulletUpdate(idx, i, newBullet)}
                                            />
                                        ) : (
                                            <li key={i} className="flex items-start">
                                                <span className="mr-2">•</span>
                                                <span>{bp}</span>
                                            </li>
                                        )
                                    ))
                                ) : (
                                    <li className="flex items-start">
                                        <span className="mr-2">•</span>
                                        <span>{exp.description}</span>
                                    </li>
                                )}
                            </ul>
                        </div>
                    ))}
                </div>
            </section>

            {data.education && data.education.length > 0 && (
                <section className="mb-6">
                    <h2 className="text-2xl font-bold uppercase tracking-wider mb-4 border-b-2 border-slate-900 pb-1">Education</h2>
                    <div className="space-y-3">
                        {data.education.map((edu, idx) => (
                            <div key={idx} className="flex justify-between items-baseline">
                                <div>
                                    <h3 className="font-bold text-md">{edu.school}</h3>
                                    <div className="text-sm text-slate-700">{edu.degree}</div>
                                </div>
                                <span className="text-sm font-medium text-slate-600">{edu.graduation_year}</span>
                            </div>
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
};

// Minimalist Template - Clean and simple
const MinimalistTemplate: React.FC<{ 
    data: ResumeData; 
    onBulletUpdate?: (expIndex: number, bulletIndex: number, newBullet: string) => void;
    isEditable?: boolean;
}> = ({ data, onBulletUpdate, isEditable = false }) => {
    return (
        <div className="bg-white text-slate-900 p-12 min-h-[1123px] w-full max-w-[794px] mx-auto">
            <header className="mb-8 flex items-center gap-4">
                {data.profile_picture && (
                    <img
                        src={data.profile_picture}
                        alt={data.full_name}
                        className="w-20 h-20 rounded-full object-cover border-2 border-slate-300"
                    />
                )}
                <div>
                    <h1 className="text-4xl font-light mb-2">{data.full_name}</h1>
                    <div className="flex flex-wrap gap-3 text-xs text-slate-500">
                        <span>{data.email}</span>
                        <span>{data.phone}</span>
                        <span>{data.location}</span>
                        {data.linkedin && <a href={data.linkedin} target="_blank" rel="noreferrer" className="underline">{data.linkedin}</a>}
                        {data.website && <a href={data.website} target="_blank" rel="noreferrer" className="underline">{data.website}</a>}
                    </div>
                </div>
            </header>

            {(data as any).summary && (
                <section className="mb-8">
                    <p className="text-sm leading-relaxed text-slate-600">{(data as any).summary}</p>
                </section>
            )}

            <section className="mb-8">
                <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3">Skills</h2>
                <p className="text-sm text-slate-700 leading-relaxed">{data.skills.join(", ")}</p>
            </section>

            <section className="mb-8">
                <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-4">Experience</h2>
                <div className="space-y-6">
                    {data.experience.map((exp, idx) => (
                        <div key={idx}>
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <h3 className="font-medium text-base">{exp.title}</h3>
                                    <div className="text-sm text-slate-500">{exp.company}</div>
                                </div>
                                <span className="text-xs text-slate-400">{exp.start_date} – {exp.end_date || "Present"}</span>
                            </div>
                            <ul className="list-none space-y-1 text-sm text-slate-600 mt-2">
                                {(exp as any).bullet_points ? (
                                    (exp as any).bullet_points.map((bp: string, i: number) => (
                                        isEditable && onBulletUpdate ? (
                                            <EditableBulletPoint
                                                key={i}
                                                bullet={bp}
                                                targetRole={data.target_role}
                                                context={`${exp.title} at ${exp.company}`}
                                                onUpdate={(newBullet) => onBulletUpdate(idx, i, newBullet)}
                                            />
                                        ) : (
                                            <li key={i} className="flex items-start">
                                                <span className="mr-2">•</span>
                                                <span>{bp}</span>
                                            </li>
                                        )
                                    ))
                                ) : (
                                    <li className="flex items-start">
                                        <span className="mr-2">•</span>
                                        <span>{exp.description}</span>
                                    </li>
                                )}
                            </ul>
                        </div>
                    ))}
                </div>
            </section>

            {data.education && data.education.length > 0 && (
                <section className="mb-8">
                    <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-4">Education</h2>
                    <div className="space-y-3">
                        {data.education.map((edu, idx) => (
                            <div key={idx} className="flex justify-between items-start">
                                <div>
                                    <div className="text-sm font-medium">{edu.school}</div>
                                    <div className="text-xs text-slate-500">{edu.degree}</div>
                                </div>
                                <span className="text-xs text-slate-400">{edu.graduation_year}</span>
                            </div>
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
};

// Executive Template - Professional with side bar
const ExecutiveTemplate: React.FC<{ 
    data: ResumeData; 
    onBulletUpdate?: (expIndex: number, bulletIndex: number, newBullet: string) => void;
    isEditable?: boolean;
}> = ({ data, onBulletUpdate, isEditable = false }) => {
    return (
        <div className="bg-white text-slate-900 min-h-[1123px] w-full max-w-[794px] mx-auto flex">
            {/* Sidebar */}
            <div className="w-48 bg-slate-900 text-white p-6">
                <div className="mb-8">
                    {data.profile_picture && (
                        <img
                            src={data.profile_picture}
                            alt={data.full_name}
                            className="w-32 h-32 rounded-full object-cover border-4 border-white/20 mb-4 mx-auto"
                        />
                    )}
                    <h1 className="text-2xl font-bold mb-4 text-center">{data.full_name}</h1>
                    <div className="space-y-2 text-xs">
                        <div>{data.email}</div>
                        <div>{data.phone}</div>
                        <div>{data.location}</div>
                        {data.linkedin && <div><a href={data.linkedin} target="_blank" rel="noreferrer" className="underline">{data.linkedin}</a></div>}
                        {data.website && <div><a href={data.website} target="_blank" rel="noreferrer" className="underline">{data.website}</a></div>}
                    </div>
                </div>

                {(data as any).summary && (
                    <div className="mb-6">
                        <h2 className="text-sm font-bold uppercase mb-2 border-b border-white/20 pb-1">Summary</h2>
                        <p className="text-xs leading-relaxed text-white/80">{(data as any).summary}</p>
                    </div>
                )}

                <div className="mb-6">
                    <h2 className="text-sm font-bold uppercase mb-2 border-b border-white/20 pb-1">Skills</h2>
                    <div className="space-y-1 text-xs text-white/80">
                        {data.skills.map((skill, idx) => (
                            <div key={idx}>• {skill}</div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-8">
                <section className="mb-8">
                    <h2 className="text-2xl font-bold uppercase tracking-wide mb-4 border-b-2 border-slate-900 pb-2">Experience</h2>
                    <div className="space-y-6">
                        {data.experience.map((exp, idx) => (
                            <div key={idx}>
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <h3 className="font-bold text-lg">{exp.title}</h3>
                                        <div className="text-sm font-semibold text-slate-700">{exp.company}</div>
                                    </div>
                                    <span className="text-sm text-slate-600">{exp.start_date} – {exp.end_date || "Present"}</span>
                                </div>
                                <ul className="list-none space-y-1 text-sm text-slate-700">
                                {(exp as any).bullet_points ? (
                                    (exp as any).bullet_points.map((bp: string, i: number) => (
                                        isEditable && onBulletUpdate ? (
                                            <EditableBulletPoint
                                                key={i}
                                                bullet={bp}
                                                targetRole={data.target_role}
                                                context={`${exp.title} at ${exp.company}`}
                                                onUpdate={(newBullet) => onBulletUpdate(idx, i, newBullet)}
                                            />
                                            ) : (
                                                <li key={i} className="flex items-start">
                                                    <span className="mr-2">•</span>
                                                    <span>{bp}</span>
                                                </li>
                                            )
                                        ))
                                    ) : (
                                        <li className="flex items-start">
                                            <span className="mr-2">•</span>
                                            <span>{exp.description}</span>
                                        </li>
                                    )}
                                </ul>
                            </div>
                        ))}
                    </div>
                </section>

                {data.education && data.education.length > 0 && (
                    <section>
                        <h2 className="text-2xl font-bold uppercase tracking-wide mb-4 border-b-2 border-slate-900 pb-2">Education</h2>
                        <div className="space-y-4">
                            {data.education.map((edu, idx) => (
                                <div key={idx}>
                                    <h3 className="font-bold text-md">{edu.school}</h3>
                                    <div className="text-sm text-slate-700">{edu.degree}</div>
                                    <div className="text-sm text-slate-600">{edu.graduation_year}</div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
};

// Creative Template - Unique with shapes
const CreativeTemplate: React.FC<{ 
    data: ResumeData; 
    onBulletUpdate?: (expIndex: number, bulletIndex: number, newBullet: string) => void;
    isEditable?: boolean;
}> = ({ data, onBulletUpdate, isEditable = false }) => {
    return (
        <div className="bg-white text-slate-900 p-12 min-h-[1123px] w-full max-w-[794px] mx-auto relative overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full -mr-32 -mt-32 opacity-50"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-blue-100 to-indigo-100 rounded-full -ml-24 -mb-24 opacity-50"></div>

            <div className="relative z-10">
                <header className="mb-8 pb-6 border-b-4 border-purple-500">
                    <div className="flex items-center gap-6 mb-3">
                        {data.profile_picture && (
                            <img
                                src={data.profile_picture}
                                alt={data.full_name}
                                className="w-28 h-28 rounded-full object-cover border-4 border-purple-500/50 shadow-lg"
                            />
                        )}
                        <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
                            {data.full_name}
                        </h1>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                        <span className="flex items-center">
                            <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                            {data.email}
                        </span>
                        <span className="flex items-center">
                            <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                            {data.phone}
                        </span>
                        <span className="flex items-center">
                            <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                            {data.location}
                        </span>
                        {data.linkedin && (
                            <a href={data.linkedin} target="_blank" rel="noreferrer" className="flex items-center underline">
                                <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                                LinkedIn
                            </a>
                        )}
                        {data.website && (
                            <a href={data.website} target="_blank" rel="noreferrer" className="flex items-center underline">
                                <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                                Portfolio
                            </a>
                        )}
                    </div>
                </header>

                {(data as any).summary && (
                    <section className="mb-6 bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border-l-4 border-purple-500">
                        <h2 className="text-lg font-bold text-purple-700 mb-2">Professional Summary</h2>
                        <p className="text-sm leading-relaxed text-slate-700">{(data as any).summary}</p>
                    </section>
                )}

                <div className="grid grid-cols-2 gap-6 mb-6">
                    <section>
                        <h2 className="text-xl font-bold text-purple-700 mb-3">Skills</h2>
                        <div className="flex flex-wrap gap-2">
                            {data.skills.map((skill, idx) => (
                                <span key={idx} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                                    {skill}
                                </span>
                            ))}
                        </div>
                    </section>

                    {data.education && data.education.length > 0 && (
                        <section>
                            <h2 className="text-xl font-bold text-purple-700 mb-3">Education</h2>
                            <div className="space-y-2">
                                {data.education.map((edu, idx) => (
                                    <div key={idx} className="bg-purple-50 p-2 rounded">
                                        <div className="font-bold text-sm">{edu.school}</div>
                                        <div className="text-xs text-slate-600">{edu.degree}</div>
                                        <div className="text-xs text-purple-600">{edu.graduation_year}</div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}
                </div>

                <section className="mb-6">
                    <h2 className="text-xl font-bold text-purple-700 mb-4">Experience</h2>
                    <div className="space-y-5">
                        {data.experience.map((exp, idx) => (
                            <div key={idx} className="bg-gradient-to-r from-purple-50 to-transparent p-4 rounded-lg border-l-4 border-purple-500">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <h3 className="font-bold text-lg text-slate-900">{exp.title}</h3>
                                        <div className="text-sm font-semibold text-purple-600">{exp.company}</div>
                                    </div>
                                    <span className="text-sm text-slate-600 bg-white px-2 py-1 rounded">{exp.start_date} – {exp.end_date || "Present"}</span>
                                </div>
                            <ul className="list-none space-y-1 text-sm text-slate-700 mt-2">
                                {(exp as any).bullet_points ? (
                                    (exp as any).bullet_points.map((bp: string, i: number) => (
                                        isEditable && onBulletUpdate ? (
                                            <EditableBulletPoint
                                                key={i}
                                                bullet={bp}
                                                targetRole={data.target_role}
                                                context={`${exp.title} at ${exp.company}`}
                                                onUpdate={(newBullet) => onBulletUpdate(idx, i, newBullet)}
                                            />
                                        ) : (
                                            <li key={i} className="flex items-start">
                                                <span className="mr-2">•</span>
                                                <span>{bp}</span>
                                            </li>
                                        )
                                    ))
                                ) : (
                                    <li className="flex items-start">
                                        <span className="mr-2">•</span>
                                        <span>{exp.description}</span>
                                    </li>
                                )}
                            </ul>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default ResumeTemplateComponent;

