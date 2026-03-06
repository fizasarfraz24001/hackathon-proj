from typing import List, Optional

from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field

from app.agents.resume_agent import ResumeAgent
from app.routes.deps import get_current_user_id
from app.services.firestore_service import firestore_service


router = APIRouter(prefix="/api", tags=["mvp-resume"])
resume_agent = ResumeAgent()


class ResumeGuidanceRequest(BaseModel):
    full_name: Optional[str] = ""
    user_skills: List[str] = Field(default_factory=list)
    career_goal: str
    education: str
    projects: Optional[List[str]] = Field(default_factory=list)


@router.post("/resume-guidance")
async def get_resume_guidance(
    payload: ResumeGuidanceRequest,
    user_id: str = Depends(get_current_user_id),
):
    result = await resume_agent.run(
        full_name=payload.full_name or "",
        user_skills=payload.user_skills,
        career_goal=payload.career_goal,
        education=payload.education,
        projects=payload.projects,
    )
    resume_id = await firestore_service.save_resume(
        user_id,
        {
            "input": payload.model_dump(),
            "output": result,
        },
    )
    return {"resume_id": resume_id, **result}


@router.post("/resume")
async def get_resume_summary(
    payload: ResumeGuidanceRequest,
    user_id: str = Depends(get_current_user_id),
):
    return await get_resume_guidance(payload=payload, user_id=user_id)


@router.get("/user-history")
async def get_user_history(
    user_id: str = Depends(get_current_user_id),
):
    history = await firestore_service.get_user_history(user_id=user_id, limit=10)
    return {"history": history}
