from fastapi import APIRouter
from app.api.v1.routes import assessment, recommendations, roadmap


api_router = APIRouter()

# Include assessment routes
api_router.include_router(
    assessment.router,
    prefix="/assessment",
    tags=["assessment"]
)

# Include recommendation routes
api_router.include_router(
    recommendations.router,
    prefix="/recommendations",
    tags=["recommendations"]
)

# Include roadmap routes
api_router.include_router(
    roadmap.router,
    prefix="/roadmap",
    tags=["roadmap"]
)