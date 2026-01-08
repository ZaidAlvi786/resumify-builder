# backend/services/ai_service.py
import os
import json
from dotenv import load_dotenv
from openai import OpenAI
from services.ai_helpers import create_chat_completion_with_retry
from schemas.resume import (
    ResumeInput, ResumeOutput, ReviewInput, ReviewOutput,
    CoverLetterInput, CoverLetterOutput,
    InterviewQuestionsInput, InterviewQuestionsOutput, InterviewQuestion, CodeExample,
    JobMatchInput, JobMatchOutput,
    ImproveResumeInput, ImproveResumeOutput,
    ResignationLetterInput, ResignationLetterOutput,
    RewriteBulletInput, RewriteBulletOutput,
    ScoreBreakdown,
    CareerPathInput, CareerPathOutput, CareerPathStep,
    ResumeHeatMapInput, ResumeHeatMapOutput, SectionScore,
    IndustryBenchmarkInput, IndustryBenchmarkOutput, BenchmarkComparison,
    MultiLanguageInput, MultiLanguageOutput,
    ResumeAnalyticsInput, ResumeAnalyticsOutput,
    ChatInput, ChatOutput, ChatMessage,
    JobDescriptionAnalyzerInput, JobDescriptionAnalyzerOutput,
    AchievementQuantifierInput, AchievementQuantifierOutput, QuantifiedSuggestion,
    SummaryVariationsInput, SummaryVariationsOutput, SummaryVariation,
    KeywordSynonymExpanderInput, KeywordSynonymExpanderOutput, KeywordSynonym,
    MultiResumePortfolioInput, MultiResumePortfolioOutput, ResumeVersion,
    SkillGapAnalyzerInput, SkillGapAnalyzerOutput, RequiredSkill, LearningResource, LearningPath,
    CareerTrendAnalyzerInput, CareerTrendAnalyzerOutput, SkillTrend, RoleTrend, ResumeRecommendation,
    SalaryNegotiationInput, SalaryNegotiationOutput, NegotiationMessage, NegotiationScript
)

# Load environment variables
load_dotenv()

# Get API key from environment
api_key = os.getenv("OPENROUTER_API_KEY")
if not api_key:
    raise ValueError(
        "OPENROUTER_API_KEY environment variable is not set. "
        "Please create a .env file in the backend directory with your OpenRouter API key."
    )

# Initialize OpenAI client with OpenRouter configuration
client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=api_key,
)

# Using a valid OpenRouter model ID
# Free tier options: meta-llama/llama-3.2-3b-instruct:free, google/gemini-2.0-flash-exp:free (rate-limited)
# Paid options: google/gemini-pro, google/gemini-1.5-flash, openai/gpt-4o-mini, anthropic/claude-3.5-sonnet
# Default to a more reliable free model
MODEL_NAME = os.getenv("OPENROUTER_MODEL", "meta-llama/llama-3.2-3b-instruct:free")

# Define fallback models for automatic switching when rate limits are reached
# Priority order: primary model -> free tier fallbacks -> paid tier fallbacks
# Users can customize this via OPENROUTER_FALLBACK_MODELS (comma-separated) or use defaults
fallback_models_str = os.getenv("OPENROUTER_FALLBACK_MODELS", "")
if fallback_models_str:
    # User-provided fallback models
    FALLBACK_MODELS = [m.strip() for m in fallback_models_str.split(",") if m.strip()]
else:
    # Default fallback models (free tier first, then paid)
    FALLBACK_MODELS = [
        "meta-llama/llama-3.2-3b-instruct:free",
        "google/gemini-2.0-flash-exp:free",
        "google/gemini-1.5-flash",
        "google/gemini-pro",
        "openai/gpt-4o-mini",
    ]

# Remove the primary model from fallback list if it's already there to avoid duplicates
if MODEL_NAME in FALLBACK_MODELS:
    FALLBACK_MODELS.remove(MODEL_NAME)

# Build the complete model list: primary first, then fallbacks
MODEL_LIST = [MODEL_NAME] + FALLBACK_MODELS

def create_chat_completion_with_auto_fallback(
    messages: list,
    model: str = MODEL_NAME,
    max_retries: int = 3,
    retry_delay: int = 2,
    **kwargs
):
    """
    Wrapper function that automatically includes fallback models for rate limit handling.
    This ensures all AI service calls have automatic model switching capability.
    """
    return create_chat_completion_with_retry(
        client=client,
        model=model,
        messages=messages,
        max_retries=max_retries,
        retry_delay=retry_delay,
        fallback_models=FALLBACK_MODELS,
        **kwargs
    ) 

def generate_resume_content(data: ResumeInput) -> ResumeOutput:
    """
    Generates an ATS-friendly resume content using AI.
    """
    system_prompt = """
    You are an expert Resume Writer and Career Coach. Your goal is to create an ATS-optimized, 
    professional resume based on the user's input.
    
    1. SUMMARY: Write a strong, professional summary (2-3 sentences) tailored to the 'target_role'.
    2. EXPERIENCE: Rewrite the raw descriptions into 3-5 punchy bullet points using strong action verbs.
       Quantify achievements where possible (e.g., 'Improved efficiency by 20%').
       Focus on relevance to the 'target_role'.
    3. SKILLS: Organize and filter the skills to prioritize those most relevant to 'target_role'.
    
    Return the output strictly as valid JSON following the provided schema structure.
    """
    
    user_prompt = f"""
    Target Role: {data.target_role}
    User Data: {data.model_dump_json()}
    
    Format the response as a JSON object with:
    - full_name
    - contact_info (email, phone, location, linkedin, website)
    - summary
    - skills (list of strings)
    - experience (list of objects with title, company, start_date, end_date, bullet_points)
    - education (as provided)
    - projects (as provided)
    - certifications (as provided)
    """

    try:
        response = create_chat_completion_with_auto_fallback(
            model=MODEL_NAME,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            response_format={"type": "json_object"},
            temperature=0.7,
            extra_headers={
                "HTTP-Referer": "https://antigravity.dev",
                "X-Title": "AI Resume Builder",
            }
        )
        
        content = response.choices[0].message.content
        resume_data = json.loads(content)
        return ResumeOutput(**resume_data)

    except Exception as e:
        print(f"Error generating resume: {e}")
        raise

def review_resume_content(data: ReviewInput) -> ReviewOutput:
    """
    Reviews a resume against a target role and provides feedback.
    """
    # Validate input
    if not data.resume_text or len(data.resume_text.strip()) < 10:
        raise ValueError("Resume text is too short or empty. Please provide a valid resume.")
    
    if not data.target_role or len(data.target_role.strip()) < 2:
        raise ValueError("Target role is required and must be at least 2 characters.")
    system_prompt = """
    You are an expert ATS (Applicant Tracking System) Scanner and Recruiter. 
    Analyze the resume text against the target job role.
    
    You MUST return a JSON object with this EXACT structure:
    {
        "ats_score": 75,
        "strengths": ["Strong technical skills in React and Node.js", "Quantified achievements with metrics", "Clear career progression"],
        "weaknesses": ["Uses passive voice in some bullet points", "Could benefit from more industry-specific keywords", "Some sections lack quantifiable metrics"],
        "suggestions": ["Add more action verbs to bullet points", "Include more relevant keywords from job description", "Quantify achievements with specific numbers"],
        "missing_skills": ["TypeScript", "AWS", "Docker"],
        "job_match_score": 80,
        "keyword_matches": ["React", "JavaScript", "Node.js"],
        "missing_keywords": ["TypeScript", "AWS", "Microservices"],
        "detailed_scores": [
            {
                "category": "Content Quality",
                "criteria": [
                    {"name": "Action Verbs Usage", "score": 8, "max_score": 10, "feedback": "Good use of action verbs, but could be more varied", "status": "pass"},
                    {"name": "Quantifiable Metrics", "score": 6, "max_score": 10, "feedback": "Some achievements lack specific numbers", "status": "warning"},
                    {"name": "Keyword Optimization", "score": 7, "max_score": 10, "feedback": "Good keyword usage, but missing some industry terms", "status": "pass"}
                ]
            },
            {
                "category": "Formatting & Structure",
                "criteria": [
                    {"name": "Section Organization", "score": 9, "max_score": 10, "feedback": "Well-organized sections with clear hierarchy", "status": "pass"},
                    {"name": "Consistency", "score": 8, "max_score": 10, "feedback": "Consistent formatting throughout", "status": "pass"}
                ]
            }
        ]
    }
    
    Requirements:
    1. ATS Score (0-100): Calculate based on keyword matching, formatting quality, and relevance. Must be a number between 0-100.
    2. Strengths: List 3-5 specific positive aspects. Each must be a complete sentence.
    3. Weaknesses: List 3-5 areas needing improvement. Each must be a complete sentence.
    4. Suggestions: Provide 3-5 concrete, actionable recommendations. Each must be a complete sentence.
    5. Missing Skills: List key skills standard for this role but absent from resume. At least 2-3 skills.
    6. Job Match Score: If job_description provided, calculate match (0-100), else null.
    7. Keyword Matches: If job_description provided, list keywords from JD found in resume. At least 3-5 keywords.
    8. Missing Keywords: If job_description provided, list important keywords from JD not in resume. At least 3-5 keywords.
    9. Detailed Scores: Provide detailed scoring across multiple categories (Content Quality, Formatting, Keywords, Experience, Education, Skills, etc.)
       Each category should have 3-5 criteria items with scores, max scores, feedback, and status (pass/warning/fail).
    
    CRITICAL: 
    - Always return valid JSON with ALL fields populated
    - Arrays must have at least 3 items each (except missing_skills which can have 2+)
    - Never return empty arrays
    - All string values must be meaningful and specific
    - detailed_scores should cover at least 5-7 categories with 3-5 criteria each
    """
    
    jd_context = f"\n\nJob Description:\n{data.job_description}" if data.job_description else ""
    
    user_prompt = f"""
    Analyze this resume for the target role: {data.target_role}
    {jd_context}
    
    Resume Text:
    {data.resume_text}
    
    Provide a comprehensive analysis in the required JSON format with all fields populated.
    """

    try:
        response = create_chat_completion_with_auto_fallback(
            model=MODEL_NAME,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            response_format={"type": "json_object"},
            temperature=0.2,
            extra_headers={
                "HTTP-Referer": "https://antigravity.dev",
                "X-Title": "AI Resume Builder",
            }
        )
        
        content = response.choices[0].message.content
        
        if not content or len(content.strip()) == 0:
            raise ValueError("AI returned empty response")
        
        print(f"AI Response (first 500 chars): {content[:500]}...")  # Debug logging
        print(f"Full response length: {len(content)}")  # Debug logging
        
        # Try to extract JSON if wrapped in markdown code blocks
        if "```json" in content:
            content = content.split("```json")[1].split("```")[0].strip()
        elif "```" in content:
            content = content.split("```")[1].split("```")[0].strip()
        
        review_data = json.loads(content)
        print(f"Parsed JSON keys: {list(review_data.keys())}")  # Debug logging
        print(f"Sample values - ats_score: {review_data.get('ats_score')}, strengths type: {type(review_data.get('strengths'))}")
        
        # Validate and ensure all required fields exist with proper types
        # Convert string arrays to lists if needed
        def ensure_list(value, default=[]):
            if value is None:
                return default
            if isinstance(value, list):
                return value
            if isinstance(value, str):
                try:
                    parsed = json.loads(value)
                    return parsed if isinstance(parsed, list) else default
                except:
                    return [value] if value else default
            return default
        
        result = ReviewOutput(
            ats_score=int(review_data.get("ats_score", 0)) if review_data.get("ats_score") is not None else 0,
            strengths=ensure_list(review_data.get("strengths")),
            weaknesses=ensure_list(review_data.get("weaknesses")),
            suggestions=ensure_list(review_data.get("suggestions")),
            missing_skills=ensure_list(review_data.get("missing_skills")),
            job_match_score=int(review_data.get("job_match_score")) if review_data.get("job_match_score") is not None and data.job_description else None,
            keyword_matches=ensure_list(review_data.get("keyword_matches")),
            missing_keywords=ensure_list(review_data.get("missing_keywords"))
        )
        
        # If all fields are empty, this indicates the AI didn't generate proper content
        if result.ats_score == 0 and len(result.strengths) == 0 and len(result.weaknesses) == 0:
            print("WARNING: AI returned empty results. This might indicate a model issue.")
            print(f"Full response: {content}")
        
        print(f"Returning result - ats_score: {result.ats_score}, strengths: {len(result.strengths)}, weaknesses: {len(result.weaknesses)}")
        return result

    except json.JSONDecodeError as e:
        print(f"JSON decode error: {e}")
        print(f"Raw content received: {content if 'content' in locals() else 'N/A'}")
        raise ValueError(f"Failed to parse AI response as JSON: {str(e)}")
    except Exception as e:
        print(f"Error reviewing resume: {e}")
        import traceback
        traceback.print_exc()
        raise

def match_job_description(data: JobMatchInput) -> JobMatchOutput:
    """
    Matches resume against a specific job description and provides detailed analysis.
    """
    system_prompt = """
    You are an expert Recruiter and ATS System Analyst. Analyze how well the resume matches 
    the job description. Provide:
    1. Match Score (0-100): Overall compatibility
    2. Matched Keywords: Keywords from JD found in resume
    3. Missing Keywords: Important keywords from JD not in resume
    4. Recommendations: Specific actions to improve match
    5. Skill Gaps: Required skills missing from resume
    
    Return strictly as valid JSON.
    """
    
    user_prompt = f"""
    Job Description:
    {data.job_description}
    
    Resume Text:
    {data.resume_text}
    """

    try:
        response = create_chat_completion_with_auto_fallback(
            model=MODEL_NAME,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            response_format={"type": "json_object"},
            temperature=0.2,
        )
        
        content = response.choices[0].message.content
        match_data = json.loads(content)
        return JobMatchOutput(
            match_score=match_data.get("match_score", 0),
            matched_keywords=match_data.get("matched_keywords", []),
            missing_keywords=match_data.get("missing_keywords", []),
            recommendations=match_data.get("recommendations", []),
            skill_gaps=match_data.get("skill_gaps", [])
        )
    except Exception as e:
        print(f"Error matching job description: {e}")
        raise

def generate_cover_letter(data: CoverLetterInput) -> CoverLetterOutput:
    """
    Generates a personalized cover letter based on resume and job description.
    """
    system_prompt = """
    You are an expert Cover Letter Writer. Create a compelling, personalized cover letter that:
    1. Highlights relevant experience from the resume
    2. Addresses key requirements from the job description
    3. Shows genuine interest in the company/role
    4. Uses professional but engaging tone
    5. Is tailored and not generic
    
    Return the cover letter and key personalized sections as JSON.
    """
    
    user_prompt = f"""
    Applicant Name: {data.applicant_name}
    Position: {data.position}
    Company: {data.company_name}
    
    Job Description:
    {data.job_description}
    
    Resume:
    {data.resume_text}
    """

    try:
        response = create_chat_completion_with_auto_fallback(
            model=MODEL_NAME,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            response_format={"type": "json_object"},
            temperature=0.7,
        )
        
        content = response.choices[0].message.content
        letter_data = json.loads(content)
        return CoverLetterOutput(
            cover_letter=letter_data.get("cover_letter", ""),
            personalized_sections=letter_data.get("personalized_sections", {})
        )
    except Exception as e:
        print(f"Error generating cover letter: {e}")
        raise

def generate_interview_questions(data: InterviewQuestionsInput) -> InterviewQuestionsOutput:
    """
    Generates comprehensive interview questions with technical questions based on experience level
    and code examples for technical answers.
    """
    # Determine experience level from years of experience
    exp_level = "mid"
    if data.years_of_experience:
        if data.years_of_experience < 2:
            exp_level = "junior"
        elif data.years_of_experience >= 5:
            exp_level = "senior"
    
    system_prompt = f"""
    You are an expert Interview Coach and Technical Interview Specialist.
    Generate comprehensive interview questions based on the resume and experience level.
    
    For {exp_level}-level candidates, generate:
    1. Technical questions appropriate for {exp_level} level (algorithms, data structures, system design)
    2. Behavioral questions using STAR method
    3. Questions about specific experiences and projects mentioned
    4. System design questions (if senior level)
    5. Code examples and explanations for technical questions
    
    Return as JSON with this EXACT structure:
    {{
        "questions": ["question1", "question2", ...],  // Simple list for backward compatibility
        "answers": ["answer1", "answer2", ...],  // Simple list for backward compatibility
        "categories": ["Technical", "Behavioral", ...],  // Simple list for backward compatibility
        "detailed_questions": [
            {{
                "question": "Explain how you would implement a binary search tree",
                "answer": "A binary search tree is...",
                "category": "Technical",
                "difficulty": "medium",
                "experience_level": "{exp_level}",
                "code_examples": [
                    {{
                        "language": "Python",
                        "code": "class TreeNode:\\n    def __init__(self, val):\\n        self.val = val\\n        self.left = None\\n        self.right = None",
                        "explanation": "This creates a basic tree node structure",
                        "time_complexity": "O(log n) average",
                        "space_complexity": "O(n)"
                    }}
                ],
                "key_points": ["point1", "point2"],
                "follow_up_questions": ["follow-up1", "follow-up2"]
            }}
        ],
        "technical_questions_count": 5,
        "behavioral_questions_count": 3,
        "system_design_questions_count": 2
    }}
    
    IMPORTANT:
    - Include code examples for ALL technical questions (Python, JavaScript, Java, etc. based on role)
    - Technical questions should match {exp_level} level difficulty
    - Code examples should be complete, runnable, and well-commented
    - Include time/space complexity analysis for algorithms
    - For senior roles, include system design questions
    - All arrays (questions, answers, categories) must have the same length
    """
    
    jd_context = f"\nJob Description:\n{data.job_description}" if data.job_description else ""
    exp_context = f"\nYears of Experience: {data.years_of_experience} ({exp_level} level)" if data.years_of_experience else ""
    code_note = "\nIMPORTANT: Include code examples for all technical questions." if data.include_code_examples else ""
    
    user_prompt = f"""
    Target Role: {data.target_role}
    {exp_context}
    {jd_context}
    {code_note}
    
    Resume:
    {data.resume_text}
    
    Generate comprehensive interview questions:
    1. Technical questions appropriate for {exp_level} level (include code examples)
    2. Behavioral questions using STAR method
    3. System design questions (if applicable)
    4. Questions about specific projects/experiences
    
    For technical questions, provide:
    - Complete code examples in relevant languages
    - Time and space complexity analysis
    - Explanation of approach
    - Key points to cover
    - Potential follow-up questions
    """

    try:
        response = create_chat_completion_with_auto_fallback(
            model=MODEL_NAME,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            response_format={"type": "json_object"},
            temperature=0.6,
        )
        
        content = response.choices[0].message.content
        questions_data = json.loads(content)
        
        # Handle different response formats
        questions = questions_data.get("questions", [])
        answers = questions_data.get("answers", [])
        categories = questions_data.get("categories", [])
        
        # If categories is a dict, convert to list
        if isinstance(categories, dict):
            # Extract category names and create a list matching questions length
            category_list = []
            for cat_name, cat_questions in categories.items():
                # If cat_questions is a list, add the category name for each question
                if isinstance(cat_questions, list):
                    category_list.extend([cat_name] * len(cat_questions))
                else:
                    category_list.append(cat_name)
            categories = category_list
        
        # Ensure all arrays have the same length
        min_length = min(len(questions), len(answers), len(categories) if categories else len(questions))
        if min_length > 0:
            questions = questions[:min_length]
            answers = answers[:min_length]
            if categories:
                categories = categories[:min_length]
            else:
                # If no categories provided, create default ones
                categories = ["General"] * min_length
        
        # Parse detailed questions with code examples
        detailed_questions = []
        if "detailed_questions" in questions_data:
            for dq in questions_data.get("detailed_questions", []):
                code_examples = []
                if "code_examples" in dq and dq["code_examples"]:
                    for ce in dq["code_examples"]:
                        code_examples.append(CodeExample(**ce))
                
                detailed_questions.append(InterviewQuestion(
                    question=dq.get("question", ""),
                    answer=dq.get("answer", ""),
                    category=dq.get("category", "General"),
                    difficulty=dq.get("difficulty"),
                    experience_level=dq.get("experience_level"),
                    code_examples=code_examples if code_examples else None,
                    key_points=dq.get("key_points"),
                    follow_up_questions=dq.get("follow_up_questions")
                ))
        
        return InterviewQuestionsOutput(
            questions=questions,
            answers=answers,
            categories=categories,
            detailed_questions=detailed_questions if detailed_questions else None,
            technical_questions_count=questions_data.get("technical_questions_count"),
            behavioral_questions_count=questions_data.get("behavioral_questions_count"),
            system_design_questions_count=questions_data.get("system_design_questions_count")
        )
    except Exception as e:
        print(f"Error generating interview questions: {e}")
        raise

def improve_resume_content(data: ImproveResumeInput) -> ImproveResumeOutput:
    """
    Improves a resume by applying AI suggestions and recommendations.
    Takes the original resume text and applies all suggestions to create an improved version.
    """
    system_prompt = """
    You are an expert Resume Writer and Career Coach. Your task is to improve a resume by applying 
    specific suggestions and recommendations.
    
    You MUST:
    1. Keep ALL original information (names, companies, dates, achievements)
    2. Apply the provided suggestions to enhance the resume
    3. Add missing keywords naturally into the content
    4. Quantify achievements where possible
    5. Use stronger action verbs
    6. Improve formatting and structure
    7. Maintain professional tone
    8. Keep the resume length reasonable (1-2 pages)
    
    Return the improved resume as a well-formatted text document that maintains all original information
    but incorporates all the improvements.
    
    Also provide a list of specific improvements made and an estimated new ATS score.
    """
    
    suggestions_text = "\n".join([f"- {s}" for s in data.suggestions])
    missing_skills_text = ", ".join(data.missing_skills) if data.missing_skills else "None"
    missing_keywords_text = ", ".join(data.missing_keywords) if data.missing_keywords else "None"
    
    user_prompt = f"""
    Target Role: {data.target_role}
    
    Original Resume:
    {data.resume_text}
    
    Strengths to Maintain:
    {chr(10).join([f"- {s}" for s in data.strengths])}
    
    Weaknesses to Address:
    {chr(10).join([f"- {w}" for w in data.weaknesses])}
    
    Specific Suggestions to Apply:
    {suggestions_text}
    
    Missing Skills to Incorporate (if relevant):
    {missing_skills_text}
    
    Missing Keywords to Add Naturally:
    {missing_keywords_text}
    
    {f"Job Description Context:{chr(10)}{data.job_description}" if data.job_description else ""}
    
    Please provide:
    1. The improved resume text (complete, formatted resume)
    2. A list of specific improvements made (e.g., "Added quantifiable metrics to 3 bullet points", "Incorporated TypeScript and Kubernetes keywords")
    3. An estimated new ATS score (0-100)
    
    Return as JSON with:
    {{
        "improved_resume_text": "<complete improved resume text>",
        "improvements_made": ["improvement 1", "improvement 2", ...],
        "estimated_new_ats_score": 85
    }}
    """
    
    try:
        response = create_chat_completion_with_auto_fallback(
            model=MODEL_NAME,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            response_format={"type": "json_object"},
            temperature=0.6,
            extra_headers={
                "HTTP-Referer": "https://antigravity.dev",
                "X-Title": "AI Resume Builder",
            }
        )
        
        content = response.choices[0].message.content
        
        # Try to parse JSON, with fallback for markdown code blocks
        try:
            improved_data = json.loads(content)
        except json.JSONDecodeError:
            import re
            match = re.search(r"```json\n(.*?)```", content, re.DOTALL)
            if match:
                json_string = match.group(1)
                improved_data = json.loads(json_string)
            else:
                # If no JSON found, use the content as improved text
                improved_data = {
                    "improved_resume_text": content,
                    "improvements_made": ["Applied all suggestions to improve resume"],
                    "estimated_new_ats_score": None
                }
        
        return ImproveResumeOutput(
            improved_resume_text=improved_data.get("improved_resume_text", ""),
            improvements_made=improved_data.get("improvements_made", []),
            estimated_new_ats_score=improved_data.get("estimated_new_ats_score")
        )
    except Exception as e:
        print(f"Error improving resume: {e}")
        raise

def generate_resignation_letter(data: ResignationLetterInput) -> ResignationLetterOutput:
    """
    Generates a professional resignation letter.
    """
    system_prompt = """
    You are an expert HR and Career Coach. Create a professional resignation letter that:
    1. Is respectful and maintains positive relationships
    2. Clearly states the resignation and last working day
    3. Expresses gratitude for the opportunity
    4. Offers to help with the transition
    5. Matches the requested tone (professional, friendly, or formal)
    
    Return the resignation letter and key sections as JSON.
    """
    
    tone_instruction = f"Use a {data.tone} tone throughout the letter."
    reason_context = f"\nReason for leaving: {data.reason}" if data.reason else ""
    
    user_prompt = f"""
    Employee Name: {data.employee_name}
    Company Name: {data.company_name}
    Position: {data.position}
    Last Working Day: {data.last_working_day}
    {reason_context}
    
    {tone_instruction}
    
    Create a professional resignation letter that maintains a positive relationship with the employer.
    """
    
    try:
        response = create_chat_completion_with_auto_fallback(
            model=MODEL_NAME,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            response_format={"type": "json_object"},
            temperature=0.7,
            extra_headers={
                "HTTP-Referer": "https://antigravity.dev",
                "X-Title": "AI Resume Builder",
            }
        )
        
        content = response.choices[0].message.content
        letter_data = json.loads(content)
        return ResignationLetterOutput(
            resignation_letter=letter_data.get("resignation_letter", ""),
            personalized_sections=letter_data.get("personalized_sections", {})
        )
    except Exception as e:
        print(f"Error generating resignation letter: {e}")
        raise

def rewrite_bullet_point(data: RewriteBulletInput) -> RewriteBulletOutput:
    """
    Rewrites a single bullet point to be more impactful and ATS-friendly.
    Uses real-world best practices and quantifies achievements.
    """
    system_prompt = """
    You are an expert Resume Writer. Rewrite bullet points to be more impactful by:
    1. Using strong action verbs
    2. Quantifying achievements with specific numbers, percentages, or metrics
    3. Highlighting results and impact
    4. Making it relevant to the target role
    5. Ensuring ATS-friendly language
    
    Return the improved bullet point, list of improvements made, and keywords added.
    """
    
    context_text = f"\nContext: {data.context}" if data.context else ""
    
    user_prompt = f"""
    Target Role: {data.target_role}
    {context_text}
    
    Original Bullet Point:
    {data.original_bullet}
    
    Rewrite this bullet point to be more impactful, quantified, and ATS-optimized.
    Make it specific, measurable, and relevant to the target role.
    
    Return as JSON with:
    {{
        "improved_bullet": "<rewritten bullet point>",
        "improvements_made": ["improvement 1", "improvement 2", ...],
        "keywords_added": ["keyword1", "keyword2", ...]
    }}
    """
    
    try:
        response = create_chat_completion_with_auto_fallback(
            model=MODEL_NAME,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            response_format={"type": "json_object"},
            temperature=0.6,
            extra_headers={
                "HTTP-Referer": "https://antigravity.dev",
                "X-Title": "AI Resume Builder",
            }
        )
        
        content = response.choices[0].message.content
        
        # Try to parse JSON, with fallback
        try:
            bullet_data = json.loads(content)
        except json.JSONDecodeError:
            import re
            match = re.search(r"```json\n(.*?)```", content, re.DOTALL)
            if match:
                json_string = match.group(1)
                bullet_data = json.loads(json_string)
            else:
                bullet_data = {
                    "improved_bullet": content,
                    "improvements_made": ["Enhanced with action verbs and metrics"],
                    "keywords_added": []
                }
        
        return RewriteBulletOutput(
            improved_bullet=bullet_data.get("improved_bullet", ""),
            improvements_made=bullet_data.get("improvements_made", []),
            keywords_added=bullet_data.get("keywords_added", [])
        )
    except Exception as e:
        print(f"Error rewriting bullet point: {e}")
        raise

def predict_career_path(data: CareerPathInput) -> CareerPathOutput:
    """
    Predicts career progression path based on resume and current role.
    Provides next steps, skill gaps, and recommended learning paths.
    """
    system_prompt = """
    You are an expert Career Coach and Industry Analyst. Analyze the resume and predict 
    the career progression path. Provide:
    1. Current career level assessment
    2. Next 3-5 career steps with realistic timelines
    3. Required skills for each step
    4. Skill gaps to address
    5. Recommended courses/certifications
    6. Overall career trajectory description
    
    Return as JSON with detailed career path information.
    """
    
    exp_context = f"\nYears of Experience: {data.years_of_experience}" if data.years_of_experience else ""
    
    user_prompt = f"""
    Current Role: {data.current_role}
    {exp_context}
    
    Resume:
    {data.resume_text}
    
    Analyze and predict the career progression path. Provide realistic next steps with 
    timelines, required skills, and actionable recommendations.
    
    Return as JSON with:
    {{
        "current_level": "<assessed career level>",
        "next_steps": [
            {{
                "role_title": "<next role>",
                "timeline": "<timeframe>",
                "required_skills": ["skill1", "skill2"],
                "description": "<description>",
                "salary_range": "<optional salary range>"
            }}
        ],
        "skill_gaps": ["gap1", "gap2"],
        "recommended_courses": ["course1", "course2"],
        "career_trajectory": "<overall trajectory description>"
    }}
    """
    
    try:
        response = create_chat_completion_with_auto_fallback(
            model=MODEL_NAME,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            response_format={"type": "json_object"},
            temperature=0.7,
            extra_headers={
                "HTTP-Referer": "https://antigravity.dev",
                "X-Title": "AI Resume Builder",
            }
        )
        
        content = response.choices[0].message.content
        path_data = json.loads(content)
        
        next_steps = [
            CareerPathStep(**step) for step in path_data.get("next_steps", [])
        ]
        
        return CareerPathOutput(
            current_level=path_data.get("current_level", ""),
            next_steps=next_steps,
            skill_gaps=path_data.get("skill_gaps", []),
            recommended_courses=path_data.get("recommended_courses", []),
            career_trajectory=path_data.get("career_trajectory", "")
        )
    except Exception as e:
        print(f"Error predicting career path: {e}")
        raise

def generate_resume_heatmap(data: ResumeHeatMapInput) -> ResumeHeatMapOutput:
    """
    Generates a visual heat map of resume strength by section.
    Shows which sections are strong, moderate, or weak.
    """
    system_prompt = """
    You are an expert Resume Analyst. Analyze the resume and provide section-by-section 
    scoring for a heat map visualization. Evaluate each section (Summary, Experience, 
    Education, Skills, etc.) and provide:
    1. Score (0-100) for each section
    2. Strength level (strong/moderate/weak)
    3. Feedback for each section
    4. Keywords found and missing
    5. Overall score
    
    Return as JSON with detailed section analysis.
    """
    
    user_prompt = f"""
    Target Role: {data.target_role}
    
    Resume:
    {data.resume_text}
    
    Analyze each section of the resume and provide scores, feedback, and keyword analysis.
    
    Return as JSON with:
    {{
        "overall_score": 75,
        "section_scores": [
            {{
                "section_name": "Summary",
                "score": 80,
                "strength_level": "strong",
                "feedback": "<feedback>",
                "keywords_found": ["keyword1"],
                "keywords_missing": ["keyword2"]
            }}
        ],
        "heat_map_data": {{"section1": 80, "section2": 65}}
    }}
    """
    
    try:
        response = create_chat_completion_with_auto_fallback(
            model=MODEL_NAME,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            response_format={"type": "json_object"},
            temperature=0.3,
            extra_headers={
                "HTTP-Referer": "https://antigravity.dev",
                "X-Title": "AI Resume Builder",
            }
        )
        
        content = response.choices[0].message.content
        heatmap_data = json.loads(content)
        
        section_scores = [
            SectionScore(**section) for section in heatmap_data.get("section_scores", [])
        ]
        
        return ResumeHeatMapOutput(
            overall_score=heatmap_data.get("overall_score", 0),
            section_scores=section_scores,
            heat_map_data=heatmap_data.get("heat_map_data", {})
        )
    except Exception as e:
        print(f"Error generating resume heatmap: {e}")
        raise

def benchmark_against_industry(data: IndustryBenchmarkInput) -> IndustryBenchmarkOutput:
    """
    Compares resume against industry standards and benchmarks.
    Shows how the resume performs relative to industry averages.
    """
    system_prompt = """
    You are an expert Industry Analyst and Recruiter. Compare the resume against industry 
    benchmarks for the specified industry and role. Provide:
    1. Comparison metrics (ATS score, keyword density, experience level, etc.)
    2. Percentile rankings
    3. Industry-specific recommendations
    4. Industry insights and trends
    
    Return as JSON with benchmark comparisons and insights.
    """
    
    user_prompt = f"""
    Industry: {data.industry}
    Target Role: {data.target_role}
    
    Resume:
    {data.resume_text}
    
    Compare this resume against industry benchmarks. Provide percentile rankings and 
    industry-specific recommendations.
    
    Return as JSON with:
    {{
        "industry": "{data.industry}",
        "comparisons": [
            {{
                "metric": "ATS Score",
                "your_score": 75,
                "industry_average": 68,
                "percentile": 75,
                "status": "above_average"
            }}
        ],
        "recommendations": ["rec1", "rec2"],
        "industry_insights": ["insight1", "insight2"]
    }}
    """
    
    try:
        response = create_chat_completion_with_auto_fallback(
            model=MODEL_NAME,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            response_format={"type": "json_object"},
            temperature=0.4,
            extra_headers={
                "HTTP-Referer": "https://antigravity.dev",
                "X-Title": "AI Resume Builder",
            }
        )
        
        content = response.choices[0].message.content
        benchmark_data = json.loads(content)
        
        comparisons = [
            BenchmarkComparison(**comp) for comp in benchmark_data.get("comparisons", [])
        ]
        
        return IndustryBenchmarkOutput(
            industry=benchmark_data.get("industry", data.industry),
            comparisons=comparisons,
            recommendations=benchmark_data.get("recommendations", []),
            industry_insights=benchmark_data.get("industry_insights", [])
        )
    except Exception as e:
        print(f"Error benchmarking against industry: {e}")
        raise

def translate_resume(data: MultiLanguageInput) -> MultiLanguageOutput:
    """
    Translates resume to target language with cultural adaptations.
    """
    system_prompt = """
    You are an expert Translator and Cultural Adaptation Specialist. Translate the resume 
    to the target language while:
    1. Maintaining professional tone and formatting
    2. Adapting culturally (date formats, honorifics, etc.)
    3. Preserving technical terms appropriately
    4. Ensuring ATS compatibility in the target language
    
    Return the translated resume and notes about cultural adaptations.
    """
    
    user_prompt = f"""
    Target Language: {data.target_language}
    Preserve Formatting: {data.preserve_formatting}
    
    Resume:
    {data.resume_text}
    
    Translate this resume to {data.target_language}. Maintain professional formatting and 
    make appropriate cultural adaptations.
    
    Return as JSON with:
    {{
        "translated_resume": "<translated text>",
        "language": "{data.target_language}",
        "confidence_score": 0.95,
        "cultural_adaptations": ["adaptation1", "adaptation2"]
    }}
    """
    
    try:
        response = create_chat_completion_with_auto_fallback(
            model=MODEL_NAME,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            response_format={"type": "json_object"},
            temperature=0.3,
            extra_headers={
                "HTTP-Referer": "https://antigravity.dev",
                "X-Title": "AI Resume Builder",
            }
        )
        
        content = response.choices[0].message.content
        translation_data = json.loads(content)
        
        return MultiLanguageOutput(
            translated_resume=translation_data.get("translated_resume", ""),
            language=translation_data.get("language", data.target_language),
            confidence_score=translation_data.get("confidence_score"),
            cultural_adaptations=translation_data.get("cultural_adaptations", [])
        )
    except Exception as e:
        print(f"Error translating resume: {e}")
        raise

def analyze_resume_analytics(data: ResumeAnalyticsInput) -> ResumeAnalyticsOutput:
    """
    Provides comprehensive analytics and metrics for the resume.
    Includes keyword density, readability, completeness, and performance predictions.
    """
    system_prompt = """
    You are an expert Resume Analytics Specialist. Analyze the resume and provide 
    comprehensive metrics including:
    1. ATS score
    2. Keyword density analysis
    3. Readability score
    4. Word count
    5. Section completeness
    6. Improvement potential
    7. Estimated interview rate
    
    Return as JSON with detailed analytics.
    """
    
    user_prompt = f"""
    Target Role: {data.target_role}
    
    Resume:
    {data.resume_text}
    
    Provide comprehensive analytics for this resume including keyword density, readability, 
    completeness scores, and performance predictions.
    
    Return as JSON with:
    {{
        "ats_score": 75,
        "keyword_density": {{"keyword1": 2.5, "keyword2": 1.8}},
        "readability_score": 65,
        "word_count": 450,
        "sections_completeness": {{"summary": 90, "experience": 85}},
        "improvement_potential": 25,
        "estimated_interview_rate": 0.15
    }}
    """
    
    try:
        response = create_chat_completion_with_auto_fallback(
            model=MODEL_NAME,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            response_format={"type": "json_object"},
            temperature=0.2,
            extra_headers={
                "HTTP-Referer": "https://antigravity.dev",
                "X-Title": "AI Resume Builder",
            }
        )
        
        content = response.choices[0].message.content
        analytics_data = json.loads(content)
        
        return ResumeAnalyticsOutput(
            ats_score=analytics_data.get("ats_score", 0),
            keyword_density=analytics_data.get("keyword_density", {}),
            readability_score=analytics_data.get("readability_score", 0),
            word_count=analytics_data.get("word_count", 0),
            sections_completeness=analytics_data.get("sections_completeness", {}),
            improvement_potential=analytics_data.get("improvement_potential", 0),
            estimated_interview_rate=analytics_data.get("estimated_interview_rate")
        )
    except Exception as e:
        print(f"Error analyzing resume analytics: {e}")
        raise

def chat_with_ai_agent(data: ChatInput) -> ChatOutput:
    """
    Conversational AI agent for resume and job search assistance.
    Provides intelligent responses based on user queries and resume context.
    """
    system_prompt = """You are an expert AI Resume Agent and Career Coach. Your role is to help users with:
1. Resume building and optimization
2. ATS score improvement
3. Job targeting and matching
4. Career advice and guidance
5. Interview preparation
6. Cover letter writing
7. Skill gap analysis

Be helpful, professional, and provide actionable advice. When users ask about their resume, analyze the provided resume data if available.
Always provide specific, actionable recommendations. If the user asks about improving their score, suggest specific improvements.
If they want to target a job, help them identify keywords and skills to add.
If they want to find jobs, provide guidance on job search strategies and platforms.

Keep responses concise but informative. Use bullet points for lists of recommendations."""
    
    # Build context from resume data if available
    context_parts = []
    if data.resume_data:
        resume_context = f"""
User's Resume Context:
- Name: {data.resume_data.get('full_name', 'Not provided')}
- Target Role: {data.resume_data.get('target_role', 'Not specified')}
- Skills: {', '.join(data.resume_data.get('skills', []))}
- Experience: {len(data.resume_data.get('experience', []))} positions
"""
        context_parts.append(resume_context)
    
    if data.context:
        context_parts.append(f"Additional Context: {data.context}")
    
    context_text = "\n".join(context_parts)
    
    # Convert messages to OpenAI format
    messages = [
        {"role": "system", "content": system_prompt + (f"\n\n{context_text}" if context_text else "")}
    ]
    
    # Add conversation history
    for msg in data.messages:
        messages.append({
            "role": msg.role,
            "content": msg.content
        })
    
    try:
        response = create_chat_completion_with_auto_fallback(
            model=MODEL_NAME,
            messages=messages,
            temperature=0.7,
            extra_headers={
                "HTTP-Referer": "https://antigravity.dev",
                "X-Title": "AI Resume Builder",
            }
        )
        
        assistant_message = response.choices[0].message.content
        
        # Extract suggestions if the response contains actionable items
        suggestions = []
        if "suggest" in assistant_message.lower() or "recommend" in assistant_message.lower():
            # Try to extract bullet points or numbered items
            lines = assistant_message.split('\n')
            for line in lines:
                if line.strip().startswith(('-', '•', '*', '1.', '2.', '3.')):
                    suggestions.append(line.strip().lstrip('-•*1234567890. '))
        
        return ChatOutput(
            message=assistant_message,
            suggestions=suggestions[:5] if suggestions else None
        )
    except Exception as e:
        print(f"Error in AI chat: {e}")
        raise

def analyze_and_tailor_resume(data: JobDescriptionAnalyzerInput) -> JobDescriptionAnalyzerOutput:
    """
    Analyzes a job description and automatically tailors the resume to match it.
    This is the core feature for AI Job Description Analyzer & Auto-Tailor.
    """
    system_prompt = """
    You are an expert Resume Tailoring Specialist. Your job is to analyze a job description
    and automatically tailor a resume to match it perfectly while maintaining authenticity.
    
    Analyze the job description and resume, then:
    1. Calculate match score (0-100)
    2. Identify matched keywords from JD found in resume
    3. Identify missing keywords from JD that should be added
    4. Identify skill gaps
    5. Provide recommendations
    6. Generate a TAILORED version of the resume that:
       - Adds missing keywords naturally
       - Rewrites bullet points to emphasize relevant skills
       - Highlights matching experiences
       - Optimizes summary/target role
       - Maintains truthfulness (don't add false information)
    
    Return as JSON with this structure:
    {
        "match_score": 75.5,
        "matched_keywords": ["React", "TypeScript", "Node.js"],
        "missing_keywords": ["AWS", "Docker", "Kubernetes"],
        "skill_gaps": ["Cloud infrastructure", "Containerization"],
        "recommendations": ["Add AWS experience", "Highlight any container experience"],
        "tailored_resume": { /* Complete resume data structure with tailored content */ },
        "improvements_made": ["Added AWS keywords to summary", "Rewrote experience bullets to emphasize cloud experience"],
        "before_after_comparison": {
            "summary": {"before": "...", "after": "..."},
            "experience": [{"before": "...", "after": "..."}]
        }
    }
    
    IMPORTANT: 
    - Keep all original information, just reframe it
    - Don't add false experiences or skills
    - Make changes natural and professional
    - Focus on keyword optimization and relevance
    - Maintain the resume structure
    """
    
    resume_json = json.dumps(data.resume_data, indent=2)
    job_context = f"Job Title: {data.job_title}\nCompany: {data.company_name}\n" if data.job_title or data.company_name else ""
    
    user_prompt = f"""
    Job Description:
    {data.job_description}
    
    {job_context}
    Current Resume Data (JSON):
    {resume_json}
    
    Analyze this job description and tailor the resume to match it. Return the complete
    tailored resume data along with analysis metrics.
    """
    
    try:
        response = create_chat_completion_with_auto_fallback(
            model=MODEL_NAME,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            response_format={"type": "json_object"},
            temperature=0.3,
            extra_headers={
                "HTTP-Referer": "https://antigravity.dev",
                "X-Title": "AI Resume Builder",
            }
        )
        
        content = response.choices[0].message.content
        
        # Try to extract JSON if wrapped in markdown code blocks
        if "```json" in content:
            content = content.split("```json")[1].split("```")[0].strip()
        elif "```" in content:
            content = content.split("```")[1].split("```")[0].strip()
        
        result_data = json.loads(content)
        
        return JobDescriptionAnalyzerOutput(
            match_score=float(result_data.get("match_score", 0)),
            matched_keywords=result_data.get("matched_keywords", []),
            missing_keywords=result_data.get("missing_keywords", []),
            skill_gaps=result_data.get("skill_gaps", []),
            recommendations=result_data.get("recommendations", []),
            tailored_resume=result_data.get("tailored_resume", data.resume_data),
            improvements_made=result_data.get("improvements_made", []),
            before_after_comparison=result_data.get("before_after_comparison")
        )
    except Exception as e:
        print(f"Error analyzing and tailoring resume: {e}")
        import traceback
        traceback.print_exc()
        raise

# ============================================
# NEW QUICK WIN FEATURES
# ============================================

def quantify_achievement(data: AchievementQuantifierInput) -> AchievementQuantifierOutput:
    """
    AI suggests ways to add metrics and quantification to vague achievements.
    Helps users make their achievements more impactful and measurable.
    """
    system_prompt = """
    You are an expert Resume Writer specialized in quantifying achievements.
    Your goal is to help users add measurable metrics to vague achievements.
    
    Analyze the achievement and suggest:
    1. Multiple quantified versions (3-5 options)
    2. Different types of metrics (percentage, numbers, time, revenue, scale, etc.)
    3. Context-specific suggestions based on role/industry
    4. Explanation of why metrics matter
    
    Return JSON with:
    {
        "quantified_suggestions": [
            {
                "quantified_version": "Improved team productivity by 25% through process automation",
                "metric_type": "percentage",
                "suggested_metrics": ["25%", "30%", "20-30% range"],
                "explanation": "Percentage improvements show clear impact and are easy for recruiters to understand",
                "confidence": "high"
            }
        ],
        "improvement_tips": ["tip1", "tip2"],
        "example_metrics": {
            "percentage": ["15%", "25%", "50%", "2x"],
            "numbers": ["100+ users", "5 team members", "$50K"],
            "time": ["30% faster", "2 weeks", "50% reduction"],
            "revenue": ["$100K", "$1M", "50% increase"],
            "scale": ["5x", "10x", "doubled"]
        }
    }
    """
    
    context_parts = []
    if data.role_title:
        context_parts.append(f"Role: {data.role_title}")
    if data.company:
        context_parts.append(f"Company: {data.company}")
    if data.target_role:
        context_parts.append(f"Target Role: {data.target_role}")
    
    context_text = "\n".join(context_parts) if context_parts else "General context"
    
    user_prompt = f"""
    Achievement to Quantify:
    {data.achievement_text}
    
    Context:
    {context_text}
    
    Provide 3-5 different quantified versions with various metric types.
    Be creative but realistic - suggest metrics that make sense for the achievement type.
    Include explanations and confidence levels for each suggestion.
    """
    
    try:
        response = create_chat_completion_with_auto_fallback(
            model=MODEL_NAME,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            response_format={"type": "json_object"},
            temperature=0.7,
            extra_headers={
                "HTTP-Referer": "https://antigravity.dev",
                "X-Title": "AI Resume Builder",
            }
        )
        
        content = response.choices[0].message.content
        result_data = json.loads(content)
        
        suggestions = [
            QuantifiedSuggestion(**s) for s in result_data.get("quantified_suggestions", [])
        ]
        
        return AchievementQuantifierOutput(
            original_achievement=data.achievement_text,
            quantified_suggestions=suggestions,
            improvement_tips=result_data.get("improvement_tips", []),
            example_metrics=result_data.get("example_metrics", {})
        )
    except Exception as e:
        print(f"Error quantifying achievement: {e}")
        raise

def generate_summary_variations(data: SummaryVariationsInput) -> SummaryVariationsOutput:
    """
    Generates multiple resume summary variations (10+ options) with different styles.
    Users can choose the best fit for their needs.
    """
    system_prompt = """
    You are an expert Resume Writer. Generate multiple professional summary variations.
    
    Create diverse summaries with different:
    - Styles: achievement-focused, experience-based, skill-highlight, balanced
    - Lengths: short (2-3 sentences), medium (3-4 sentences), long (4-5 sentences)
    - Approaches: quantitative, qualitative, hybrid
    
    Return JSON with:
    {
        "variations": [
            {
                "summary_text": "Full summary text here...",
                "style": "achievement-focused",
                "length": "medium",
                "word_count": 75,
                "strengths": ["Emphasizes quantifiable results", "ATS-optimized"]
            }
        ],
        "recommended_variation": 0,
        "selection_guide": {
            "achievement-focused": "Use for roles emphasizing results",
            "experience-based": "Use for career transitions",
            "skill-highlight": "Use for technical roles"
        }
    }
    
    Generate at least 10 variations covering different styles and approaches.
    """
    
    resume_json = json.dumps(data.resume_data, indent=2)
    style_prefs = ", ".join(data.style_preferences) if data.style_preferences else "diverse styles"
    
    user_prompt = f"""
    Target Role: {data.target_role}
    Number of Variations Needed: {data.number_of_variations}
    Style Preferences: {style_prefs}
    
    Resume Data:
    {resume_json}
    
    Generate {data.number_of_variations} unique, professional summary variations.
    Ensure variety in style, length, and approach.
    Make each one compelling and ATS-optimized.
    """
    
    try:
        response = create_chat_completion_with_auto_fallback(
            model=MODEL_NAME,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            response_format={"type": "json_object"},
            temperature=0.8,  # Higher temperature for more variety
            extra_headers={
                "HTTP-Referer": "https://antigravity.dev",
                "X-Title": "AI Resume Builder",
            }
        )
        
        content = response.choices[0].message.content
        result_data = json.loads(content)
        
        variations = [
            SummaryVariation(**v) for v in result_data.get("variations", [])
        ]
        
        return SummaryVariationsOutput(
            variations=variations,
            recommended_variation=result_data.get("recommended_variation", 0),
            selection_guide=result_data.get("selection_guide", {})
        )
    except Exception as e:
        print(f"Error generating summary variations: {e}")
        raise

def expand_keyword_synonyms(data: KeywordSynonymExpanderInput) -> KeywordSynonymExpanderOutput:
    """
    Suggests alternative keywords and synonyms to improve ATS matching
    without keyword stuffing. Helps diversify keyword usage naturally.
    """
    system_prompt = """
    You are an expert ATS (Applicant Tracking System) optimizer.
    Your goal is to suggest keyword synonyms and alternatives that improve ATS matching
    while maintaining natural, readable resume text.
    
    Analyze the resume and job description (if provided) to:
    1. Identify important keywords
    2. Suggest relevant synonyms and alternative phrasings
    3. Provide context for when to use each synonym
    4. Avoid keyword stuffing - suggest natural integration
    
    Return JSON with:
    {
        "keyword_synonyms": [
            {
                "original_keyword": "manage",
                "synonyms": ["oversee", "lead", "coordinate", "direct", "supervise"],
                "context": "Use 'oversee' for strategic roles, 'coordinate' for cross-functional work",
                "ats_impact": "high"
            }
        ],
        "suggested_replacements": {
            "manage": ["oversee", "lead"],
            "create": ["develop", "build", "design"]
        },
        "keyword_density_analysis": {
            "overused_keywords": ["keyword1", "keyword2"],
            "underused_keywords": ["keyword3"],
            "optimal_density": "good" or "too_high" or "too_low"
        },
        "recommendations": ["rec1", "rec2"]
    }
    """
    
    jd_text = f"\n\nJob Description:\n{data.job_description}" if data.job_description else ""
    stuffing_note = "Avoid keyword stuffing - suggest natural alternatives" if data.avoid_keyword_stuffing else ""
    
    user_prompt = f"""
    Resume Text:
    {data.resume_text}
    {jd_text}
    
    Target Role: {data.target_role}
    
    {stuffing_note}
    
    Analyze keywords and suggest:
    1. Synonyms for overused keywords
    2. Alternative phrasings that are ATS-friendly
    3. Missing keywords from job description (if provided)
    4. Natural ways to integrate keywords
    
    Focus on keywords that will improve ATS matching while keeping text natural.
    """
    
    try:
        response = create_chat_completion_with_auto_fallback(
            model=MODEL_NAME,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            response_format={"type": "json_object"},
            temperature=0.6,
            extra_headers={
                "HTTP-Referer": "https://antigravity.dev",
                "X-Title": "AI Resume Builder",
            }
        )
        
        content = response.choices[0].message.content
        result_data = json.loads(content)
        
        # Ensure ats_impact is present for each keyword synonym
        keyword_synonyms_data = result_data.get("keyword_synonyms", [])
        for ks in keyword_synonyms_data:
            if "ats_impact" not in ks:
                ks["ats_impact"] = "medium"  # Default to medium if not provided
        
        keyword_synonyms = [
            KeywordSynonym(**ks) for ks in keyword_synonyms_data
        ]
        
        return KeywordSynonymExpanderOutput(
            keyword_synonyms=keyword_synonyms,
            suggested_replacements=result_data.get("suggested_replacements", {}),
            keyword_density_analysis=result_data.get("keyword_density_analysis", {}),
            recommendations=result_data.get("recommendations", [])
        )
    except Exception as e:
        print(f"Error expanding keyword synonyms: {e}")
        raise

# ============================================
# HIGH-IMPACT FEATURES
# ============================================

def generate_multi_resume_portfolio(data: MultiResumePortfolioInput) -> MultiResumePortfolioOutput:
    """
    Automatically creates multiple resume versions (technical, executive, creative, etc.)
    from one master resume. Maintains consistency while adapting to different needs.
    """
    system_prompt = """
    You are an expert Resume Writer specialized in creating multiple resume variations.
    
    Your task is to generate different versions of a resume, each optimized for:
    - Different roles (technical, executive, creative, academic)
    - Different industries
    - Different styles (ATS-optimized, visual, narrative)
    - Different contexts (full detail, executive summary, creative portfolio)
    
    For each version:
    1. Maintain core information and consistency
    2. Adapt style, emphasis, and content organization
    3. Highlight relevant aspects for that version type
    4. Adjust tone and format appropriately
    5. Track what changed from the master resume
    
    Return JSON with:
    {
        "versions": [
            {
                "version_id": "tech-001",
                "version_name": "Technical Focus",
                "target_role": "Software Engineer",
                "industry": "Technology",
                "style": "technical",
                "resume_data": { /* full resume structure */ },
                "key_changes": ["Emphasized technical skills section", "Added project details", "Focused on technical achievements"],
                "best_for": ["Technical roles", "Software development positions", "ATS systems"]
            }
        ],
        "usage_guide": {
            "technical": "Use for technical roles, engineering positions",
            "executive": "Use for leadership roles, C-suite positions"
        },
        "differences_summary": {
            "summary": "Differences between versions...",
            "common_elements": ["All versions maintain core experience", "Contact info consistent"],
            "unique_elements": {"technical": ["Extended project section"], "executive": ["Leadership metrics"]}
        }
    }
    """
    
    # Build context for variations needed
    roles_text = f"\nTarget Roles: {', '.join(data.target_roles)}" if data.target_roles else ""
    industries_text = f"\nIndustries: {', '.join(data.industries)}" if data.industries else ""
    styles_text = f"\nRequested Styles: {', '.join(data.styles)}" if data.styles else ""
    
    # Default styles if none specified
    default_styles = data.styles if data.styles else [
        "technical", "executive", "creative", "ats-optimized", "achievement-focused"
    ]
    
    user_prompt = f"""
    Master Resume Data:
    {json.dumps(data.master_resume_data, indent=2)}
    
    Generate {data.number_of_versions} different resume versions.
    {roles_text}
    {industries_text}
    {styles_text}
    
    Styles to include: {', '.join(default_styles[:data.number_of_versions])}
    
    Requirements:
    1. Maintain consistency in factual information (dates, companies, roles)
    2. Adapt style, emphasis, and organization for each version type
    3. Each version should be complete and ready to use
    4. Clearly document what makes each version unique
    5. Ensure all versions are professional and ATS-friendly where appropriate
    
    Generate diverse versions that serve different purposes in the job search process.
    """
    
    try:
        response = create_chat_completion_with_auto_fallback(
            model=MODEL_NAME,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            response_format={"type": "json_object"},
            temperature=0.7,
            extra_headers={
                "HTTP-Referer": "https://antigravity.dev",
                "X-Title": "AI Resume Builder",
            }
        )
        
        content = response.choices[0].message.content
        result_data = json.loads(content)
        
        versions = [
            ResumeVersion(**v) for v in result_data.get("versions", [])
        ]
        
        return MultiResumePortfolioOutput(
            master_resume=data.master_resume_data,
            versions=versions,
            usage_guide=result_data.get("usage_guide", {}),
            differences_summary=result_data.get("differences_summary", {})
        )
    except Exception as e:
        print(f"Error generating multi-resume portfolio: {e}")
        raise

def analyze_skill_gaps_with_learning_paths(data: SkillGapAnalyzerInput) -> SkillGapAnalyzerOutput:
    """
    Identifies skill gaps for target roles and generates personalized learning paths
    with courses, certifications, and resources. Provides actionable career development guidance.
    """
    system_prompt = """
    You are an expert Career Development Advisor and Skills Analyst.
    Your goal is to analyze skill gaps and provide actionable learning paths.
    
    Analyze:
    1. Current skills from resume
    2. Required skills for target role
    3. Skill gaps (missing skills)
    4. Skill level gaps (skills present but insufficient)
    5. Generate personalized learning paths with specific resources
    
    Return JSON with:
    {
        "current_skills": ["skill1", "skill2"],
        "required_skills": [
            {
                "skill_name": "Python",
                "importance": "critical",
                "category": "technical",
                "description": "Required for backend development"
            }
        ],
        "skill_gaps": ["skill1", "skill2"],
        "skill_level_gaps": {
            "Python": "intermediate needed, currently beginner"
        },
        "learning_paths": [
            {
                "skill_name": "Python",
                "current_level": "beginner",
                "target_level": "intermediate",
                "learning_resources": [
                    {
                        "title": "Python for Everybody",
                        "type": "course",
                        "provider": "Coursera",
                        "duration": "2-3 months",
                        "cost": "Free",
                        "description": "Comprehensive Python course"
                    }
                ],
                "estimated_time": "2-3 months",
                "difficulty": "medium",
                "priority": 5
            }
        ],
        "skill_priority_ranking": ["skill1", "skill2"],
        "overall_readiness_score": 65,
        "recommendations": ["rec1", "rec2"],
        "timeline_estimate": "3-6 months to close critical gaps"
    }
    
    Provide realistic, actionable learning resources including:
    - Online courses (Coursera, Udemy, edX, etc.)
    - Certifications (AWS, Google, Microsoft, etc.)
    - Books and tutorials
    - Practice projects
    - Free and paid options
    """
    
    jd_text = f"\n\nJob Description:\n{data.job_description}" if data.job_description else ""
    current_skills_text = f"\n\nCurrent Skills (provided): {', '.join(data.current_skills)}" if data.current_skills else ""
    
    user_prompt = f"""
    Resume Text:
    {data.resume_text}
    {jd_text}
    {current_skills_text}
    
    Target Role: {data.target_role}
    
    Analyze skill gaps and provide:
    1. Comprehensive list of required skills for this role
    2. Identify gaps (missing skills) and level gaps (insufficient proficiency)
    3. Generate detailed learning paths with specific, actionable resources
    4. Prioritize skills by importance (critical, important, nice-to-have)
    5. Estimate timeline to close critical gaps
    6. Provide overall readiness score (0-100)
    
    Include realistic learning resources with durations, costs, and providers.
    Focus on actionable, high-quality resources that will actually help close the gaps.
    """
    
    try:
        response = create_chat_completion_with_auto_fallback(
            model=MODEL_NAME,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            response_format={"type": "json_object"},
            temperature=0.6,
            extra_headers={
                "HTTP-Referer": "https://antigravity.dev",
                "X-Title": "AI Resume Builder",
            }
        )
        
        content = response.choices[0].message.content
        result_data = json.loads(content)
        
        required_skills = [
            RequiredSkill(**rs) for rs in result_data.get("required_skills", [])
        ]
        
        learning_paths = []
        if data.include_learning_paths:
            learning_paths = [
                LearningPath(**lp) for lp in result_data.get("learning_paths", [])
            ]
        
        return SkillGapAnalyzerOutput(
            current_skills=result_data.get("current_skills", []),
            required_skills=required_skills,
            skill_gaps=result_data.get("skill_gaps", []),
            skill_level_gaps=result_data.get("skill_level_gaps", {}),
            learning_paths=learning_paths,
            skill_priority_ranking=result_data.get("skill_priority_ranking", []),
            overall_readiness_score=result_data.get("overall_readiness_score", 0),
            recommendations=result_data.get("recommendations", []),
            timeline_estimate=result_data.get("timeline_estimate", "Unknown")
        )
    except Exception as e:
        print(f"Error analyzing skill gaps: {e}")
        raise

def analyze_career_trends(data: CareerTrendAnalyzerInput) -> CareerTrendAnalyzerOutput:
    """
    Analyzes industry trends and predicts which skills/roles will be in demand.
    Provides proactive career guidance based on market trends and suggests resume updates.
    """
    from datetime import datetime
    
    system_prompt = """
    You are an expert Career Market Analyst and Industry Trend Predictor.
    Your goal is to analyze current job market trends and predict future demand for skills and roles.
    
    Analyze:
    1. Current market trends in the industry/role
    2. Emerging skills that will be in demand
    3. Skills that are becoming less relevant
    4. Role trends (which roles are growing/declining)
    5. Future-proofing recommendations for the resume
    
    Return JSON with:
    {
        "industry": "<industry name>",
        "analysis_date": "<current date>",
        "prediction_period": "Next 12 months",
        "skill_trends": [
            {
                "skill_name": "Python",
                "current_demand": "high",
                "predicted_demand": "increasing",
                "demand_timeline": "6-12 months",
                "growth_rate": "+25%",
                "reason": "AI/ML adoption driving demand",
                "industry_impact": "Critical for data science roles"
            }
        ],
        "role_trends": [
            {
                "role_title": "Senior Software Engineer",
                "current_market_status": "hot",
                "predicted_status": "growing",
                "growth_indicators": ["Remote work adoption", "Tech industry expansion"],
                "salary_trend": "increasing",
                "skill_requirements": ["Cloud computing", "AI/ML basics"],
                "timeline": "Next 6-12 months"
            }
        ],
        "resume_recommendations": [
            {
                "recommendation_type": "add_skill",
                "priority": 5,
                "action": "Add Python and machine learning to skills section",
                "reason": "High demand predicted for next 12 months",
                "expected_impact": "Increases marketability by 30%"
            }
        ],
        "future_proof_score": 75,
        "market_insights": ["insight1", "insight2"],
        "emerging_skills": ["skill1", "skill2"],
        "declining_skills": ["skill1", "skill2"],
        "action_plan": ["action1", "action2"]
    }
    
    Provide realistic, data-driven predictions based on current market trends.
    Focus on actionable insights that help users future-proof their careers.
    """
    
    industry_text = f"\nIndustry: {data.industry}" if data.industry else ""
    exp_text = f"\nYears of Experience: {data.years_of_experience}" if data.years_of_experience else ""
    target_roles_text = f"\nTarget Roles: {', '.join(data.target_roles)}" if data.target_roles else ""
    
    user_prompt = f"""
    Current Role: {data.current_role}
    {industry_text}
    {exp_text}
    {target_roles_text}
    Prediction Period: Next {data.prediction_months} months
    
    Resume:
    {data.resume_text}
    
    Analyze career trends and provide:
    1. Skill trends - which skills are growing/declining in demand
    2. Role trends - which roles are hot/declining
    3. Resume recommendations - how to future-proof the resume
    4. Market insights - general trends affecting the industry
    5. Action plan - specific steps to stay competitive
    
    Base predictions on realistic market analysis and current industry trends.
    Provide actionable recommendations that help the user prepare for future job market changes.
    """
    
    try:
        response = create_chat_completion_with_auto_fallback(
            model=MODEL_NAME,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            response_format={"type": "json_object"},
            temperature=0.7,
            extra_headers={
                "HTTP-Referer": "https://antigravity.dev",
                "X-Title": "AI Resume Builder",
            }
        )
        
        content = response.choices[0].message.content
        result_data = json.loads(content)
        
        # Parse nested structures
        skill_trends = [
            SkillTrend(**st) for st in result_data.get("skill_trends", [])
        ]
        
        role_trends = [
            RoleTrend(**rt) for rt in result_data.get("role_trends", [])
        ]
        
        resume_recommendations = [
            ResumeRecommendation(**rr) for rr in result_data.get("resume_recommendations", [])
        ]
        
        # Get current date for analysis_date if not provided
        analysis_date = result_data.get("analysis_date", datetime.now().strftime("%Y-%m-%d"))
        
        return CareerTrendAnalyzerOutput(
            industry=result_data.get("industry", data.industry or "General"),
            analysis_date=analysis_date,
            prediction_period=result_data.get("prediction_period", f"Next {data.prediction_months} months"),
            skill_trends=skill_trends,
            role_trends=role_trends,
            resume_recommendations=resume_recommendations,
            future_proof_score=result_data.get("future_proof_score", 50),
            market_insights=result_data.get("market_insights", []),
            emerging_skills=result_data.get("emerging_skills", []),
            declining_skills=result_data.get("declining_skills", []),
            action_plan=result_data.get("action_plan", [])
        )
    except Exception as e:
        print(f"Error analyzing career trends: {e}")
        raise

def simulate_salary_negotiation(data: SalaryNegotiationInput) -> SalaryNegotiationOutput:
    """
    Simulates salary negotiation conversations to help users prepare.
    Generates realistic negotiation scenarios and provides practice conversations.
    """
    from datetime import datetime
    
    system_prompt = """
    You are an expert Salary Negotiation Coach and Career Advisor.
    Your goal is to help candidates practice salary negotiations through realistic simulations.
    
    Generate:
    1. Realistic negotiation conversations between recruiter and candidate
    2. Multiple negotiation scripts for different scenarios
    3. Counter-offer suggestions based on market data
    4. Negotiation tips and strategies
    5. Common mistakes to avoid
    
    Return JSON with:
    {
        "negotiation_conversation": [
            {
                "role": "recruiter",
                "message": "We'd like to offer you $80,000 for this position.",
                "strategy": "lowball_initial_offer",
                "timestamp": "2024-01-15 10:00:00"
            },
            {
                "role": "candidate",
                "message": "Thank you for the offer. Based on my experience and market research...",
                "strategy": "evidence_based_counter",
                "timestamp": "2024-01-15 10:01:00"
            }
        ],
        "recommended_scripts": [
            {
                "scenario_name": "Entry-Level Position",
                "difficulty": "easy",
                "description": "Negotiating first job offer",
                "key_points": ["Focus on growth opportunities", "Negotiate benefits"],
                "suggested_responses": ["response1", "response2"],
                "counter_offer_suggestions": ["5-10% increase", "Additional benefits"]
            }
        ],
        "salary_benchmark": {
            "role": "Software Engineer",
            "market_range": "$90,000 - $120,000",
            "percentile_50": "$105,000",
            "percentile_75": "$115,000"
        },
        "negotiation_tips": ["tip1", "tip2"],
        "common_mistakes_to_avoid": ["mistake1", "mistake2"],
        "power_phrases": ["phrase1", "phrase2"],
        "scenarios_practiced": ["entry-level", "senior"]
    }
    
    Make conversations realistic and educational. Provide actionable advice.
    """
    
    context_parts = []
    if data.current_salary:
        context_parts.append(f"Current Salary: {data.current_salary}")
    if data.years_of_experience:
        context_parts.append(f"Years of Experience: {data.years_of_experience}")
    if data.location:
        context_parts.append(f"Location: {data.location}")
    if data.company_name:
        context_parts.append(f"Company: {data.company_name}")
    if data.initial_offer:
        context_parts.append(f"Initial Offer: {data.initial_offer}")
    if data.negotiation_scenario:
        context_parts.append(f"Scenario: {data.negotiation_scenario}")
    
    context_text = "\n".join(context_parts) if context_parts else "General negotiation scenario"
    jd_text = f"\n\nJob Description:\n{data.job_description}" if data.job_description else ""
    
    user_prompt = f"""
    Target Role: {data.target_role}
    {context_text}
    {jd_text}
    
    Resume:
    {data.resume_text[:1000]}...
    
    Generate a realistic salary negotiation simulation:
    1. Create a conversation flow (5-8 exchanges) between recruiter and candidate
    2. Include multiple negotiation scripts for different scenarios
    3. Provide market-based salary benchmarks for this role
    4. Offer negotiation tips and strategies
    5. Highlight common mistakes to avoid
    6. Suggest power phrases that strengthen negotiation position
    
    Make the conversation realistic - include pushback, counter-offers, and resolution.
    Base salary suggestions on realistic market data for the role and experience level.
    """
    
    try:
        response = create_chat_completion_with_auto_fallback(
            model=MODEL_NAME,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            response_format={"type": "json_object"},
            temperature=0.7,
            extra_headers={
                "HTTP-Referer": "https://antigravity.dev",
                "X-Title": "AI Resume Builder",
            }
        )
        
        content = response.choices[0].message.content
        result_data = json.loads(content)
        
        # Parse nested structures
        conversation = [
            NegotiationMessage(**msg) for msg in result_data.get("negotiation_conversation", [])
        ]
        
        scripts = [
            NegotiationScript(**script) for script in result_data.get("recommended_scripts", [])
        ]
        
        return SalaryNegotiationOutput(
            negotiation_conversation=conversation,
            recommended_scripts=scripts,
            salary_benchmark=result_data.get("salary_benchmark"),
            negotiation_tips=result_data.get("negotiation_tips", []),
            common_mistakes_to_avoid=result_data.get("common_mistakes_to_avoid", []),
            power_phrases=result_data.get("power_phrases", []),
            scenarios_practiced=result_data.get("scenarios_practiced", [])
        )
    except Exception as e:
        print(f"Error simulating salary negotiation: {e}")
        raise
