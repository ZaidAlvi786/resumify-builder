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

// AI Career Trend Analyzer

export interface SkillTrend {
    skill_name: string;
    current_demand: string;
    predicted_demand: string;
    demand_timeline: string;
    growth_rate?: string;
    reason: string;
    industry_impact: string;
}

export interface RoleTrend {
    role_title: string;
    current_market_status: string;
    predicted_status: string;
    growth_indicators: string[];
    salary_trend?: string;
    skill_requirements: string[];
    timeline: string;
}

export interface ResumeRecommendation {
    recommendation_type: string;
    priority: number;
    action: string;
    reason: string;
    expected_impact: string;
}

export interface CareerTrendAnalyzerResponse {
    industry: string;
    analysis_date: string;
    prediction_period: string;
    skill_trends: SkillTrend[];
    role_trends: RoleTrend[];
    resume_recommendations: ResumeRecommendation[];
    future_proof_score: number;
    market_insights: string[];
    emerging_skills: string[];
    declining_skills: string[];
    action_plan: string[];
}

export const analyzeCareerTrends = async (
    resumeText: string,
    currentRole: string,
    industry?: string,
    yearsOfExperience?: number,
    targetRoles?: string[],
    predictionMonths: number = 12
): Promise<CareerTrendAnalyzerResponse> => {
    const response = await fetch(`${API_URL}/analyze-career-trends`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            resume_text: resumeText,
            current_role: currentRole,
            industry: industry,
            years_of_experience: yearsOfExperience,
            target_roles: targetRoles,
            prediction_months: predictionMonths,
        }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "Failed to analyze career trends");
    }

    return response.json();
};

// Real-Time Salary Negotiation Simulator

export interface NegotiationMessage {
    role: string;
    message: string;
    strategy?: string;
    timestamp: string;
}

export interface NegotiationScript {
    scenario_name: string;
    difficulty: string;
    description: string;
    key_points: string[];
    suggested_responses: string[];
    counter_offer_suggestions: string[];
}

export interface SalaryNegotiationResponse {
    negotiation_conversation: NegotiationMessage[];
    recommended_scripts: NegotiationScript[];
    salary_benchmark?: Record<string, any>;
    negotiation_tips: string[];
    common_mistakes_to_avoid: string[];
    power_phrases: string[];
    scenarios_practiced: string[];
}

export const simulateSalaryNegotiation = async (
    resumeText: string,
    targetRole: string,
    currentSalary?: string,
    yearsOfExperience?: number,
    location?: string,
    companyName?: string,
    jobDescription?: string,
    initialOffer?: string,
    negotiationScenario?: string
): Promise<SalaryNegotiationResponse> => {
    const response = await fetch(`${API_URL}/salary-negotiation`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            resume_text: resumeText,
            target_role: targetRole,
            current_salary: currentSalary,
            years_of_experience: yearsOfExperience,
            location: location,
            company_name: companyName,
            job_description: jobDescription,
            initial_offer: initialOffer,
            negotiation_scenario: negotiationScenario,
        }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "Failed to simulate salary negotiation");
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



export interface CodeExample {
    language: string;
    code: string;
    explanation: string;
    time_complexity?: string;
    space_complexity?: string;
}

export interface InterviewQuestion {
    question: string;
    answer: string;
    category: string;
    difficulty?: string;
    experience_level?: string;
    code_examples?: CodeExample[];
    key_points?: string[];
    follow_up_questions?: string[];
}

export interface InterviewQuestionsResponse {
    questions: string[];
    answers: string[];
    categories: string[];
    detailed_questions?: InterviewQuestion[];
    technical_questions_count?: number;
    behavioral_questions_count?: number;
    system_design_questions_count?: number;
}

export const generateInterviewQuestions = async (
    resumeText: string,
    targetRole: string,
    jobDescription?: string,
    yearsOfExperience?: number,
    includeCodeExamples: boolean = true
): Promise<InterviewQuestionsResponse> => {
    const response = await fetch(`${API_URL}/interview-questions`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            resume_text: resumeText,
            target_role: targetRole,
            job_description: jobDescription,
            years_of_experience: yearsOfExperience,
            include_code_examples: includeCodeExamples,
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



// ============================================
// NEW QUICK WIN FEATURES
// ============================================

export interface QuantifiedSuggestion {
    quantified_version: string;
    metric_type: string;
    suggested_metrics: string[];
    explanation: string;
    confidence: string;
}

export interface AchievementQuantifierResponse {
    original_achievement: string;
    quantified_suggestions: QuantifiedSuggestion[];
    improvement_tips: string[];
    example_metrics: Record<string, string[]>;
}

export const quantifyAchievement = async (
    achievementText: string,
    roleTitle?: string,
    company?: string,
    targetRole?: string
): Promise<AchievementQuantifierResponse> => {
    const response = await fetch(`${API_URL}/quantify-achievement`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            achievement_text: achievementText,
            role_title: roleTitle,
            company: company,
            target_role: targetRole,
        }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "Failed to quantify achievement");
    }

    return response.json();
};



export interface SummaryVariation {
    summary_text: string;
    style: string;
    length: string;
    word_count: number;
    strengths: string[];
}

export interface SummaryVariationsResponse {
    variations: SummaryVariation[];
    recommended_variation: number;
    selection_guide: Record<string, string>;
}

export const getSummaryVariations = async (
    resumeData: ResumeData,
    targetRole: string,
    numberOfVariations: number = 10,
    stylePreferences?: string[]
): Promise<SummaryVariationsResponse> => {
    const response = await fetch(`${API_URL}/summary-variations`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            resume_data: resumeData,
            target_role: targetRole,
            number_of_variations: numberOfVariations,
            style_preferences: stylePreferences,
        }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "Failed to generate summary variations");
    }

    return response.json();
};



export interface KeywordSynonym {
    original_keyword: string;
    synonyms: string[];
    context: string;
    ats_impact: string;
}

export interface KeywordSynonymExpanderResponse {
    keyword_synonyms: KeywordSynonym[];
    suggested_replacements: Record<string, string[]>;
    keyword_density_analysis: Record<string, any>;
    recommendations: string[];
}

export const expandKeywordSynonyms = async (
    resumeText: string,
    targetRole: string,
    jobDescription?: string,
    avoidKeywordStuffing: boolean = true
): Promise<KeywordSynonymExpanderResponse> => {
    const response = await fetch(`${API_URL}/expand-keywords`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            resume_text: resumeText,
            target_role: targetRole,
            job_description: jobDescription,
            avoid_keyword_stuffing: avoidKeywordStuffing,
        }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "Failed to expand keyword synonyms");
    }

    return response.json();
};



// ============================================
// HIGH-IMPACT FEATURES
// ============================================

export interface ResumeVersion {
    version_id: string;
    version_name: string;
    target_role?: string;
    industry?: string;
    style: string;
    resume_data: ResumeData;
    key_changes: string[];
    best_for: string[];
}

export interface MultiResumePortfolioResponse {
    master_resume: ResumeData;
    versions: ResumeVersion[];
    usage_guide: Record<string, string>;
    differences_summary: Record<string, any>;
}

export const generateMultiResumePortfolio = async (
    masterResumeData: ResumeData,
    targetRoles?: string[],
    industries?: string[],
    styles?: string[],
    numberOfVersions: number = 5
): Promise<MultiResumePortfolioResponse> => {
    const response = await fetch(`${API_URL}/multi-resume-portfolio`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            master_resume_data: masterResumeData,
            target_roles: targetRoles,
            industries: industries,
            styles: styles,
            number_of_versions: numberOfVersions,
        }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "Failed to generate multi-resume portfolio");
    }

    return response.json();
};



export interface RequiredSkill {
    skill_name: string;
    importance: string;
    category: string;
    description: string;
}

export interface LearningResource {
    title: string;
    type: string;
    provider?: string;
    duration?: string;
    cost?: string;
    url?: string;
    description: string;
}

export interface LearningPath {
    skill_name: string;
    current_level: string;
    target_level: string;
    learning_resources: LearningResource[];
    estimated_time: string;
    difficulty: string;
    priority: number;
}

export interface SkillGapAnalyzerResponse {
    current_skills: string[];
    required_skills: RequiredSkill[];
    skill_gaps: string[];
    skill_level_gaps: Record<string, string>;
    learning_paths: LearningPath[];
    skill_priority_ranking: string[];
    overall_readiness_score: number;
    recommendations: string[];
    timeline_estimate: string;
}

export const analyzeSkillGaps = async (
    resumeText: string,
    targetRole: string,
    jobDescription?: string,
    currentSkills?: string[],
    includeLearningPaths: boolean = true
): Promise<SkillGapAnalyzerResponse> => {
    const response = await fetch(`${API_URL}/analyze-skill-gaps`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            resume_text: resumeText,
            target_role: targetRole,
            job_description: jobDescription,
            current_skills: currentSkills,
            include_learning_paths: includeLearningPaths,
        }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "Failed to analyze skill gaps");
    }

    return response.json();
};


