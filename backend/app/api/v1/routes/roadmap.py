from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from app.models.roadmap import RoadmapInDB
from app.services.roadmap_service import RoadmapService
from app.utils.firebase_auth import verify_firebase_token
from app.models.base import BaseResponse


router = APIRouter()


@router.post("/", response_model=BaseResponse)
async def generate_learning_roadmap(
    user_id: str,
    recommendation_id: str,
    token: str = Depends(verify_firebase_token)
):
    """Generate a personalized learning roadmap based on recommendations"""
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials"
        )

    service = RoadmapService()
    result = await service.generate_roadmap(user_id, recommendation_id)

    if not result:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate learning roadmap"
        )

    return BaseResponse(
        success=True,
        message="Learning roadmap generated successfully",
        data={"roadmap_id": result.id}
    )


@router.get("/{roadmap_id}", response_model=BaseResponse)
async def get_roadmap(
    roadmap_id: str,
    token: str = Depends(verify_firebase_token)
):
    """Get a specific learning roadmap by ID"""
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials"
        )

    service = RoadmapService()
    result = await service.get_roadmap_by_id(roadmap_id)

    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Learning roadmap not found"
        )

    return BaseResponse(
        success=True,
        message="Learning roadmap retrieved successfully",
        data=result
    )


@router.get("/user/{user_id}", response_model=BaseResponse)
async def get_user_roadmaps(
    user_id: str,
    token: str = Depends(verify_firebase_token)
):
    """Get all learning roadmaps for a specific user"""
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials"
        )

    service = RoadmapService()
    results = await service.get_roadmaps_by_user(user_id)

    return BaseResponse(
        success=True,
        message="User roadmaps retrieved successfully",
        data=results
    )