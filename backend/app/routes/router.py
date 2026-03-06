from fastapi import APIRouter

from app.routes import assessment, recommendations, resume


mvp_router = APIRouter()
mvp_router.include_router(assessment.router)
mvp_router.include_router(recommendations.router)
mvp_router.include_router(resume.router)
