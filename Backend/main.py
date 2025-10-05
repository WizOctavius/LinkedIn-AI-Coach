"""
This is the main entry point for the FastAPI application.
It sets up the app, defines the API endpoints, and connects the
routing to the core logic in the other modules.
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
import asyncio

# Import from other modules in the project
import analysis
from models import LinkedInProfile, AnalysisResponse, PersonaAnalysisResponse

# Initialize the FastAPI application
app = FastAPI()

# Configure CORS (Cross-Origin Resource Sharing)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/analyze-stream")
async def analyze_profile_stream(profile: LinkedInProfile):
    """
    Real-time streaming analysis endpoint.
    It takes a LinkedIn profile and streams back the analysis as it's generated.
    """
    return StreamingResponse(
        analysis.stream_analysis_generator(profile),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        }
    )

@app.post("/analyze", response_model=AnalysisResponse)
async def analyze_profile(profile: LinkedInProfile):
    """
    Non-streaming fallback endpoint.
    This performs the entire analysis and returns the complete result at once.
    """
    try:
        target_personas = profile.target_personas if profile.target_personas else ["general"]
        all_analyses = {}
        
        for persona in target_personas:
            user_context = await analysis.determine_user_context(profile, persona)
            
            # Run all section analyses in parallel
            tasks = [
                analysis.analyze_headline_non_stream(profile.headline, user_context),
                analysis.analyze_about_non_stream(profile.about, user_context),
                analysis.analyze_experience_non_stream(profile.experiences, user_context),
                analysis.analyze_education_non_stream(profile.education, user_context),
                analysis.analyze_skills_non_stream(profile.skills, user_context),
                analysis.analyze_projects_non_stream(profile.projects, user_context),
                analysis.analyze_certifications_non_stream(profile.certifications, user_context),
            ]
            if profile.is_job_seeking and profile.target_job_descriptions:
                tasks.append(analysis.analyze_job_match_non_stream(profile, user_context))

            results = await asyncio.gather(*tasks, return_exceptions=True)
            
            section_keys = ['headline', 'about', 'experience', 'education', 'skills', 'projects', 'certifications']
            if profile.is_job_seeking and profile.target_job_descriptions:
                section_keys.append('job_match')
            section_analyses = {key: (res if not isinstance(res, Exception) else f"Analysis failed: {str(res)}") for key, res in zip(section_keys, results)}

            # Generate holistic feedback based on section analyses
            holistic_feedback = await analysis.generate_holistic_feedback_non_stream(profile, section_analyses, user_context)
            
            # Store the complete analysis for this persona
            all_analyses[persona] = PersonaAnalysisResponse(
                headline_feedback=section_analyses['headline'],
                about_feedback=section_analyses['about'],
                experience_feedback=section_analyses['experience'],
                education_feedback=section_analyses['education'],
                skills_feedback=section_analyses['skills'],
                projects_feedback=section_analyses['projects'],
                certifications_feedback=section_analyses['certifications'],
                holistic_feedback=holistic_feedback,
                job_match_feedback=section_analyses.get('job_match', "")
            )
        
        return AnalysisResponse(results=all_analyses)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@app.get("/health")
async def health_check():
    """A simple health check endpoint to confirm the API is running."""
    return {"status": "healthy", "message": "LinkedIn Profile Analyzer API is running"}


if __name__ == "__main__":
    import uvicorn
    # This allows you to run the app directly using `python main.py`
    uvicorn.run(app, host="0.0.0.0", port=8000)
