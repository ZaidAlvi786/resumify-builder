# backend/services/ai_service.py
import os
import json
from dotenv import load_dotenv
from openai import OpenAI
from services.ai_helpers import create_chat_completion_with_retry
from schemas.resume import (
    ResumeInput, ResumeOutput, ReviewInput, ReviewOutput,
    CoverLetterInput, CoverLetterOutput,
    InterviewQuestionsInput, InterviewQuestionsOutput,
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
    JobDescriptionAnalyzerInput, JobDescriptionAnalyzerOutput
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
        response = create_chat_completion_with_retry(
            client=client,
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
        response = create_chat_completion_with_retry(
            client=client,
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
        response = create_chat_completion_with_retry(
            client=client,
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
        response = create_chat_completion_with_retry(
            client=client,
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
    Generates interview questions and suggested answers based on the resume.
    """
    system_prompt = """
    You are an expert Interview Coach. Generate realistic interview questions based on the resume.
    Include:
    1. Technical questions relevant to the role
    2. Behavioral questions (STAR method)
    3. Questions about specific experiences mentioned
    4. Suggested answers that highlight achievements
    
    Categorize questions (Technical, Behavioral, Experience-based, etc.)
    Return as JSON with questions, answers, and categories.
    """
    
    jd_context = f"\nJob Description:\n{data.job_description}" if data.job_description else ""
    
    user_prompt = f"""
    Target Role: {data.target_role}
    {jd_context}
    
    Resume:
    {data.resume_text}
    """

    try:
        response = create_chat_completion_with_retry(
            client=client,
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
        return InterviewQuestionsOutput(
            questions=questions_data.get("questions", []),
            answers=questions_data.get("answers", []),
            categories=questions_data.get("categories", [])
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
        response = create_chat_completion_with_retry(
            client=client,
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
        response = create_chat_completion_with_retry(
            client=client,
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
        response = create_chat_completion_with_retry(
            client=client,
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
        response = create_chat_completion_with_retry(
            client=client,
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
        response = create_chat_completion_with_retry(
            client=client,
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
        response = create_chat_completion_with_retry(
            client=client,
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
        response = create_chat_completion_with_retry(
            client=client,
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
        response = create_chat_completion_with_retry(
            client=client,
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
        response = create_chat_completion_with_retry(
            client=client,
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
        response = create_chat_completion_with_retry(
            client=client,
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
