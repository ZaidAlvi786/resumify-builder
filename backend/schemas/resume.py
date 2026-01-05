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

# New Quick Win Features

class AchievementQuantifierInput(BaseModel):
    achievement_text: str  # The vague achievement to quantify
    role_title: Optional[str] = None  # User's role title for context
    company: Optional[str] = None  # Company name for context
    target_role: Optional[str] = None  # Target role for relevance

class QuantifiedSuggestion(BaseModel):
    quantified_version: str  # The improved version with metrics
    metric_type: str  # e.g., "percentage", "number", "time", "revenue", "scale"
    suggested_metrics: List[str]  # Possible metrics to add
    explanation: str  # Why these metrics matter
    confidence: str  # "high", "medium", "low" - how confident we are in the suggestion

class AchievementQuantifierOutput(BaseModel):
    original_achievement: str
    quantified_suggestions: List[QuantifiedSuggestion]  # Multiple options
    improvement_tips: List[str]  # General tips for quantification
    example_metrics: dict  # Examples of common metrics by category

class SummaryVariationsInput(BaseModel):
    resume_data: dict  # Resume data (can be ResumeInput or ResumeOutput)
    target_role: str
    number_of_variations: int = 10
    style_preferences: Optional[List[str]] = None  # e.g., ["concise", "detailed", "achievement-focused"]

class SummaryVariation(BaseModel):
    summary_text: str
    style: str  # e.g., "achievement-focused", "experience-based", "skill-highlight"
    length: str  # "short", "medium", "long"
    word_count: int
    strengths: List[str]  # What this version emphasizes

class SummaryVariationsOutput(BaseModel):
    variations: List[SummaryVariation]
    recommended_variation: int  # Index of recommended variation
    selection_guide: dict  # Guide on when to use each style

class KeywordSynonymExpanderInput(BaseModel):
    resume_text: str
    target_role: str
    job_description: Optional[str] = None
    avoid_keyword_stuffing: bool = True

class KeywordSynonym(BaseModel):
    original_keyword: str
    synonyms: List[str]
    context: str  # When to use each synonym
    ats_impact: str = "medium"  # "high", "medium", "low" - expected ATS impact (default: medium)

class KeywordSynonymExpanderOutput(BaseModel):
    keyword_synonyms: List[KeywordSynonym]
    suggested_replacements: dict  # Original -> suggested alternatives with context
    keyword_density_analysis: dict
    recommendations: List[str]

# High-Impact Features

class MultiResumePortfolioInput(BaseModel):
    master_resume_data: dict  # ResumeInput or ResumeOutput format
    target_roles: Optional[List[str]] = None  # Specific roles to generate versions for
    industries: Optional[List[str]] = None  # Industries to adapt for
    styles: Optional[List[str]] = None  # ["technical", "executive", "creative", "academic", "ats-optimized"]
    number_of_versions: int = 5  # Default number of versions to generate

class ResumeVersion(BaseModel):
    version_id: str
    version_name: str  # e.g., "Technical Focus", "Executive Summary"
    target_role: Optional[str] = None
    industry: Optional[str] = None
    style: str  # "technical", "executive", "creative", etc.
    resume_data: dict  # Full resume output
    key_changes: List[str]  # What changed from master
    best_for: List[str]  # When to use this version

class MultiResumePortfolioOutput(BaseModel):
    master_resume: dict
    versions: List[ResumeVersion]
    usage_guide: dict  # Guide on when to use each version
    differences_summary: dict  # Summary of differences between versions

class SkillGapAnalyzerInput(BaseModel):
    resume_text: str
    target_role: str
    job_description: Optional[str] = None
    current_skills: Optional[List[str]] = None
    include_learning_paths: bool = True

class RequiredSkill(BaseModel):
    skill_name: str
    importance: str  # "critical", "important", "nice_to_have"
    category: str  # "technical", "soft", "domain", "tool"
    description: str

class LearningResource(BaseModel):
    title: str
    type: str  # "course", "certification", "book", "project", "tutorial"
    provider: Optional[str] = None
    duration: Optional[str] = None
    cost: Optional[str] = None
    url: Optional[str] = None
    description: str

class LearningPath(BaseModel):
    skill_name: str
    current_level: str  # "beginner", "intermediate", "advanced", "none"
    target_level: str
    learning_resources: List[LearningResource]
    estimated_time: str  # e.g., "2-3 months"
    difficulty: str  # "easy", "medium", "hard"
    priority: int  # 1-5, where 5 is highest priority

class SkillGapAnalyzerOutput(BaseModel):
    current_skills: List[str]
    required_skills: List[RequiredSkill]
    skill_gaps: List[str]  # Skills missing entirely
    skill_level_gaps: dict  # Skills present but at insufficient level
    learning_paths: List[LearningPath]
    skill_priority_ranking: List[str]  # Skills ranked by importance
    overall_readiness_score: int  # 0-100
    recommendations: List[str]
    timeline_estimate: str  # Estimated time to close critical gaps

# AI Career Trend Analyzer

class CareerTrendAnalyzerInput(BaseModel):
    resume_text: str
    current_role: str
    industry: Optional[str] = None
    years_of_experience: Optional[int] = None
    target_roles: Optional[List[str]] = None  # Roles user is interested in
    prediction_months: int = 12  # How many months ahead to predict

class SkillTrend(BaseModel):
    skill_name: str
    current_demand: str  # "high", "medium", "low"
    predicted_demand: str  # "increasing", "stable", "decreasing"
    demand_timeline: str  # e.g., "6-12 months"
    growth_rate: Optional[str] = None  # e.g., "+25%", "-10%"
    reason: str  # Why this trend is happening
    industry_impact: str  # How this affects the industry

class RoleTrend(BaseModel):
    role_title: str
    current_market_status: str  # "hot", "stable", "declining"
    predicted_status: str  # "growing", "stable", "declining"
    growth_indicators: List[str]  # Reasons for growth/decline
    salary_trend: Optional[str] = None  # "increasing", "stable", "decreasing"
    skill_requirements: List[str]  # Emerging skills needed
    timeline: str  # When these changes are expected

class ResumeRecommendation(BaseModel):
    recommendation_type: str  # "add_skill", "update_experience", "highlight_achievement", "remove_obsolete"
    priority: int  # 1-5, where 5 is highest
    action: str  # What to do
    reason: str  # Why this is recommended
    expected_impact: str  # How this will help

class CareerTrendAnalyzerOutput(BaseModel):
    industry: str
    analysis_date: str
    prediction_period: str  # e.g., "Next 12 months"
    skill_trends: List[SkillTrend]
    role_trends: List[RoleTrend]
    resume_recommendations: List[ResumeRecommendation]
    future_proof_score: int  # 0-100, how future-proof the resume is
    market_insights: List[str]  # General market insights
    emerging_skills: List[str]  # Skills that will be in demand
    declining_skills: List[str]  # Skills becoming less relevant
    action_plan: List[str]  # Actionable steps to future-proof career

# Real-Time Salary Negotiation Simulator

class SalaryNegotiationInput(BaseModel):
    resume_text: str
    target_role: str
    current_salary: Optional[str] = None  # e.g., "$80,000" or "80k"
    years_of_experience: Optional[int] = None
    location: Optional[str] = None
    company_name: Optional[str] = None
    job_description: Optional[str] = None
    initial_offer: Optional[str] = None  # Company's initial offer
    negotiation_scenario: Optional[str] = None  # "entry-level", "senior", "remote", "promotion", "counter-offer"

class NegotiationMessage(BaseModel):
    role: str  # "recruiter", "candidate"
    message: str
    strategy: Optional[str] = None  # Negotiation strategy being used
    timestamp: str  # Simulated timestamp

class NegotiationScript(BaseModel):
    scenario_name: str
    difficulty: str  # "easy", "medium", "hard"
    description: str
    key_points: List[str]
    suggested_responses: List[str]
    counter_offer_suggestions: List[str]

class SalaryNegotiationOutput(BaseModel):
    negotiation_conversation: List[NegotiationMessage]
    recommended_scripts: List[NegotiationScript]
    salary_benchmark: Optional[dict] = None  # Market salary data
    negotiation_tips: List[str]
    common_mistakes_to_avoid: List[str]
    power_phrases: List[str]  # Phrases that strengthen negotiation position
    scenarios_practiced: List[str]
