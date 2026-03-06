from typing import List

from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field

from app.routes.deps import get_current_user_id
from app.services.firestore_service import firestore_service


router = APIRouter(prefix="/api", tags=["mvp-assessment"])


class AssessmentRequest(BaseModel):
    interests: List[str] = Field(default_factory=list)
    skills: List[str] = Field(default_factory=list)
    education_level: str
    preferred_career_field: str = ""
    career_goals: str = ""


@router.post("/assessment")
async def create_assessment(
    payload: AssessmentRequest,
    user_id: str = Depends(get_current_user_id),
):
    assessment_doc = {
        "interests": payload.interests,
        "skills": payload.skills,
        "education_level": payload.education_level,
        "preferred_career_field": payload.preferred_career_field,
        "career_goals": payload.career_goals,
    }
    assessment_id = await firestore_service.save_assessment(user_id, assessment_doc)
    return {"assessment_id": assessment_id, "user_id": user_id, "assessment": assessment_doc}


@router.get("/assessment/latest")
async def get_latest_assessment(
    user_id: str = Depends(get_current_user_id),
):
    assessment = await firestore_service.get_latest_assessment(user_id)
    if not assessment:
        return {"assessment": None}
    return {"assessment": assessment}
