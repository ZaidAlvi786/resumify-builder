"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, CheckCircle2, XCircle } from "lucide-react";

interface SkillGapData {
    resumeSkills: string[];
    requiredSkills: string[];
    missingSkills: string[];
    matchedSkills: string[];
}

interface SkillGapVisualizerProps {
    data: SkillGapData;
}

export default function SkillGapVisualizer({ data }: SkillGapVisualizerProps) {
    const matchPercentage = data.requiredSkills.length > 0
        ? Math.round((data.matchedSkills.length / data.requiredSkills.length) * 100)
        : 0;

    const getSkillCategory = (skill: string): string => {
        const techKeywords = ['javascript', 'python', 'react', 'node', 'sql', 'java', 'c++', 'typescript'];
        const softKeywords = ['leadership', 'communication', 'teamwork', 'problem-solving', 'collaboration'];
        
        const lowerSkill = skill.toLowerCase();
        if (techKeywords.some(kw => lowerSkill.includes(kw))) return 'Technical';
        if (softKeywords.some(kw => lowerSkill.includes(kw))) return 'Soft Skills';
        return 'Other';
    };

    const categorizedSkills = {
        Technical: { matched: [] as string[], missing: [] as string[] },
        'Soft Skills': { matched: [] as string[], missing: [] as string[] },
        Other: { matched: [] as string[], missing: [] as string[] },
    };

    data.matchedSkills.forEach(skill => {
        const category = getSkillCategory(skill);
        categorizedSkills[category as keyof typeof categorizedSkills].matched.push(skill);
    });

    data.missingSkills.forEach(skill => {
        const category = getSkillCategory(skill);
        categorizedSkills[category as keyof typeof categorizedSkills].missing.push(skill);
    });

    return (
        <Card className="border-t-4 border-t-indigo-500">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-indigo-600" />
                    Skill Gap Analysis
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Overall Match Score */}
                <div className="text-center p-6 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg">
                    <div className="text-4xl font-bold text-indigo-600 mb-2">{matchPercentage}%</div>
                    <p className="text-slate-600 text-sm">Skill Match Score</p>
                    <div className="mt-4 w-full bg-slate-200 rounded-full h-3">
                        <div
                            className="bg-gradient-to-r from-indigo-500 to-purple-500 h-3 rounded-full transition-all duration-500"
                            style={{ width: `${matchPercentage}%` }}
                        />
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">{data.matchedSkills.length}</div>
                        <div className="text-xs text-slate-600 mt-1">Matched Skills</div>
                    </div>
                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                        <div className="text-2xl font-bold text-orange-600">{data.missingSkills.length}</div>
                        <div className="text-xs text-slate-600 mt-1">Missing Skills</div>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{data.resumeSkills.length}</div>
                        <div className="text-xs text-slate-600 mt-1">Total Skills</div>
                    </div>
                </div>

                {/* Categorized Skills */}
                {Object.entries(categorizedSkills).map(([category, skills]) => {
                    if (skills.matched.length === 0 && skills.missing.length === 0) return null;
                    
                    return (
                        <div key={category} className="space-y-3">
                            <h3 className="font-semibold text-slate-700">{category}</h3>
                            
                            {skills.matched.length > 0 && (
                                <div>
                                    <div className="flex items-center gap-2 mb-2 text-sm text-green-700">
                                        <CheckCircle2 className="w-4 h-4" />
                                        <span className="font-medium">You Have ({skills.matched.length})</span>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {skills.matched.map((skill, i) => (
                                            <span
                                                key={i}
                                                className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium"
                                            >
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                            
                            {skills.missing.length > 0 && (
                                <div>
                                    <div className="flex items-center gap-2 mb-2 text-sm text-orange-700">
                                        <XCircle className="w-4 h-4" />
                                        <span className="font-medium">Missing ({skills.missing.length})</span>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {skills.missing.map((skill, i) => (
                                            <span
                                                key={i}
                                                className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium border-2 border-orange-300"
                                            >
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}

                {/* Recommendations */}
                {data.missingSkills.length > 0 && (
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-sm font-semibold text-yellow-800 mb-2">💡 Recommendations</p>
                        <ul className="text-xs text-yellow-700 space-y-1">
                            <li>• Focus on acquiring the {data.missingSkills.slice(0, 3).join(', ')} skills</li>
                            <li>• Highlight transferable skills that relate to missing requirements</li>
                            <li>• Consider taking courses or certifications in these areas</li>
                        </ul>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

