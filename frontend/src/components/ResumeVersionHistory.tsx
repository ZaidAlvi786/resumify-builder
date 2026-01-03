"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, GitBranch, Eye, RotateCcw } from "lucide-react";
import { ResumeData } from "@/services/api";

interface ResumeVersion {
    id: string;
    title: string;
    content: ResumeData;
    version_number: number;
    created_at: string;
    updated_at: string;
}

interface ResumeVersionHistoryProps {
    resumeId: string;
    onLoadVersion: (content: ResumeData) => void;
}

export default function ResumeVersionHistory({ resumeId, onLoadVersion }: ResumeVersionHistoryProps) {
    const [versions, setVersions] = useState<ResumeVersion[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedVersions, setSelectedVersions] = useState<Set<string>>(new Set());
    const [comparison, setComparison] = useState<{ v1: ResumeVersion | null; v2: ResumeVersion | null }>({
        v1: null,
        v2: null,
    });

    useEffect(() => {
        loadVersions();
    }, [resumeId]);

    const loadVersions = async () => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await supabase
                .from('resumes')
                .select('id, title, content, version_number, created_at, updated_at, parent_resume_id')
                .or(`id.eq.${resumeId},parent_resume_id.eq.${resumeId}`)
                .order('version_number', { ascending: false });

            if (error) throw error;
            setVersions((data || []) as ResumeVersion[]);
        } catch (err) {
            console.error("Error loading versions:", err);
        } finally {
            setLoading(false);
        }
    };

    const toggleVersionSelection = (version: ResumeVersion) => {
        const newSelected = new Set(selectedVersions);
        if (newSelected.has(version.id)) {
            newSelected.delete(version.id);
        } else if (newSelected.size < 2) {
            newSelected.add(version.id);
        }
        setSelectedVersions(newSelected);

        if (newSelected.size === 2) {
            const selected = Array.from(newSelected).map(id => versions.find(v => v.id === id)).filter(Boolean) as ResumeVersion[];
            setComparison({ v1: selected[0], v2: selected[1] });
        } else {
            setComparison({ v1: null, v2: null });
        }
    };

    const compareVersions = () => {
        if (comparison.v1 && comparison.v2) {
            // Show comparison modal or side-by-side view
            alert(`Comparing Version ${comparison.v1.version_number} vs Version ${comparison.v2.version_number}`);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <GitBranch className="w-5 h-5" />
                    Version History
                </CardTitle>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="text-center py-4 text-slate-500">Loading versions...</div>
                ) : versions.length === 0 ? (
                    <div className="text-center py-4 text-slate-500">No previous versions found</div>
                ) : (
                    <div className="space-y-3">
                        {versions.map((version) => (
                            <div
                                key={version.id}
                                className={`p-3 rounded-lg border-2 transition-all ${
                                    selectedVersions.has(version.id)
                                        ? 'border-indigo-500 bg-indigo-50'
                                        : 'border-slate-200 hover:border-slate-300'
                                }`}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-semibold">Version {version.version_number}</span>
                                            {version.id === resumeId && (
                                                <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                                                    Current
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-4 text-xs text-slate-500">
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {new Date(version.updated_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => onLoadVersion(version.content)}
                                            className="flex items-center gap-1"
                                        >
                                            <Eye className="w-3 h-3" />
                                            View
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => toggleVersionSelection(version)}
                                            className={selectedVersions.has(version.id) ? 'bg-indigo-100' : ''}
                                        >
                                            {selectedVersions.has(version.id) ? 'Selected' : 'Select'}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                        
                        {selectedVersions.size === 2 && (
                            <Button
                                onClick={compareVersions}
                                className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700"
                            >
                                Compare Selected Versions
                            </Button>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

