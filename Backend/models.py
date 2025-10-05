"""
This file defines the Pydantic models for your application.
These models are used for request and response data validation.
"""
from pydantic import BaseModel
from typing import List, Optional, Dict

class Experience(BaseModel):
    jobTitle: str
    company: str
    description: str
    startDate: str  
    endDate: Optional[str] = "Present"  
    isCurrent: bool = False  

class Education(BaseModel):
    degree: str
    institution: str
    description: str
    startDate: str  
    endDate: Optional[str] = "Present"  
    isCurrent: bool = False  

class Project(BaseModel):
    name: str
    description: str

class Certification(BaseModel):
    name: str
    organization: str

class LinkedInProfile(BaseModel):
    headline: str
    about: str
    experiences: List[Experience]
    education: List[Education]
    skills: List[str]
    projects: List[Project]
    certifications: List[Certification]
    target_personas: Optional[List[str]] = ["general"]
    is_job_seeking: Optional[bool] = False
    target_job_descriptions: Optional[List[str]] = []

# Pydantic Models for API responses
class PersonaAnalysisResponse(BaseModel):
    headline_feedback: str
    about_feedback: str
    experience_feedback: str
    education_feedback: str
    skills_feedback: str
    projects_feedback: str
    certifications_feedback: str
    holistic_feedback: str
    job_match_feedback: Optional[str] = "" 

class AnalysisResponse(BaseModel):
    results: Dict[str, PersonaAnalysisResponse]
