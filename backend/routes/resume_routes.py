# backend/routes/resume_routes.py
from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Body
from schemas.resume import (
    ResumeInput, ResumeOutput, ReviewInput, ReviewOutput,
    CoverLetterInput, CoverLetterOutput,
    InterviewQuestionsInput, InterviewQuestionsOutput,
    JobMatchInput, JobMatchOutput,
    ImproveResumeInput, ImproveResumeOutput,
    ResignationLetterInput, ResignationLetterOutput,
    RewriteBulletInput, RewriteBulletOutput,
    CareerPathInput, CareerPathOutput,
    ResumeHeatMapInput, ResumeHeatMapOutput,
    IndustryBenchmarkInput, IndustryBenchmarkOutput,
    MultiLanguageInput, MultiLanguageOutput,
    ResumeAnalyticsInput, ResumeAnalyticsOutput,
    ChatInput, ChatOutput,
    JobDescriptionAnalyzerInput, JobDescriptionAnalyzerOutput,
    AchievementQuantifierInput, AchievementQuantifierOutput,
    SummaryVariationsInput, SummaryVariationsOutput,
    KeywordSynonymExpanderInput, KeywordSynonymExpanderOutput,
    MultiResumePortfolioInput, MultiResumePortfolioOutput,
    SkillGapAnalyzerInput, SkillGapAnalyzerOutput,
    CareerTrendAnalyzerInput, CareerTrendAnalyzerOutput,
    SalaryNegotiationInput, SalaryNegotiationOutput
)
from services.ai_service import (
    generate_resume_content, review_resume_content,
    match_job_description, generate_cover_letter,
    generate_interview_questions, improve_resume_content,
    generate_resignation_letter, rewrite_bullet_point,
    predict_career_path, generate_resume_heatmap,
    benchmark_against_industry, translate_resume,
    analyze_resume_analytics, chat_with_ai_agent,
    analyze_and_tailor_resume,
    quantify_achievement, generate_summary_variations,
    expand_keyword_synonyms,     generate_multi_resume_portfolio,     analyze_skill_gaps_with_learning_paths,     analyze_career_trends, simulate_salary_negotiation
)
from services.parser_service import extract_text_from_pdf

router = APIRouter()

@router.post("/generate", response_model=ResumeOutput)
async def generate_resume(data: ResumeInput):
    """
    Generate an AI-optimized resume based on structured user input.
    """
    try:
        result = generate_resume_content(data)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/review", response_model=ReviewOutput)
async def review_resume(
    file: UploadFile = File(None),
    resume_text: str = Form(None),
    target_role: str = Form(...),
    job_description: str = Form(None)
):
    """
    Review a resume (PDF upload or text paste) against a target role.
    Optionally provide job description for enhanced matching.
    """
    text_to_review = resume_text or ""
    
    if file:
        if file.content_type != "application/pdf":
            raise HTTPException(status_code=400, detail="Only PDF files are supported.")
        try:
            text_to_review = await extract_text_from_pdf(file)
        except ValueError as e:
            raise HTTPException(status_code=400, detail=str(e))
    
    if not text_to_review:
        raise HTTPException(status_code=400, detail="Please provide either a file or text to review.")

    try:
        review_input = ReviewInput(
            resume_text=text_to_review,
            target_role=target_role,
            job_description=job_description
        )
        result = review_resume_content(review_input)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/match-job", response_model=JobMatchOutput)
async def match_job(data: JobMatchInput):
    """
    Match resume against a specific job description.
    Provides detailed keyword analysis and recommendations.
    """
    try:
        result = match_job_description(data)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/cover-letter", response_model=CoverLetterOutput)
async def create_cover_letter(data: CoverLetterInput):
    """
    Generate a personalized cover letter based on resume and job description.
    """
    try:
        result = generate_cover_letter(data)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/interview-questions", response_model=InterviewQuestionsOutput)
async def get_interview_questions(data: InterviewQuestionsInput):
    """
    Generate interview questions and suggested answers based on resume.
    """
    try:
        result = generate_interview_questions(data)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/improve", response_model=ImproveResumeOutput)
async def improve_resume(data: ImproveResumeInput):
    """
    Improve a resume by applying AI suggestions and recommendations.
    Takes the original resume and suggestions, returns an improved version.
    """
    try:
        result = improve_resume_content(data)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/extract-text")
async def extract_text_from_uploaded_pdf(file: UploadFile = File(...)):
    """
    Extract text from an uploaded PDF file.
    Used for resume improvement when user uploads a PDF.
    """
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")
    try:
        text = await extract_text_from_pdf(file)
        return text
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/resignation-letter", response_model=ResignationLetterOutput)
async def create_resignation_letter(data: ResignationLetterInput):
    """
    Generate a professional resignation letter.
    """
    try:
        result = generate_resignation_letter(data)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/rewrite-bullet", response_model=RewriteBulletOutput)
async def rewrite_bullet(data: RewriteBulletInput):
    """
    Rewrite a single bullet point to be more impactful and ATS-friendly.
    """
    try:
        result = rewrite_bullet_point(data)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/career-path", response_model=CareerPathOutput)
async def get_career_path(data: CareerPathInput):
    """
    Predicts career progression path based on resume and current role.
    Provides next steps, skill gaps, and recommended learning paths.
    """
    try:
        result = predict_career_path(data)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/heatmap", response_model=ResumeHeatMapOutput)
async def get_resume_heatmap(data: ResumeHeatMapInput):
    """
    Generates a visual heat map of resume strength by section.
    Shows which sections are strong, moderate, or weak.
    """
    try:
        result = generate_resume_heatmap(data)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/benchmark", response_model=IndustryBenchmarkOutput)
async def benchmark_resume(data: IndustryBenchmarkInput):
    """
    Compares resume against industry standards and benchmarks.
    Shows how the resume performs relative to industry averages.
    """
    try:
        result = benchmark_against_industry(data)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/translate", response_model=MultiLanguageOutput)
async def translate_resume_to_language(data: MultiLanguageInput):
    """
    Translates resume to target language with cultural adaptations.
    """
    try:
        result = translate_resume(data)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/analytics", response_model=ResumeAnalyticsOutput)
async def get_resume_analytics(data: ResumeAnalyticsInput):
    """
    Provides comprehensive analytics and metrics for the resume.
    Includes keyword density, readability, completeness, and performance predictions.
    """
    try:
        result = analyze_resume_analytics(data)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/chat", response_model=ChatOutput)
async def chat_with_agent(data: ChatInput):
    """
    Conversational AI agent for resume and job search assistance.
    Provides intelligent responses based on user queries and resume context.
    """
    try:
        result = chat_with_ai_agent(data)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/analyze-job-and-tailor", response_model=JobDescriptionAnalyzerOutput)
async def analyze_job_and_tailor_resume(data: JobDescriptionAnalyzerInput):
    """
    AI Job Description Analyzer & Auto-Tailor:
    Analyzes a job description and automatically tailors the resume to match it.
    Returns analysis metrics and a tailored version of the resume.
    """
    try:
        result = analyze_and_tailor_resume(data)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============================================
# NEW QUICK WIN FEATURES
# ============================================

@router.post("/quantify-achievement", response_model=AchievementQuantifierOutput)
async def quantify_achievement_endpoint(data: AchievementQuantifierInput):
    """
    AI Achievement Quantifier:
    Suggests ways to add metrics and quantification to vague achievements.
    Helps make achievements more impactful and measurable.
    """
    try:
        result = quantify_achievement(data)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/summary-variations", response_model=SummaryVariationsOutput)
async def get_summary_variations(data: SummaryVariationsInput):
    """
    Resume Summary Variations Generator:
    Generates multiple resume summary variations (10+ options) with different styles.
    Users can choose the best fit for their needs.
    """
    try:
        result = generate_summary_variations(data)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/expand-keywords", response_model=KeywordSynonymExpanderOutput)
async def expand_keywords(data: KeywordSynonymExpanderInput):
    """
    Keyword Synonym Expander:
    Suggests alternative keywords and synonyms to improve ATS matching
    without keyword stuffing. Helps diversify keyword usage naturally.
    """
    try:
        result = expand_keyword_synonyms(data)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============================================
# HIGH-IMPACT FEATURES
# ============================================

@router.post("/multi-resume-portfolio", response_model=MultiResumePortfolioOutput)
async def create_multi_resume_portfolio(data: MultiResumePortfolioInput):
    """
    Multi-Resume Portfolio Generator:
    Automatically creates multiple resume versions (technical, executive, creative, etc.)
    from one master resume. Maintains consistency while adapting to different needs.
    """
    try:
        result = generate_multi_resume_portfolio(data)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/analyze-skill-gaps", response_model=SkillGapAnalyzerOutput)
async def analyze_skill_gaps(data: SkillGapAnalyzerInput):
    """
    AI Skill Gap Analyzer with Learning Paths:
    Identifies skill gaps for target roles and generates personalized learning paths
    with courses, certifications, and resources. Provides actionable career development guidance.
    """
    try:
        result = analyze_skill_gaps_with_learning_paths(data)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/analyze-career-trends", response_model=CareerTrendAnalyzerOutput)
async def analyze_career_trends_endpoint(data: CareerTrendAnalyzerInput):
    """
    AI Career Trend Analyzer:
    Analyzes industry trends and predicts which skills/roles will be in demand.
    Provides proactive career guidance based on market trends and suggests resume updates.
    """
    try:
        result = analyze_career_trends(data)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/salary-negotiation", response_model=SalaryNegotiationOutput)
async def simulate_salary_negotiation_endpoint(data: SalaryNegotiationInput):
    """
    Real-Time Salary Negotiation Simulator:
    Simulates salary negotiation conversations to help users prepare.
    Generates realistic negotiation scenarios and provides practice conversations.
    """
    try:
        result = simulate_salary_negotiation(data)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
