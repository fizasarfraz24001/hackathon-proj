from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field

from app.agents.career_agent import CareerRecommendationAgent
from app.agents.learning_agent import LearningResourceAgent
from app.agents.skill_gap_agent import SkillGapAgent
from app.routes.deps import get_current_user_id
from app.services.firestore_service import firestore_service
from app.services.career_catalog import LOCAL_MONTGOMERY_PROVIDERS


router = APIRouter(prefix="/api", tags=["mvp-recommendations"])

career_agent = CareerRecommendationAgent()
skill_gap_agent = SkillGapAgent()
learning_agent = LearningResourceAgent()


class CareerRecommendationsRequest(BaseModel):
    interests: List[str] = Field(default_factory=list)
    skills: List[str] = Field(default_factory=list)
    education_level: str = ""
    preferred_career_field: str = ""
    career_goals: str = ""


class SkillGapRequest(BaseModel):
    user_skills: List[str] = Field(default_factory=list)
    required_skills: List[str] = Field(default_factory=list)
    preferred_career_field: str = ""
    target_career: str = ""


class LearningResourcesRequest(BaseModel):
    missing_skills: List[str] = Field(default_factory=list)
    preferred_career_field: str = ""


@router.post("/career-recommendations")
async def get_career_recommendations(
    payload: CareerRecommendationsRequest,
    user_id: str = Depends(get_current_user_id),
):
    interests = payload.interests
    skills = payload.skills
    education_level = payload.education_level
    preferred_career_field = payload.preferred_career_field

    if not interests and not skills and not education_level:
        latest_assessment = await firestore_service.get_latest_assessment(user_id)
        if not latest_assessment:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No assessment found. Submit assessment first.",
            )
        interests = latest_assessment.get("interests", [])
        skills = latest_assessment.get("skills", [])
        education_level = latest_assessment.get("education_level", "")
        preferred_career_field = latest_assessment.get("preferred_career_field", "")

    result = await career_agent.run(
        interests=interests,
        skills=skills,
        education_level=education_level,
        preferred_career_field=preferred_career_field,
    )
    rec_id = await firestore_service.save_recommendation(
        user_id,
        {
            "type": "career_recommendation",
            "input": {
                "interests": interests,
                "skills": skills,
                "education_level": education_level,
                "preferred_career_field": preferred_career_field,
            },
            "output": result,
        },
    )
    return {"recommendation_id": rec_id, **result}


@router.post("/recommendations")
async def get_full_recommendations(
    payload: CareerRecommendationsRequest,
    user_id: str = Depends(get_current_user_id),
):
    latest_assessment = await firestore_service.get_latest_assessment(user_id)

    interests = payload.interests or (latest_assessment or {}).get("interests", [])
    skills = payload.skills or (latest_assessment or {}).get("skills", [])
    education_level = payload.education_level or (latest_assessment or {}).get("education_level", "")
    preferred_career_field = payload.preferred_career_field or (latest_assessment or {}).get("preferred_career_field", "")
    career_goals = payload.career_goals or (latest_assessment or {}).get("career_goals", "")

    careers_data = await career_agent.run(
        interests=interests,
        skills=skills,
        education_level=education_level,
        preferred_career_field=preferred_career_field,
    )
    careers = careers_data.get("careers", [])
    primary_required_skills = careers[0].get("required_skills", []) if careers else []

    primary_career_title = careers[0].get("title", "") if careers else ""
    skill_gap = await skill_gap_agent.run(
        user_skills=skills,
        required_skills=primary_required_skills,
        preferred_career_field=preferred_career_field,
        target_career=primary_career_title,
    )
    courses_data = await learning_agent.run(
        missing_skills=skill_gap.get("missing_skills", []),
        preferred_career_field=preferred_career_field,
    )

    learning_roadmap = skill_gap.get("recommended_learning_path", [])
    result = {
        "careers": careers,
        "skill_gap_analysis": skill_gap,
        "learning_roadmap": learning_roadmap,
        "courses": courses_data.get("courses", []),
        "local_learning_programs": LOCAL_MONTGOMERY_PROVIDERS,
        "profile_context": {
            "education_level": education_level,
            "career_goals": career_goals,
            "preferred_career_field": preferred_career_field,
                "target_career": primary_career_title,
        },
    }

    rec_id = await firestore_service.save_recommendation(
        user_id,
        {
            "type": "full_recommendation",
            "input": {
                "interests": interests,
                "skills": skills,
                "education_level": education_level,
                "preferred_career_field": preferred_career_field,
                "career_goals": career_goals,
            },
            "output": result,
        },
    )
    return {"recommendation_id": rec_id, **result}


@router.post("/skill-gap-analysis")
async def get_skill_gap_analysis(
    payload: SkillGapRequest,
    user_id: str = Depends(get_current_user_id),
):
    user_skills = payload.user_skills
    required_skills = payload.required_skills
    preferred_career_field = payload.preferred_career_field
    target_career = payload.target_career

    if not user_skills:
        latest_assessment = await firestore_service.get_latest_assessment(user_id)
        if latest_assessment:
            user_skills = latest_assessment.get("skills", [])

    if not required_skills:
        latest_career = await firestore_service.get_latest_recommendation_by_type(
            user_id, "career_recommendation"
        )
        if latest_career:
            careers = latest_career.get("output", {}).get("careers", [])
            if careers:
                required_skills = careers[0].get("required_skills", [])

    if not required_skills:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="required_skills missing and no previous recommendations found.",
        )

    if not preferred_career_field:
        latest_assessment = await firestore_service.get_latest_assessment(user_id)
        if latest_assessment:
            preferred_career_field = latest_assessment.get("preferred_career_field", "")

    result = await skill_gap_agent.run(
        user_skills=user_skills,
        required_skills=required_skills,
        preferred_career_field=preferred_career_field,
        target_career=target_career,
    )
    gap_id = await firestore_service.save_recommendation(
        user_id,
        {
            "type": "skill_gap",
            "input": {
                "user_skills": user_skills,
                "required_skills": required_skills,
                "preferred_career_field": preferred_career_field,
                "target_career": target_career,
            },
            "output": result,
        },
    )
    return {"analysis_id": gap_id, **result}


@router.post("/learning-resources")
async def get_learning_resources(
    payload: LearningResourcesRequest,
    user_id: str = Depends(get_current_user_id),
):
    missing_skills = payload.missing_skills
    preferred_career_field = payload.preferred_career_field

    if not missing_skills:
        latest_gap = await firestore_service.get_latest_recommendation_by_type(user_id, "skill_gap")
        if latest_gap:
            missing_skills = latest_gap.get("output", {}).get("missing_skills", [])

    if not preferred_career_field:
        latest_assessment = await firestore_service.get_latest_assessment(user_id)
        if latest_assessment:
            preferred_career_field = latest_assessment.get("preferred_career_field", "")

    result = await learning_agent.run(
        missing_skills=missing_skills,
        preferred_career_field=preferred_career_field,
    )
    resource_id = await firestore_service.save_recommendation(
        user_id,
        {
            "type": "learning_resources",
            "input": {"missing_skills": missing_skills, "preferred_career_field": preferred_career_field},
            "output": result,
        },
    )
    return {"resource_id": resource_id, **result}
