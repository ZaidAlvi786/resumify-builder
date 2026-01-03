"use client";

import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload, FileText, X, Loader2, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ResumeUploadProps {
    onResumeParsed: (resumeData: any) => void;
    onClose?: () => void;
}

const ResumeUpload: React.FC<ResumeUploadProps> = ({ onResumeParsed, onClose }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) {
            handleFile(file);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handleFile(file);
        }
    };

    const handleFile = async (file: File) => {
        if (file.type !== "application/pdf" && !file.type.startsWith("text/")) {
            alert("Please upload a PDF or text file");
            return;
        }

        setUploadedFile(file);
        setIsUploading(true);

        try {
            const formData = new FormData();
            formData.append("file", file);

            const response = await fetch("http://localhost:8000/api/resume/extract-text", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                throw new Error("Failed to extract text from resume");
            }

            const text = await response.text();

            // Parse the text into structured data using AI
            // For now, we'll use a simple approach - in production, use AI parsing
            const parsedData = parseResumeText(text);
            onResumeParsed(parsedData);
            
            // Show success message briefly
            setTimeout(() => {
                if (onClose) onClose();
            }, 1500);
        } catch (error) {
            console.error("Upload error:", error);
            alert("Failed to process resume. Please try again.");
            setIsUploading(false);
            setUploadedFile(null);
        }
    };

    const parseResumeText = (text: string): any => {
        // Basic parsing - extract key information
        // In production, this should use AI to parse more accurately
        const lines = text.split("\n").filter(line => line.trim());
        
        const data: any = {
            full_name: "",
            email: "",
            phone: "",
            location: "",
            target_role: "",
            skills: [],
            experience: [],
            education: [],
            projects: [],
        };

        // Extract email
        const emailMatch = text.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/);
        if (emailMatch) data.email = emailMatch[0];

        // Extract phone
        const phoneMatch = text.match(/(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
        if (phoneMatch) data.phone = phoneMatch[0];

        // Extract name (usually first line or before email)
        if (lines.length > 0) {
            const firstLine = lines[0].trim();
            if (firstLine && !firstLine.includes("@") && firstLine.length < 50) {
                data.full_name = firstLine;
            }
        }

        // This is a basic parser - in production, use AI to parse more accurately
        return data;
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6"
            >
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-slate-900">Upload Your Resume</h2>
                    {onClose && (
                        <button
                            onClick={onClose}
                            className="text-slate-400 hover:text-slate-600"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    )}
                </div>

                <AnimatePresence mode="wait">
                    {!uploadedFile ? (
                        <motion.div
                            key="upload"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <div
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
                                    isDragging
                                        ? "border-blue-500 bg-blue-50"
                                        : "border-slate-300 bg-slate-50"
                                }`}
                            >
                                <Upload className="w-12 h-12 mx-auto mb-4 text-slate-400" />
                                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                                    Drag and drop your resume here
                                </h3>
                                <p className="text-sm text-slate-600 mb-4">
                                    or click to browse
                                </p>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".pdf,.txt,.doc,.docx"
                                    onChange={handleFileSelect}
                                    className="hidden"
                                />
                                <Button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="bg-blue-600 hover:bg-blue-700"
                                >
                                    <FileText className="w-4 h-4 mr-2" />
                                    Choose File
                                </Button>
                                <p className="text-xs text-slate-500 mt-4">
                                    Supported formats: PDF, TXT, DOC, DOCX
                                </p>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="processing"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center py-8"
                        >
                            {isUploading ? (
                                <>
                                    <Loader2 className="w-12 h-12 mx-auto mb-4 text-blue-600 animate-spin" />
                                    <h3 className="text-lg font-semibold text-slate-900 mb-2">
                                        Processing your resume...
                                    </h3>
                                    <p className="text-sm text-slate-600">
                                        Extracting information from {uploadedFile.name}
                                    </p>
                                </>
                            ) : (
                                <>
                                    <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-600" />
                                    <h3 className="text-lg font-semibold text-slate-900 mb-2">
                                        Resume uploaded successfully!
                                    </h3>
                                    <p className="text-sm text-slate-600">
                                        Your resume has been parsed and loaded into the form.
                                    </p>
                                </>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
};

export default ResumeUpload;


