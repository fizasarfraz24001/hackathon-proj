from typing import Optional, List
from datetime import datetime
from app.models.recommendation import RecommendationOutput, RecommendationInDB
from app.config.database import get_firestore_db
from app.agents.career_advisor_agent import CareerAdvisorAgent
from app.agents.opportunity_agent import OpportunityAgent
from app.utils.mcp_client import mcp_client


class RecommendationService:
    """Service class for recommendation management"""

    def __init__(self):
        self.db = get_firestore_db()
        self.career_advisor_agent = CareerAdvisorAgent()
        self.opportunity_agent = OpportunityAgent()

    async def generate_recommendations(self, user_id: str, assessment_id: str) -> Optional[RecommendationInDB]:
        """Generate career recommendations based on user assessment"""
        try:
            # Get assessment data
            assessment_doc = self.db.collection('assessments').document(assessment_id).get()
            if not assessment_doc.exists:
                return None

            assessment_data = assessment_doc.to_dict()

            # Prepare input for agents
            input_data = {
                "user_profile": {
                    "user_id": user_id,
                    "interests": assessment_data['raw_input'].get('interests', []),
                    "current_skills": assessment_data['raw_input'].get('current_skills', []),
                    "education_level": assessment_data['raw_input'].get('education_level', ''),
                    "career_goals": assessment_data['raw_input'].get('career_goals', ''),
                    "personality_traits": assessment_data['raw_input'].get('personality_traits', []),
                    "work_preferences": assessment_data['raw_input'].get('work_preferences', {})
                },
                "skill_gaps": assessment_data['skill_gaps']
            }

            # Generate career recommendations
            career_recommendations = await self.career_advisor_agent.process(input_data)

            # Generate opportunity recommendations
            opportunity_input = {
                "current_skills": assessment_data['raw_input'].get('current_skills', []),
                "target_career": career_recommendations.career_tracks[0].title if career_recommendations.career_tracks else "General",
                "learning_goals": [track.title for track in career_recommendations.career_tracks],
                "experience_level": "Beginner"  # This would come from assessment data
            }
            opportunities = await self.opportunity_agent.process(opportunity_input)

            # Combine results
            final_recommendations = RecommendationOutput(
                career_tracks=career_recommendations.career_tracks,
                opportunities=opportunities,
                confidence_score=career_recommendations.confidence_score,
                reasoning=career_recommendations.reasoning,
                next_steps=career_recommendations.next_steps
            )

            # Generate ID for the recommendation
            from uuid import uuid4
            recommendation_id = str(uuid4())

            # Create recommendation record
            recommendation_record = RecommendationInDB(
                id=recommendation_id,
                user_id=user_id,
                assessment_id=assessment_id,
                career_tracks=final_recommendations.career_tracks,
                opportunities=final_recommendations.opportunities,
                confidence_score=final_recommendations.confidence_score,
                reasoning=final_recommendations.reasoning,
                next_steps=final_recommendations.next_steps,
                created_at=datetime.now(),
                updated_at=datetime.now()
            )

            # Store in Firestore
            recommendation_ref = self.db.collection('recommendations').document(recommendation_id)
            recommendation_ref.set(recommendation_record.dict())

            # Store context in MCP
            await mcp_client.store_context(
                user_id=user_id,
                session_id=recommendation_id,
                context_type="recommendation",
                data=recommendation_record.dict()
            )

            return recommendation_record
        except Exception as e:
            print(f"Error generating recommendations: {e}")
            return None

    async def get_recommendation_by_id(self, recommendation_id: str) -> Optional[RecommendationInDB]:
        """Get recommendation by ID"""
        try:
            recommendation_doc = self.db.collection('recommendations').document(recommendation_id).get()
            if recommendation_doc.exists:
                recommendation_data = recommendation_doc.to_dict()
                return RecommendationInDB(**recommendation_data)
            return None
        except Exception as e:
            print(f"Error getting recommendation: {e}")
            return None

    async def get_recommendations_by_user(self, user_id: str) -> List[RecommendationInDB]:
        """Get all recommendations for a user"""
        try:
            recommendations = []
            query = self.db.collection('recommendations').where('user_id', '==', user_id).order_by('created_at', direction='DESCENDING')
            docs = query.stream()

            for doc in docs:
                recommendation_data = doc.to_dict()
                recommendations.append(RecommendationInDB(**recommendation_data))

            return recommendations
        except Exception as e:
            print(f"Error getting user recommendations: {e}")
            return []