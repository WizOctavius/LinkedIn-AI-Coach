"""
This file contains the core business logic for analyzing LinkedIn profiles.
It includes functions for both streaming and non-streaming analysis of each profile section.
"""
import json
import asyncio
from typing import List, AsyncGenerator, Dict

# Import from other modules in the project
import services
import utils
from models import (
    LinkedInProfile, Experience, Education, Project, Certification
)

# ==================== CONTEXT DETERMINATION ====================
async def determine_user_context(profile: LinkedInProfile, persona: str = "general") -> dict:
    """Determine user context - uses non-streaming since it's fast"""
    persona_context = {
        "general": "a general professional audience",
        "recruiter": "recruiters actively searching for candidates",
        "hiring_manager": "hiring managers evaluating technical fit",
        "client": "potential clients looking for expertise",
        "investor": "investors evaluating business potential",
        "peer": "industry peers and potential collaborators"
    }
    
    persona_description = persona_context.get(persona, "a professional audience")
    
    context_prompt = f"""Analyze this LinkedIn profile to determine the user's professional context, specifically optimized for {persona_description}.
Headline: {profile.headline}
About: {profile.about[:500]}...
Experience: {len(profile.experiences)} positions listed
Most Recent Role: {profile.experiences[0].jobTitle if profile.experiences else 'Not specified'} at {profile.experiences[0].company if profile.experiences else 'Not specified'}
Skills: {', '.join(profile.skills[:10])}
IMPORTANT: Frame your analysis considering what {persona_description} would prioritize.
Determine and return ONLY the following in this exact format:
SENIORITY: [Entry-level/Mid-level/Senior/Executive/C-Suite]
INDUSTRY: [Primary industry, e.g., Technology, Healthcare, Finance]
CAREER_GOAL: [Their apparent goal for {persona_description}: Job seeking/Career growth/Thought leadership/Networking/Entrepreneurship]
TARGET_AUDIENCE: {persona}
TONE_PREFERENCE: [Current tone: Professional-formal/Professional-casual/Technical/Creative]
KEY_STRENGTH: [Their most obvious strength in 3-5 words]
PRIMARY_GAP: [Most significant gap or opportunity for {persona_description} in 3-5 words]"""
    system_prompt = f"You are an expert at quickly identifying professional context for optimization targeting {persona_description}. Be precise and concise."
    
    response = await services.call_cerebras_api(context_prompt, system_prompt, max_tokens=300)
    
    context = {
        'seniority': 'Mid-level', 'industry': 'Technology', 'career_goal': 'Career growth',
        'target_audience': persona, 'tone_preference': 'Professional-formal',
        'key_strength': 'Technical skills', 'primary_gap': 'Quantifiable achievements', 'persona': persona
    }
    
    for line in response.split('\n'):
        if 'SENIORITY:' in line: context['seniority'] = line.split(':', 1)[1].strip()
        elif 'INDUSTRY:' in line: context['industry'] = line.split(':', 1)[1].strip()
        elif 'CAREER_GOAL:' in line: context['career_goal'] = line.split(':', 1)[1].strip()
        elif 'TARGET_AUDIENCE:' in line: context['target_audience'] = line.split(':', 1)[1].strip()
        elif 'TONE_PREFERENCE:' in line: context['tone_preference'] = line.split(':', 1)[1].strip()
        elif 'KEY_STRENGTH:' in line: context['key_strength'] = line.split(':', 1)[1].strip()
        elif 'PRIMARY_GAP:' in line: context['primary_gap'] = line.split(':', 1)[1].strip()
    
    return context

# ==================== STREAMING ANALYSIS FUNCTIONS ====================
async def analyze_headline_stream_two_step(headline: str, context: dict) -> AsyncGenerator[str, None]:
    """TWO-STEP SEQUENTIAL PROCESS for headline analysis: Generate → Refine"""
    if not headline.strip():
        yield "No headline provided. A compelling headline is crucial for LinkedIn visibility."
        return

    generate_prompt = f"""You are a creative LinkedIn headline generator for a {context['seniority']} professional in {context['industry']}.
Current Headline: "{headline}"
Context:
- Career Goal: {context['career_goal']}
- Target Audience: {context['target_audience']}
- Key Strength: {context['key_strength']}
Generate 5 alternative headline options that are under 220 characters, include relevant keywords, communicate value, are optimized for {context['target_audience']}, and match their tone.
Format each as: OPTION 1: [headline], etc. Then provide a brief analysis of the CURRENT headline's strengths and weaknesses."""
    generated_options = ""
    async for chunk in services.call_cerebras_stream(generate_prompt, "You are a creative professional headline writer.", 800):
        generated_options += chunk
        yield chunk

    refine_prompt = f"""You are an expert career strategist reviewing headline options for a {context['seniority']} {context['industry']} professional.
CURRENT HEADLINE: "{headline}"
GENERATED ALTERNATIVES: {generated_options}
Your task is to analyze each alternative, select the TOP 2, and provide specific, actionable recommendations on what to keep, change, and add to the current headline. Be strategic and specific."""
    async for chunk in services.call_llama_stream(refine_prompt, "You are a strategic career advisor.", 1200):
        yield chunk

async def analyze_about_stream(about: str, context: dict) -> AsyncGenerator[tuple[str, str], None]:
    if not about.strip():
        yield ("No About section provided. This is a critical section that tells your professional story.", "about")
        return
    prompt = f"""You are the "Persona Calibrator" analyzing an About section for a {context['seniority']} professional in {context['industry']} targeting {context['target_audience']}.
About Section: "{about}"
Context: Goal({context['career_goal']}), Strength({context['key_strength']}), Gap({context['primary_gap']})
Analyze this section for: Structure, Authenticity, Value Proposition, Gap Addressing, Call to Action, and Keyword Optimization. Provide detailed, personalized feedback with specific examples."""
    async for chunk in services.call_llama_stream(prompt, "You are an expert at crafting compelling About sections.", 1500):
        yield (chunk, "about")

async def analyze_experience_stream(experiences: List[Experience], context: dict) -> AsyncGenerator[tuple[str, str], None]:
    if not experiences or all(not exp.description.strip() for exp in experiences):
        yield ("No experience descriptions provided. Strong descriptions are essential.", "experience")
        return
    
    exp_text = "\n\n".join([
        f"Position: {exp.jobTitle} at {exp.company}\n"
        f"Duration: {exp.startDate} - {exp.endDate if hasattr(exp, 'endDate') else 'Present'}\n"
        f"Description:\n{exp.description}"
        for exp in experiences if exp.description.strip()
    ])
    
    prompt = f"""Analyze these LinkedIn experience entries for a {context['seniority']} {context['industry']} professional targeting {context['target_audience']}:

{exp_text}

Context-Specific Evaluation:

1. CAREER PROGRESSION:
- Do the roles show clear advancement over time?
- Are the durations appropriate (avoid job-hopping concerns or stagnation)?
- Does the timeline support their {context['seniority']} level claim?

2. TENURE ANALYSIS:
- Are any positions too short (< 6 months) without explanation?
- Are any positions unusually long (5+ years) at the same level?
- Do gaps between positions need addressing?

3. STAR METHOD (Situation, Task, Action, Result):
- Are accomplishments described with context and measurable results?
- Are results framed to appeal to {context['target_audience']}?

4. ACTION VERBS:
- Does each bullet point start with strong action verbs appropriate for {context['seniority']} level?
- Are verbs varied and impactful for {context['industry']}?

5. QUANTIFIABLE METRICS:
- Are there specific numbers relevant to {context['industry']}?
- Do metrics demonstrate progression appropriate for {context['seniority']}?

6. CLARITY & RELEVANCE:
- Are achievements emphasized over tasks?
- Do descriptions showcase "{context['key_strength']}"?
- Is technical depth appropriate for {context['industry']}?

7. ADDRESSING GAPS:
- How well does this address: {context['primary_gap']}?
- Are employment gaps handled appropriately?

Provide specific feedback for improvement with examples tailored to {context['industry']} and {context['seniority']} level."""
    
    async for chunk in services.call_cerebras_stream(prompt, f"You are an expert at analyzing {context['industry']} experience.", 1200):
        yield (chunk, "experience")

async def analyze_education_stream(education: List[Education], context: dict) -> AsyncGenerator[tuple[str, str], None]:
    if not education or all(not edu.degree.strip() for edu in education):
        yield (f"No education information provided.", "education")
        return
    
    edu_text = "\n".join([
        f"{edu.degree} from {edu.institution}\n"
        f"Duration: {edu.startDate} - {edu.endDate if hasattr(edu, 'endDate') else 'Not specified'}"
        + (f"\n{edu.description}" if edu.description else "")
        for edu in education
    ])
    
    prompt = f"""Analyze this education section for a {context['seniority']} professional in {context['industry']}:

{edu_text}

Context-Specific Evaluation:

1. RELEVANCE TO INDUSTRY:
- Is this education appropriate for {context['industry']}?
- Are there specialized programs or certifications expected in this field?

2. SENIORITY ALIGNMENT:
- At {context['seniority']} level, should education be emphasized or de-emphasized?
- Is the education positioning appropriate?

3. TIMELINE ANALYSIS:
- Does the education timeline align with career progression?
- Are degrees recent or outdated for the field?
- Any gaps between education and career start?

4. COMPLETENESS:
- Should honors, GPA, relevant coursework be included for {context['target_audience']}?
- Are there relevant projects or research worth highlighting?

5. CAREER GOAL SUPPORT:
- Does this education support their goal of {context['career_goal']}?
- Are there additional degrees/programs that would strengthen positioning?

Provide brief, actionable feedback tailored to their context."""
    
    async for chunk in services.call_cerebras_stream(prompt, f"You are an expert in {context['industry']} educational requirements.", 800):
        yield (chunk, "education")

async def analyze_skills_stream(skills: List[str], context: dict) -> AsyncGenerator[tuple[str, str], None]:
    if not skills:
        yield (f"No skills listed. Add 5-10 core skills relevant to {context['industry']}.", "skills")
        return
    skills_text = ", ".join(skills)
    prompt = f"""Analyze this skills list for a {context['seniority']} professional in {context['industry']}: {skills_text}
Evaluate: Industry Relevance, Seniority Alignment, Career Goal Support, Balance (technical vs. soft), and how well it highlights their strength '{context['key_strength']}'. Suggest skills to add, remove, or prioritize."""
    async for chunk in services.call_cerebras_stream(prompt, f"You are an expert in {context['industry']} skill requirements.", 1000):
        yield (chunk, "skills")

async def analyze_projects_stream(projects: List[Project], context: dict) -> AsyncGenerator[tuple[str, str], None]:
    if not projects or all(not proj.name.strip() for proj in projects):
        yield (f"No projects listed. For {context['seniority']} professionals, projects can showcase expertise.", "projects")
        return
    proj_text = "\n\n".join([f"Project: {proj.name}\n{proj.description}" for proj in projects if proj.name.strip()])
    prompt = f"""Analyze these project entries for a {context['seniority']} {context['industry']} professional targeting {context['target_audience']}:
{proj_text}
Evaluate: Industry Relevance, Audience Appeal, Strength Demonstration ('{context['key_strength']}'), Impact & Outcomes. Provide actionable feedback."""
    async for chunk in services.call_cerebras_stream(prompt, f"You are an expert at evaluating {context['industry']} project portfolios.", 1000):
        yield (chunk, "projects")

async def analyze_certifications_stream(certifications: List[Certification], context: dict) -> AsyncGenerator[tuple[str, str], None]:
    if not certifications or all(not cert.name.strip() for cert in certifications):
        yield (f"No certifications listed. Relevant certifications can boost credibility.", "certifications")
        return
    cert_text = "\n".join([f"{cert.name} - {cert.organization}" for cert in certifications if cert.name.strip()])
    prompt = f"""Analyze these certifications for a {context['seniority']} {context['industry']} professional: {cert_text}
Evaluate: Industry Relevance, Seniority Appropriateness, and support for their career goal. Suggest key certifications if any are missing."""
    async for chunk in services.call_cerebras_stream(prompt, f"You are an expert in certifications for {context['industry']}.", 800):
        yield (chunk, "certifications")

# ==================== JOB MATCHING ANALYSIS ====================
async def analyze_job_match_stream(profile: LinkedInProfile, context: dict) -> AsyncGenerator[tuple[str, str], None]:
    """Analyze profile fit against target job descriptions - STREAMING"""
    if not profile.is_job_seeking or not profile.target_job_descriptions:
        return
    
    valid_job_descriptions = [desc.strip() for desc in profile.target_job_descriptions if desc.strip() and len(desc.strip()) > 50]
    
    if not valid_job_descriptions:
        return
    
    profile_summary = f"""
PROFILE SUMMARY:
Headline: {profile.headline}
About: {profile.about[:400]}...
Skills: {', '.join(profile.skills[:15])}
Recent Experience: {profile.experiences[0].jobTitle if profile.experiences else 'N/A'} at {profile.experiences[0].company if profile.experiences else 'N/A'}
"""
    
    for idx, job_desc in enumerate(valid_job_descriptions, 1):
        prompt = f"""You are an expert ATS (Applicant Tracking System) analyst and career coach.

{profile_summary}

TARGET JOB DESCRIPTION #{idx}:
{job_desc[:2000]}

Perform a comprehensive job matching analysis:

1. MATCH SCORE (0-100): Provide an overall match percentage and explain why.

2. KEYWORD ALIGNMENT: 
   - Which required keywords from the job description are present in the profile?
   - Which critical keywords are MISSING?

3. SKILLS GAP ANALYSIS:
   - Technical skills present vs. required
   - Soft skills alignment
   - What skills need to be added to the profile?

4. EXPERIENCE ALIGNMENT:
   - Does their experience level match the job requirements?
   - Are relevant responsibilities highlighted?

5. ATS OPTIMIZATION:
   - How to improve keyword density for ATS systems
   - Recommended phrases to add to headline/about/experience

6. COMPETITIVE POSITIONING:
   - What makes this candidate stand out for this role?
   - What are the biggest weaknesses compared to ideal candidates?

7. ACTION ITEMS:
   - Top 3 profile changes to increase match score
   - Specific phrases to add
   - Content to emphasize or de-emphasize

Be specific, actionable, and honest about fit."""
        
        if idx > 1:
            yield (f"\n\n{'='*60}\n", "job_match")
        
        yield (f"JOB MATCH ANALYSIS #{idx}\n{'='*60}\n\n", "job_match")
        
        async for chunk in services.call_llama_stream(prompt, f"You are an expert at matching candidates to job requirements for {context['industry']} roles.", 2500):
            yield (chunk, "job_match")

async def generate_holistic_feedback_stream(profile: LinkedInProfile, section_analyses: dict, context: dict) -> AsyncGenerator[tuple[str, str], None]:
    """Stream holistic meta-analysis based on individual section feedback"""
    summary = f"""PROFESSIONAL CONTEXT: A {context['seniority']} in {context['industry']} targeting {context['target_audience']} with goal of {context['career_goal']}.
Strength: {context['key_strength']}. Gap: {context['primary_gap']}.
SUMMARY OF AI FEEDBACK:
Headline: {section_analyses['headline'][:200]}...
About: {section_analyses['about'][:200]}...
Experience: {section_analyses['experience'][:200]}...
"""
    prompt = f"""{summary}
You are an expert career strategist. Conduct a STRATEGIC META-ANALYSIS.
1. ANALYZE THE ANALYSES: Identify patterns and critical feedback in the summaries above.
2. HOLISTIC ASSESSMENT: Check for consistency, narrative coherence, and audience alignment across the entire profile.
3. STRATEGIC PRIORITIZATION: Provide 3-5 HIGH-IMPACT, STRATEGIC recommendations. What are the MOST IMPORTANT changes they should make?
FORMAT as a prioritized list.
STRATEGIC PRIORITY 1: [Most critical change] Why: [Impact] How: [Action steps]
FINAL STRATEGIC INSIGHT: [One powerful insight about their overall brand.]"""
    async for chunk in services.call_llama_stream(prompt, "You are a master career strategist.", 2000):
        yield (chunk, "holistic")

# ==================== MAIN STREAMING GENERATOR WITH RATE LIMITING ====================
async def stream_analysis_generator(profile: LinkedInProfile):
    """Orchestrates the real-time streaming analysis with rate-limited parallel execution."""
    try:
        target_personas = profile.target_personas if profile.target_personas else ["general"]
        yield f"data: {json.dumps({'type': 'status', 'message': f'Starting analysis for {len(target_personas)} persona(s)'})}\n\n"
        all_analyses = {}
        
        for persona_idx, persona in enumerate(target_personas):
            try:
                yield f"data: {json.dumps({'type': 'persona_start', 'persona': persona, 'current': persona_idx + 1, 'total': len(target_personas)})}\n\n"
                
                user_context = await determine_user_context(profile, persona)
                section_analyses = {k: '' for k in ['headline', 'about', 'experience', 'education', 'skills', 'projects', 'certifications']}
                sections_started = set()
                
                # Sequential Headline Analysis (must complete first)
                yield f"data: {json.dumps({'type': 'section_start', 'section': 'headline'})}\n\n"
                sections_started.add('headline')
                async for chunk in analyze_headline_stream_two_step(profile.headline, user_context):
                    section_analyses['headline'] += chunk
                    yield f"data: {json.dumps({'type': 'stream', 'section': 'headline', 'chunk': chunk})}\n\n"
                
                # RATE-LIMITED PARALLEL EXECUTION
                # Split sections into batches to avoid overwhelming the API
                section_configs = [
                    (analyze_about_stream(profile.about, user_context), 'about'),
                    (analyze_experience_stream(profile.experiences, user_context), 'experience'),
                    (analyze_education_stream(profile.education, user_context), 'education'),
                    (analyze_skills_stream(profile.skills, user_context), 'skills'),
                    (analyze_projects_stream(profile.projects, user_context), 'projects'),
                    (analyze_certifications_stream(profile.certifications, user_context), 'certifications')
                ]
                
                # Process in batches of 3 to limit concurrent API calls
                BATCH_SIZE = 3
                for batch_idx in range(0, len(section_configs), BATCH_SIZE):
                    batch = section_configs[batch_idx:batch_idx + BATCH_SIZE]
                    generators = [config[0] for config in batch]
                    section_names = [config[1] for config in batch]
                    
                    # Process this batch in parallel
                    async for chunk, section, gen_idx in utils.merge_streams(*generators):
                        section_name = section_names[gen_idx]
                        if section_name not in sections_started:
                            yield f"data: {json.dumps({'type': 'section_start', 'section': section_name})}\n\n"
                            sections_started.add(section_name)
                        section_analyses[section_name] += chunk
                        yield f"data: {json.dumps({'type': 'stream', 'section': section_name, 'chunk': chunk})}\n\n"

                # Job Match Analysis (if applicable)
                if profile.is_job_seeking and profile.target_job_descriptions:
                    yield f"data: {json.dumps({'type': 'section_start', 'section': 'job_match'})}\n\n"
                    job_match_text = ""
                    async for chunk, _ in analyze_job_match_stream(profile, user_context):
                        job_match_text += chunk
                        yield f"data: {json.dumps({'type': 'stream', 'section': 'job_match', 'chunk': chunk})}\n\n"
                    section_analyses['job_match'] = job_match_text
        
                # Holistic Feedback
                yield f"data: {json.dumps({'type': 'section_start', 'section': 'holistic'})}\n\n"
                holistic_text = ""
                async for chunk, _ in generate_holistic_feedback_stream(profile, section_analyses, user_context):
                    holistic_text += chunk
                    yield f"data: {json.dumps({'type': 'stream', 'section': 'holistic', 'chunk': chunk})}\n\n"
                
                all_analyses[persona] = {**{k+'_feedback': v for k, v in section_analyses.items()}, 'holistic_feedback': holistic_text}
                yield f"data: {json.dumps({'type': 'persona_complete', 'persona': persona})}\n\n"
                
            except Exception as e:
                yield f"data: {json.dumps({'type': 'error', 'message': str(e), 'trigger_fallback': True})}\n\n"
                return
        
        yield f"data: {json.dumps({'type': 'complete', 'results': all_analyses})}\n\n"
        
    except Exception as e:
        yield f"data: {json.dumps({'type': 'error', 'message': str(e), 'trigger_fallback': True})}\n\n"

# ==================== NON-STREAMING (FALLBACK) ANALYSIS FUNCTIONS ====================
async def analyze_headline_non_stream(headline: str, context: dict) -> str:
    if not headline.strip(): return "No headline provided."
    generate_prompt = f"""You are a creative LinkedIn headline generator for a {context['seniority']} professional in {context['industry']}.
Current Headline: "{headline}"
Context: Goal({context['career_goal']}), Audience({context['target_audience']}), Strength({context['key_strength']})
Generate 5 alternative headlines and analyze the current one."""
    generated_options = await services.call_cerebras_api(generate_prompt, "You are a creative headline writer.", 800)
    refine_prompt = f"""You are an expert career strategist. Review these headlines:
CURRENT: "{headline}"
ALTERNATIVES: {generated_options}
Select the TOP 2 alternatives and provide actionable recommendations."""
    return await services.call_llama_api(refine_prompt, "You are a strategic career advisor.", 1200)

async def analyze_about_non_stream(about: str, context: dict) -> str:
    if not about.strip(): return "No About section provided."
    prompt = f"""You are the "Persona Calibrator" analyzing an About section for a {context['seniority']} professional in {context['industry']} targeting {context['target_audience']}.
About Section: "{about}"
Analyze this section for: Structure, Authenticity, Value Proposition, Gap Addressing, Call to Action, and Keyword Optimization."""
    return await services.call_llama_api(prompt, "You are an expert at crafting compelling About sections.", 1500)

async def analyze_experience_non_stream(experiences: List[Experience], context: dict) -> str:
    if not experiences or all(not exp.description.strip() for exp in experiences): 
        return "No experience descriptions provided."
    
    exp_text = "\n\n".join([
        f"Position: {exp.jobTitle} at {exp.company}\n"
        f"Duration: {exp.startDate} - {exp.endDate if hasattr(exp, 'endDate') else 'Present'}\n"
        f"Description:\n{exp.description}"
        for exp in experiences if exp.description.strip()
    ])
    
    prompt = f"""Analyze these LinkedIn experience entries for a {context['seniority']} {context['industry']} professional:

{exp_text}

Context-Specific Evaluation:

1. CAREER PROGRESSION: Do roles show advancement? Are durations appropriate?
2. TENURE ANALYSIS: Any positions too short or too long? Employment gaps?
3. STAR METHOD: Measurable results framed for {context['target_audience']}?
4. ACTION VERBS: Strong, varied verbs for {context['seniority']} level?
5. QUANTIFIABLE METRICS: Specific numbers relevant to {context['industry']}?

Provide specific feedback with examples."""
    
    return await services.call_cerebras_api(prompt, f"You are an expert at analyzing {context['industry']} experience.", 1200)

async def analyze_education_non_stream(education: List[Education], context: dict) -> str:
    if not education or all(not edu.degree.strip() for edu in education): 
        return "No education information provided."
    
    edu_text = "\n".join([
        f"{edu.degree} from {edu.institution}\n"
        f"Duration: {edu.startDate} - {edu.endDate if hasattr(edu, 'endDate') else 'Not specified'}"
        for edu in education
    ])
    
    prompt = f"""Analyze this education section for a {context['seniority']} professional in {context['industry']}: 

{edu_text}

Evaluate for: Relevance to industry, Timeline alignment with career, Seniority appropriateness, and support for career goal of {context['career_goal']}.
Provide brief, actionable feedback."""
    
    return await services.call_cerebras_api(prompt, f"You are an expert in {context['industry']} educational requirements.", 800)

async def analyze_skills_non_stream(skills: List[str], context: dict) -> str:
    if not skills: return "No skills listed."
    skills_text = ", ".join(skills)
    prompt = f"""Analyze this skills list for a {context['seniority']} professional in {context['industry']}: {skills_text}
Evaluate for industry relevance, seniority alignment, and balance."""
    return await services.call_cerebras_api(prompt, f"You are an expert in {context['industry']} skill requirements.", 1000)

async def analyze_projects_non_stream(projects: List[Project], context: dict) -> str:
    if not projects or all(not proj.name.strip() for proj in projects): return "No projects listed."
    proj_text = "\n\n".join([f"Project: {proj.name}\n{proj.description}" for proj in projects if proj.name.strip()])
    prompt = f"""Analyze these project entries for a {context['seniority']} {context['industry']} professional: {proj_text}
Evaluate for relevance, audience appeal, and impact."""
    return await services.call_cerebras_api(prompt, f"You are an expert at evaluating {context['industry']} projects.", 1000)

async def analyze_certifications_non_stream(certifications: List[Certification], context: dict) -> str:
    if not certifications or all(not cert.name.strip() for cert in certifications): return "No certifications listed."
    cert_text = "\n".join([f"{cert.name} - {cert.organization}" for cert in certifications])
    prompt = f"""Analyze these certifications for a {context['seniority']} {context['industry']} professional: {cert_text}
Evaluate for industry relevance and seniority appropriateness."""
    return await services.call_cerebras_api(prompt, f"You are an expert in certifications for {context['industry']}.", 800)

async def analyze_job_match_non_stream(profile: LinkedInProfile, context: dict) -> str:
    """Analyze profile fit against target job descriptions - NON-STREAMING"""
    if not profile.is_job_seeking or not profile.target_job_descriptions:
        return ""
    
    valid_job_descriptions = [desc.strip() for desc in profile.target_job_descriptions if desc.strip() and len(desc.strip()) > 50]
    
    if not valid_job_descriptions:
        return ""
    
    profile_summary = f"""
PROFILE SUMMARY:
Headline: {profile.headline}
About: {profile.about[:400]}...
Skills: {', '.join(profile.skills[:15])}
Recent Experience: {profile.experiences[0].jobTitle if profile.experiences else 'N/A'} at {profile.experiences[0].company if profile.experiences else 'N/A'}
"""
    
    all_analyses = []
    for idx, job_desc in enumerate(valid_job_descriptions, 1):
        prompt = f"""You are an expert ATS analyst and career coach.

{profile_summary}

TARGET JOB DESCRIPTION #{idx}:
{job_desc[:2000]}

Perform a comprehensive job matching analysis covering:
1. Match Score (0-100)
2. Keyword Alignment (present/missing)
3. Skills Gap Analysis
4. Experience Alignment
5. ATS Optimization recommendations
6. Competitive Positioning
7. Top 3 Action Items

Be specific and actionable."""
        
        analysis = await services.call_llama_api(prompt, f"You are an expert at matching candidates to {context['industry']} roles.", 2500)
        all_analyses.append(f"JOB MATCH ANALYSIS #{idx}\n{'='*60}\n\n{analysis}")
    
    return "\n\n".join(all_analyses)

async def generate_holistic_feedback_non_stream(profile: LinkedInProfile, section_analyses: Dict, context: dict) -> str:
    summary = f"""PROFESSIONAL CONTEXT: {context['seniority']} in {context['industry']} targeting {context['target_audience']}.
AI FEEDBACK SUMMARY:
Headline: {section_analyses['headline'][:200]}...
About: {section_analyses['about'][:200]}...
Experience: {section_analyses['experience'][:200]}..."""
    prompt = f"""{summary}
You are an expert career strategist. Conduct a STRATEGIC META-ANALYSIS.
Analyze the analyses, assess the holistic profile for consistency, and provide 3-5 HIGH-IMPACT, prioritized recommendations."""
    return await services.call_llama_api(prompt, "You are a master career strategist.", 2000)