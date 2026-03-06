from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from app.models.recommendation import RecommendationInDB
from app.services.recommendation_service import RecommendationService
from app.utils.firebase_auth import verify_firebase_token
from app.models.base import BaseResponse


router = APIRouter()


@router.post("/", response_model=BaseResponse)
async def generate_recommendations(
    user_id: str,
    assessment_id: str,
    token: str = Depends(verify_firebase_token)
):
    """Generate career recommendations based on user assessment"""
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials"
        )

    service = RecommendationService()
    result = await service.generate_recommendations(user_id, assessment_id)

    if not result:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate recommendations"
        )

    return BaseResponse(
        success=True,
        message="Recommendations generated successfully",
        data={"recommendation_id": result.id}
    )


@router.get("/{recommendation_id}", response_model=BaseResponse)
async def get_recommendation(
    recommendation_id: str,
    token: str = Depends(verify_firebase_token)
):
    """Get a specific recommendation by ID"""
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials"
        )

    service = RecommendationService()
    result = await service.get_recommendation_by_id(recommendation_id)

    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Recommendation not found"
        )

    return BaseResponse(
        success=True,
        message="Recommendation retrieved successfully",
        data=result
    )


@router.get("/user/{user_id}", response_model=BaseResponse)
async def get_user_recommendations(
    user_id: str,
    token: str = Depends(verify_firebase_token)
):
    """Get all recommendations for a specific user"""
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials"
        )

    service = RecommendationService()
    results = await service.get_recommendations_by_user(user_id)

    return BaseResponse(
        success=True,
        message="User recommendations retrieved successfully",
        data=results
    )