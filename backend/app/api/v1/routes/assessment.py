from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from app.models.assessment import AssessmentInput, AssessmentInDB
from app.services.assessment_service import AssessmentService
from app.utils.firebase_auth import verify_firebase_token
from app.models.base import BaseResponse


router = APIRouter()


@router.post("/", response_model=BaseResponse)
async def create_assessment(
    assessment_input: AssessmentInput,
    token: str = Depends(verify_firebase_token)
):
    """Create a new career assessment for the authenticated user"""
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials"
        )

    service = AssessmentService()
    result = await service.create_assessment(assessment_input)

    if not result:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create assessment"
        )

    return BaseResponse(
        success=True,
        message="Assessment created successfully",
        data={"assessment_id": result.assessment_id}
    )


@router.get("/{assessment_id}", response_model=BaseResponse)
async def get_assessment(
    assessment_id: str,
    token: str = Depends(verify_firebase_token)
):
    """Get a specific assessment by ID"""
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials"
        )

    service = AssessmentService()
    result = await service.get_assessment_by_id(assessment_id)

    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Assessment not found"
        )

    return BaseResponse(
        success=True,
        message="Assessment retrieved successfully",
        data=result
    )


@router.get("/user/{user_id}", response_model=BaseResponse)
async def get_user_assessments(
    user_id: str,
    token: str = Depends(verify_firebase_token)
):
    """Get all assessments for a specific user"""
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials"
        )

    service = AssessmentService()
    results = await service.get_assessments_by_user(user_id)

    return BaseResponse(
        success=True,
        message="User assessments retrieved successfully",
        data=results
    )