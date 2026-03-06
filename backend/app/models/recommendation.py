from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from .base import UUIDMixin, TimestampMixin


class CareerTrack(BaseModel):
    title: str = Field(..., description="Title of the career track")
    focus: str = Field(..., description="Focus area of the career track")
    starter_role: str = Field(..., description="Entry-level position")
    required_skills: List[str] = Field(..., description="Skills required for this track")
    salary_range: Optional[str] = Field(None, description="Expected salary range")
    growth_potential: Optional[str] = Field(None, description="Growth potential for this career")
    industry_trend: Optional[str] = Field(None, description="Current trend in this industry")


class Opportunity(BaseModel):
    type: str = Field(..., description="Type of opportunity (course, internship, job)")
    title: str = Field(..., description="Title of the opportunity")
    provider: str = Field(..., description="Provider of the opportunity")
    url: str = Field(..., description="URL to the opportunity")
    duration: Optional[str] = Field(None, description="Duration of the opportunity")
    difficulty_level: Optional[str] = Field(None, description="Difficulty level")
    rating: Optional[float] = Field(None, ge=0.0, le=5.0, description="Rating of the opportunity")


class RecommendationOutput(BaseModel):
    career_tracks: List[CareerTrack] = Field(..., description="Recommended career tracks")
    opportunities: List[Opportunity] = Field(..., description="Recommended opportunities")
    confidence_score: float = Field(..., ge=0.0, le=1.0, description="Confidence score for recommendations")
    reasoning: str = Field(..., description="Reasoning behind the recommendations")
    next_steps: List[str] = Field(..., description="Suggested next steps for the user")


class RecommendationInDB(RecommendationOutput, UUIDMixin, TimestampMixin):
    user_id: str
    assessment_id: str
    source: str = "ai_agent"
    is_primary: bool = True