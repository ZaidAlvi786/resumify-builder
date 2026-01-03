import React, { useRef, useState, useEffect } from "react";
import { ResumeData } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Download, Printer, ArrowLeft, FileDown, ChevronDown, Sparkles } from "lucide-react";
import { exportToPDF, exportToWord, exportToHTML, exportToTXT } from "@/lib/exportResume";
import { ResumeTemplateComponent, ResumeTemplate } from "@/components/templates/ResumeTemplates";
import BulletRewriter from "@/components/BulletRewriter";

interface ResumePreviewProps {
    data: ResumeData;
    onEdit: () => void;
    template?: ResumeTemplate;
    onDataUpdate?: (updatedData: ResumeData) => void;
}

const ResumePreview: React.FC<ResumePreviewProps> = ({ data, onEdit, template, onDataUpdate }) => {
    const resumeRef = useRef<HTMLDivElement>(null);
    const [exportMenuOpen, setExportMenuOpen] = useState(false);
    const [resumeData, setResumeData] = useState<ResumeData>(data);

    // Sync resumeData with prop data when it changes
    useEffect(() => {
        setResumeData(data);
    }, [data]);

    const handleBulletUpdate = (expIndex: number, bulletIndex: number, newBullet: string) => {
        const updatedData = { ...resumeData };
        if (updatedData.experience && updatedData.experience[expIndex] && updatedData.experience[expIndex].bullet_points) {
            updatedData.experience[expIndex].bullet_points[bulletIndex] = newBullet;
            setResumeData(updatedData);
            if (onDataUpdate) {
                onDataUpdate(updatedData);
            }
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const handleExport = async (format: 'pdf' | 'word' | 'html' | 'txt') => {
        try {
            switch (format) {
                case 'pdf':
                    await exportToPDF(resumeData);
                    break;
                case 'word':
                    exportToWord(resumeData);
                    break;
                case 'html':
                    exportToHTML(resumeData);
                    break;
                case 'txt':
                    exportToTXT(resumeData);
                    break;
            }
            setExportMenuOpen(false);
        } catch (error) {
            console.error('Export error:', error);
            alert('Export failed. Please try again.');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center print:hidden">
                <div className="flex gap-2">
                    <Button variant="outline" onClick={onEdit}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> Edit Details
                    </Button>
                </div>
                <div className="flex gap-2">
                    <div className="relative">
                        <Button
                            onClick={() => setExportMenuOpen(!exportMenuOpen)}
                            variant="secondary"
                            className="flex items-center gap-2"
                        >
                            <FileDown className="h-4 w-4" />
                            Export
                            <ChevronDown className="h-4 w-4" />
                        </Button>
                        {exportMenuOpen && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 z-10">
                                <button
                                    onClick={() => handleExport('pdf')}
                                    className="w-full text-left px-4 py-2 hover:bg-slate-50 rounded-t-lg flex items-center gap-2"
                                >
                                    <FileDown className="w-4 h-4" />
                                    Export as PDF
                                </button>
                                <button
                                    onClick={() => handleExport('word')}
                                    className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2"
                                >
                                    <FileDown className="w-4 h-4" />
                                    Export as Word
                                </button>
                                <button
                                    onClick={() => handleExport('html')}
                                    className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2"
                                >
                                    <FileDown className="w-4 h-4" />
                                    Export as HTML
                                </button>
                                <button
                                    onClick={() => handleExport('txt')}
                                    className="w-full text-left px-4 py-2 hover:bg-slate-50 rounded-b-lg flex items-center gap-2"
                                >
                                    <FileDown className="w-4 h-4" />
                                    Export as Text
                                </button>
                            </div>
                        )}
                    </div>
                    <Button onClick={handlePrint} variant="secondary">
                        <Printer className="mr-2 h-4 w-4" /> Print
                    </Button>
                </div>
            </div>

            {/* Resume Document - Using selected template */}
            <div
                ref={resumeRef}
                className="shadow-xl print:shadow-none print:w-full print:max-w-none"
                id="resume-content"
            >
                <ResumeTemplateComponent 
                    data={resumeData} 
                    template={template || "modern"}
                    onBulletUpdate={handleBulletUpdate}
                    isEditable={true}
                />
            </div>

            <style jsx global>{`
        @media print {
            body * {
                visibility: hidden;
            }
            #resume-content, #resume-content * {
                visibility: visible;
            }
            #resume-content {
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
                margin: 0;
                padding: 40px; /* Add some padding for print */
                box-shadow: none;
            }
        }
      `}</style>
        </div>
    );
};

export default ResumePreview;
