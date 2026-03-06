from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from .base import UUIDMixin, TimestampMixin


class LearningMilestone(BaseModel):
    title: str = Field(..., description="Title of the milestone")
    description: str = Field(..., description="Description of the milestone")
    estimated_duration: str = Field(..., description="Estimated time to complete")
    required_skills: List[str] = Field(..., description="Skills to be learned at this milestone")
    resources: List[str] = Field(..., description="Resources for this milestone")
    success_criteria: List[str] = Field(..., description="Criteria for completing this milestone")


class WeeklyPlan(BaseModel):
    week_number: int = Field(..., description="Week number in the roadmap")
    focus_area: str = Field(..., description="Focus area for the week")
    learning_objectives: List[str] = Field(..., description="Objectives for the week")
    tasks: List[str] = Field(..., description="Specific tasks to complete")
    resources: List[Dict[str, str]] = Field(..., description="Resources for the week")


class LearningRoadmap(BaseModel):
    career_track: str = Field(..., description="Target career track")
    total_duration: str = Field(..., description="Total duration of the roadmap")
    milestones: List[LearningMilestone] = Field(..., description="Milestones in the roadmap")
    weekly_plans: List[WeeklyPlan] = Field(..., description="Weekly plans")
    prerequisites: List[str] = Field(..., description="Prerequisites for the roadmap")
    success_metrics: List[str] = Field(..., description="Metrics to measure success")
    additional_resources: List[str] = Field(..., description="Additional resources")


class RoadmapInDB(LearningRoadmap, UUIDMixin, TimestampMixin):
    user_id: str
    recommendation_id: str
    assessment_id: str
    status: str = "active"  # active, completed, paused
    progress: float = Field(default=0.0, ge=0.0, le=1.0, description="Progress percentage")
    current_week: int = 1