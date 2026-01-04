// src/services/api.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/resume";

export interface ResumeData {
    full_name: string;
    email: string;
    phone: string;
    location: string;
    linkedin?: string;
    website?: string;
    target_role: string;
    summary?: string;
    skills: string[];
    soft_skills?: string[];
    profile_picture?: string; // Base64 encoded image
    experience: {
        title: string;
        company: string;
        start_date: string;
        end_date?: string;
        description: string;
        bullet_points?: string[];
    }[];
    education: {
        degree: string;
        school: string;
        graduation_year: string;
    }[];
    projects?: {
        name: string;
        description: string;
    }[];
    certifications?: string[];
}

export const generateResume = async (data: ResumeData) => {
    const response = await fetch(`${API_URL}/generate`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "Failed to generate resume");
    }

    return response.json();
};

export const reviewResume = async (file: File | null, text: string | null, targetRole: string, jobDescription?: string) => {
    const formData = new FormData();
    if (file) formData.append("file", file);
    if (text) formData.append("resume_text", text);
    formData.append("target_role", targetRole);
    if (jobDescription) formData.append("job_description", jobDescription);

    const response = await fetch(`${API_URL}/review`, {
        method: "POST",
        body: formData,
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "Failed to review resume");
    }

    return response.json();
};

export const matchJobDescription = async (resumeText: string, jobDescription: string) => {
    const response = await fetch(`${API_URL}/match-job`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            resume_text: resumeText,
            job_description: jobDescription,
        }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "Failed to match job description");
    }

    return response.json();
};

export const generateCoverLetter = async (
    resumeText: string,
    jobDescription: string,
    companyName: string,
    applicantName: string,
    position: string
) => {
    const response = await fetch(`${API_URL}/cover-letter`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            resume_text: resumeText,
            job_description: jobDescription,
            company_name: companyName,
            applicant_name: applicantName,
            position: position,
        }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "Failed to generate cover letter");
    }

    return response.json();
};

export const generateInterviewQuestions = async (
    resumeText: string,
    targetRole: string,
    jobDescription?: string
) => {
    const response = await fetch(`${API_URL}/interview-questions`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            resume_text: resumeText,
            target_role: targetRole,
            job_description: jobDescription,
        }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "Failed to generate interview questions");
    }

    return response.json();
};

export const improveResume = async (
    resumeText: string,
    targetRole: string,
    suggestions: string[],
    strengths: string[],
    weaknesses: string[],
    missingSkills: string[] = [],
    missingKeywords: string[] = [],
    jobDescription?: string
) => {
    const response = await fetch(`${API_URL}/improve`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            resume_text: resumeText,
            target_role: targetRole,
            suggestions: suggestions,
            strengths: strengths,
            weaknesses: weaknesses,
            missing_skills: missingSkills,
            missing_keywords: missingKeywords,
            job_description: jobDescription,
        }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "Failed to improve resume");
    }

    return response.json();
};

export const generateResignationLetter = async (
    employeeName: string,
    companyName: string,
    position: string,
    lastWorkingDay: string,
    reason?: string,
    tone?: string
) => {
    const response = await fetch(`${API_URL}/resignation-letter`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            employee_name: employeeName,
            company_name: companyName,
            position: position,
            last_working_day: lastWorkingDay,
            reason: reason,
            tone: tone || "professional",
        }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "Failed to generate resignation letter");
    }

    return response.json();
};

export const rewriteBulletPoint = async (
    originalBullet: string,
    targetRole: string,
    context?: string
) => {
    const response = await fetch(`${API_URL}/rewrite-bullet`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            original_bullet: originalBullet,
            target_role: targetRole,
            context: context,
        }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "Failed to rewrite bullet point");
    }

    return response.json();
};

// Advanced Features APIs

export interface CareerPathStep {
    role_title: string;
    timeline: string;
    required_skills: string[];
    description: string;
    salary_range?: string;
}

export interface CareerPathResponse {
    current_level: string;
    next_steps: CareerPathStep[];
    skill_gaps: string[];
    recommended_courses: string[];
    career_trajectory: string;
}

export const predictCareerPath = async (
    resumeText: string,
    currentRole: string,
    yearsOfExperience?: number
): Promise<CareerPathResponse> => {
    const response = await fetch(`${API_URL}/career-path`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            resume_text: resumeText,
            current_role: currentRole,
            years_of_experience: yearsOfExperience,
        }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "Failed to predict career path");
    }

    return response.json();
};

export interface SectionScore {
    section_name: string;
    score: number;
    strength_level: string;
    feedback: string;
    keywords_found: string[];
    keywords_missing: string[];
}

export interface ResumeHeatMapResponse {
    overall_score: number;
    section_scores: SectionScore[];
    heat_map_data: Record<string, number>;
}

export const getResumeHeatMap = async (
    resumeText: string,
    targetRole: string
): Promise<ResumeHeatMapResponse> => {
    const response = await fetch(`${API_URL}/heatmap`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            resume_text: resumeText,
            target_role: targetRole,
        }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "Failed to generate resume heatmap");
    }

    return response.json();
};

export interface BenchmarkComparison {
    metric: string;
    your_score: number;
    industry_average: number;
    percentile: number;
    status: string;
}

export interface IndustryBenchmarkResponse {
    industry: string;
    comparisons: BenchmarkComparison[];
    recommendations: string[];
    industry_insights: string[];
}

export const benchmarkAgainstIndustry = async (
    resumeText: string,
    targetRole: string,
    industry: string
): Promise<IndustryBenchmarkResponse> => {
    const response = await fetch(`${API_URL}/benchmark`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            resume_text: resumeText,
            target_role: targetRole,
            industry: industry,
        }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "Failed to benchmark resume");
    }

    return response.json();
};

export interface MultiLanguageResponse {
    translated_resume: string;
    language: string;
    confidence_score?: number;
    cultural_adaptations: string[];
}

export const translateResume = async (
    resumeText: string,
    targetLanguage: string,
    preserveFormatting: boolean = true
): Promise<MultiLanguageResponse> => {
    const response = await fetch(`${API_URL}/translate`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            resume_text: resumeText,
            target_language: targetLanguage,
            preserve_formatting: preserveFormatting,
        }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "Failed to translate resume");
    }

    return response.json();
};

export interface ResumeAnalyticsResponse {
    ats_score: number;
    keyword_density: Record<string, number>;
    readability_score: number;
    word_count: number;
    sections_completeness: Record<string, number>;
    improvement_potential: number;
    estimated_interview_rate?: number;
}

export const getResumeAnalytics = async (
    resumeText: string,
    targetRole: string,
    applicationDate?: string
): Promise<ResumeAnalyticsResponse> => {
    const response = await fetch(`${API_URL}/analytics`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            resume_text: resumeText,
            target_role: targetRole,
            application_date: applicationDate,
        }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "Failed to analyze resume");
    }

    return response.json();
};

export interface ChatMessage {
    role: "user" | "assistant";
    content: string;
}

export const chatWithAIAgent = async (
    messages: ChatMessage[],
    resumeData?: ResumeData,
    context?: string
) => {
    const response = await fetch(`${API_URL}/chat`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            messages,
            resume_data: resumeData,
            context,
        }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "Failed to chat with AI agent");
    }

    return response.json();
};

export interface JobDescriptionAnalyzerResponse {
    match_score: number;
    matched_keywords: string[];
    missing_keywords: string[];
    skill_gaps: string[];
    recommendations: string[];
    tailored_resume: ResumeData;
    improvements_made: string[];
    before_after_comparison?: {
        summary?: { before: string; after: string };
        experience?: Array<{ before: string; after: string }>;
    };
}

export const analyzeJobAndTailorResume = async (
    resumeData: ResumeData,
    jobDescription: string,
    jobTitle?: string,
    companyName?: string
): Promise<JobDescriptionAnalyzerResponse> => {
    const response = await fetch(`${API_URL}/analyze-job-and-tailor`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            resume_data: resumeData,
            job_description: jobDescription,
            job_title: jobTitle,
            company_name: companyName,
        }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "Failed to analyze job and tailor resume");
    }

    return response.json();
};
