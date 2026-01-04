# backend/schemas/resume.py
from typing import List, Optional
from pydantic import BaseModel, EmailStr

class Experience(BaseModel):
    title: str
    company: str
    start_date: str
    end_date: Optional[str] = "Present"
    description: str  # User input raw description

class Education(BaseModel):
    degree: str
    school: str
    graduation_year: str

class Project(BaseModel):
    name: str
    description: str

class ResumeInput(BaseModel):
    full_name: str
    email: EmailStr
    phone: str
    location: str
    linkedin: Optional[str] = None
    website: Optional[str] = None
    target_role: str
    skills: List[str]
    soft_skills: List[str] = []
    experience: List[Experience]
    education: List[Education]
    projects: List[Project] = []
    certifications: List[str] = []

class GeneratedExperience(BaseModel):
    title: str
    company: str
    start_date: str
    end_date: str
    bullet_points: List[str]

class ResumeOutput(BaseModel):
    full_name: str
    contact_info: dict
    summary: str
    skills: List[str]
    experience: List[GeneratedExperience]
    education: List[Education]
    projects: List[Project]
    certifications: List[str]

class ReviewInput(BaseModel):
    resume_text: str
    target_role: str
    job_description: Optional[str] = None  # New: Job description for matching

class ScoreCriteriaItem(BaseModel):
    name: str
    score: int
    max_score: int
    feedback: str
    status: str  # "pass", "warning", "fail"

class ScoreCategory(BaseModel):
    category: str
    criteria: List[ScoreCriteriaItem]

class ScoreBreakdown(BaseModel):
    keyword_optimization: int  # 0-100
    formatting_quality: int  # 0-100
    content_relevance: int  # 0-100
    quantifiable_achievements: int  # 0-100
    action_verbs: int  # 0-100
    length_appropriateness: int  # 0-100
    contact_info_completeness: int  # 0-100
    education_section: int  # 0-100
    experience_section: int  # 0-100
    skills_section: int  # 0-100
    summary_quality: int  # 0-100
    ats_compatibility: int  # 0-100
    grammar_spelling: int  # 0-100
    consistency: int  # 0-100
    professional_tone: int  # 0-100

class ReviewOutput(BaseModel):
    ats_score: int
    strengths: List[str]
    weaknesses: List[str]
    suggestions: List[str]
    missing_skills: List[str]
    job_match_score: Optional[int] = None  # New: Match score against JD
    keyword_matches: Optional[List[str]] = None  # New: Matched keywords
    missing_keywords: Optional[List[str]] = None  # New: Missing keywords
    score_breakdown: Optional[ScoreBreakdown] = None  # New: Detailed scoring breakdown
    detailed_scores: Optional[List[ScoreCategory]] = None  # New: Detailed scoring breakdown

class CoverLetterInput(BaseModel):
    resume_text: str
    job_description: str
    company_name: str
    applicant_name: str
    position: str

class CoverLetterOutput(BaseModel):
    cover_letter: str
    personalized_sections: dict

class InterviewQuestionsInput(BaseModel):
    resume_text: str
    target_role: str
    job_description: Optional[str] = None

class InterviewQuestionsOutput(BaseModel):
    questions: List[str]
    answers: List[str]  # Suggested answers
    categories: List[str]  # Technical, Behavioral, etc.

class JobMatchInput(BaseModel):
    resume_text: str
    job_description: str

class JobMatchOutput(BaseModel):
    match_score: int
    matched_keywords: List[str]
    missing_keywords: List[str]
    recommendations: List[str]
    skill_gaps: List[str]

class ImproveResumeInput(BaseModel):
    resume_text: str
    target_role: str
    suggestions: List[str]
    strengths: List[str]
    weaknesses: List[str]
    missing_skills: List[str] = []
    missing_keywords: List[str] = []
    job_description: Optional[str] = None

class ImproveResumeOutput(BaseModel):
    improved_resume_text: str
    improvements_made: List[str]  # List of what was improved
    original_ats_score: Optional[int] = None
    estimated_new_ats_score: Optional[int] = None

class ResignationLetterInput(BaseModel):
    employee_name: str
    company_name: str
    position: str
    last_working_day: str
    reason: Optional[str] = None
    tone: Optional[str] = "professional"  # professional, friendly, formal

class ResignationLetterOutput(BaseModel):
    resignation_letter: str
    personalized_sections: dict

class RewriteBulletInput(BaseModel):
    original_bullet: str
    target_role: str
    context: Optional[str] = None  # Additional context about the role/company

class RewriteBulletOutput(BaseModel):
    improved_bullet: str
    improvements_made: List[str]
    keywords_added: List[str]

# New Advanced Features Schemas

class CareerPathInput(BaseModel):
    resume_text: str
    current_role: str
    years_of_experience: Optional[int] = None

class CareerPathStep(BaseModel):
    role_title: str
    timeline: str  # e.g., "6-12 months", "1-2 years"
    required_skills: List[str]
    description: str
    salary_range: Optional[str] = None

class CareerPathOutput(BaseModel):
    current_level: str
    next_steps: List[CareerPathStep]
    skill_gaps: List[str]
    recommended_courses: List[str]
    career_trajectory: str  # Overall trajectory description

class ResumeHeatMapInput(BaseModel):
    resume_text: str
    target_role: str

class SectionScore(BaseModel):
    section_name: str
    score: int  # 0-100
    strength_level: str  # "strong", "moderate", "weak"
    feedback: str
    keywords_found: List[str]
    keywords_missing: List[str]

class ResumeHeatMapOutput(BaseModel):
    overall_score: int
    section_scores: List[SectionScore]
    heat_map_data: dict  # For visualization

class IndustryBenchmarkInput(BaseModel):
    resume_text: str
    target_role: str
    industry: str

class BenchmarkComparison(BaseModel):
    metric: str
    your_score: int
    industry_average: int
    percentile: int  # 0-100
    status: str  # "above_average", "average", "below_average"

class IndustryBenchmarkOutput(BaseModel):
    industry: str
    comparisons: List[BenchmarkComparison]
    recommendations: List[str]
    industry_insights: List[str]

class MultiLanguageInput(BaseModel):
    resume_text: str
    target_language: str
    preserve_formatting: bool = True

class MultiLanguageOutput(BaseModel):
    translated_resume: str
    language: str
    confidence_score: Optional[float] = None
    cultural_adaptations: List[str]  # Notes about cultural adaptations made

class ResumeAnalyticsInput(BaseModel):
    resume_text: str
    target_role: str
    application_date: Optional[str] = None

class ResumeAnalyticsOutput(BaseModel):
    ats_score: int
    keyword_density: dict
    readability_score: int
    word_count: int
    sections_completeness: dict
    improvement_potential: int
    estimated_interview_rate: Optional[float] = None

class ChatMessage(BaseModel):
    role: str  # "user" or "assistant"
    content: str

class ChatInput(BaseModel):
    messages: List[ChatMessage]
    resume_data: Optional[dict] = None
    context: Optional[str] = None

class ChatOutput(BaseModel):
    message: str
    suggestions: Optional[List[str]] = None

class JobDescriptionAnalyzerInput(BaseModel):
    resume_data: dict  # Structured resume data (ResumeData format)
    job_description: str
    job_title: Optional[str] = None
    company_name: Optional[str] = None

class JobDescriptionAnalyzerOutput(BaseModel):
    match_score: float  # 0-100
    matched_keywords: List[str]
    missing_keywords: List[str]
    skill_gaps: List[str]
    recommendations: List[str]
    tailored_resume: dict  # Tailored resume data
    improvements_made: List[str]  # List of changes made
    before_after_comparison: Optional[dict] = None
