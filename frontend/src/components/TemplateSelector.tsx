import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Layout, FileText } from "lucide-react";
import { motion } from "framer-motion";

export type ResumeTemplate = "modern" | "classic" | "minimalist" | "executive" | "creative";
export type CoverLetterTemplate = "professional" | "modern" | "formal";

interface TemplateOption {
    id: ResumeTemplate | CoverLetterTemplate;
    name: string;
    description: string;
    preview: string;
    color: string;
    icon: React.ReactNode;
}

const resumeTemplates: TemplateOption[] = [
    {
        id: "modern",
        name: "Modern",
        description: "Clean design with colored accents",
        preview: "Colored header, clean sections",
        color: "from-blue-500 to-indigo-500",
        icon: <Layout className="w-6 h-6" />
    },
    {
        id: "classic",
        name: "Classic",
        description: "Traditional format with borders",
        preview: "Bold borders, centered header",
        color: "from-slate-700 to-slate-900",
        icon: <FileText className="w-6 h-6" />
    },
    {
        id: "minimalist",
        name: "Minimalist",
        description: "Ultra-clean and simple design",
        preview: "Minimal styling, lots of white space",
        color: "from-gray-400 to-gray-600",
        icon: <Layout className="w-6 h-6" />
    },
    {
        id: "executive",
        name: "Executive",
        description: "Professional sidebar layout",
        preview: "Sidebar with skills, main content area",
        color: "from-slate-800 to-slate-900",
        icon: <FileText className="w-6 h-6" />
    },
    {
        id: "creative",
        name: "Creative",
        description: "Unique design with gradients",
        preview: "Gradient accents, modern layout",
        color: "from-purple-500 to-pink-500",
        icon: <Layout className="w-6 h-6" />
    }
];

const coverLetterTemplates: TemplateOption[] = [
    {
        id: "professional",
        name: "Professional",
        description: "Standard business format",
        preview: "Traditional layout, clean spacing",
        color: "from-blue-500 to-blue-600",
        icon: <FileText className="w-6 h-6" />
    },
    {
        id: "modern",
        name: "Modern",
        description: "Contemporary with accent colors",
        preview: "Colored header, modern styling",
        color: "from-indigo-500 to-purple-500",
        icon: <Layout className="w-6 h-6" />
    },
    {
        id: "formal",
        name: "Formal",
        description: "Traditional formal format",
        preview: "Bordered layout, formal structure",
        color: "from-slate-600 to-slate-700",
        icon: <FileText className="w-6 h-6" />
    }
];

interface TemplateSelectorProps {
    type: "resume" | "coverLetter";
    selectedTemplate: ResumeTemplate | CoverLetterTemplate;
    onSelect: (template: ResumeTemplate | CoverLetterTemplate) => void;
}

export const TemplateSelector: React.FC<TemplateSelectorProps> = ({ 
    type, 
    selectedTemplate, 
    onSelect 
}) => {
    const templates = type === "resume" ? resumeTemplates : coverLetterTemplates;

    return (
        <div className="space-y-4">
            <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-1">
                    Choose a {type === "resume" ? "Resume" : "Cover Letter"} Template
                </h3>
                <p className="text-sm text-slate-600">
                    Select a template that best fits your style and industry
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {templates.map((template, index) => (
                    <motion.div
                        key={template.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        onClick={() => onSelect(template.id)}
                        className="cursor-pointer"
                    >
                        <Card
                            className={`relative overflow-hidden transition-all duration-200 ${
                                selectedTemplate === template.id
                                    ? "ring-2 ring-blue-500 shadow-lg scale-105"
                                    : "hover:shadow-md"
                            }`}
                        >
                            {/* Preview gradient */}
                            <div className={`h-20 bg-gradient-to-r ${template.color} flex items-center justify-center text-white`}>
                                {template.icon}
                            </div>

                            <CardContent className="p-4">
                                <div className="flex items-start justify-between mb-2">
                                    <div>
                                        <h4 className="font-semibold text-slate-900">{template.name}</h4>
                                        <p className="text-xs text-slate-600 mt-1">{template.description}</p>
                                    </div>
                                    {selectedTemplate === template.id && (
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className="bg-blue-500 rounded-full p-1"
                                        >
                                            <Check className="w-4 h-4 text-white" />
                                        </motion.div>
                                    )}
                                </div>
                                <p className="text-xs text-slate-500 mt-2">{template.preview}</p>
                            </CardContent>

                            {/* Selection indicator */}
                            {selectedTemplate === template.id && (
                                <div className="absolute top-0 right-0 bg-blue-500 text-white text-xs px-2 py-1 rounded-bl-lg">
                                    Selected
                                </div>
                            )}
                        </Card>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default TemplateSelector;

