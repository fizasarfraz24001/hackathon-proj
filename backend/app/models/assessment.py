from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from .base import UUIDMixin, TimestampMixin
from .user import UserInDB


class AssessmentInput(BaseModel):
    user_id: str
    interests: List[str] = Field(..., description="User's career interests")
    current_skills: List[str] = Field(..., description="Skills the user currently has")
    education_level: str = Field(..., description="User's education level")
    career_goals: Optional[str] = Field(None, description="User's career goals")
    personality_traits: Optional[List[str]] = Field(default=[], description="User's personality traits")
    work_preferences: Optional[Dict[str, Any]] = Field(default={}, description="Work environment preferences")


class SkillGapAnalysis(BaseModel):
    missing_skills: List[str] = Field(..., description="Skills the user needs for their target careers")
    priority_skills: List[str] = Field(..., description="Most important skills to learn first")
    learning_difficulty: Dict[str, str] = Field(..., description="Difficulty level for each skill")
    estimated_time: Dict[str, str] = Field(..., description="Estimated time to learn each skill")


class AssessmentResult(BaseModel):
    user_id: str
    assessment_id: str
    skill_gaps: SkillGapAnalysis
    confidence_score: float = Field(..., ge=0.0, le=1.0, description="Confidence score for the assessment")
    recommendations: List[str] = Field(..., description="General recommendations")
    created_at: datetime = datetime.now()


class AssessmentInDB(AssessmentResult, UUIDMixin, TimestampMixin):
    raw_input: Dict[str, Any] = Field(default={}, description="Raw assessment input data")
    assessment_type: str = "comprehensive"