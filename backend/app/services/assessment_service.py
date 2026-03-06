from typing import Optional, List
from datetime import datetime
from app.models.assessment import AssessmentInput, AssessmentInDB, AssessmentResult
from app.config.database import get_firestore_db
from app.agents.assessment_agent import AssessmentAgent
from app.utils.mcp_client import mcp_client


class AssessmentService:
    """Service class for assessment management"""

    def __init__(self):
        self.db = get_firestore_db()
        self.assessment_agent = AssessmentAgent()

    async def create_assessment(self, assessment_input: AssessmentInput) -> Optional[AssessmentInDB]:
        """Create a new assessment using AI agent"""
        try:
            # Process with AI agent
            assessment_result = await self.assessment_agent.process(assessment_input.dict())

            # Generate ID for the assessment
            from uuid import uuid4
            assessment_id = str(uuid4())

            # Update the result with the ID
            assessment_result.assessment_id = assessment_id

            # Create assessment record
            assessment_record = AssessmentInDB(
                user_id=assessment_input.user_id,
                assessment_id=assessment_id,
                skill_gaps=assessment_result.skill_gaps,
                confidence_score=assessment_result.confidence_score,
                recommendations=assessment_result.recommendations,
                raw_input=assessment_input.dict(),
                created_at=datetime.now(),
                updated_at=datetime.now()
            )

            # Store in Firestore
            assessment_ref = self.db.collection('assessments').document(assessment_id)
            assessment_ref.set(assessment_record.dict())

            # Store context in MCP
            await mcp_client.store_context(
                user_id=assessment_input.user_id,
                session_id=assessment_id,
                context_type="assessment",
                data=assessment_record.dict()
            )

            return assessment_record
        except Exception as e:
            print(f"Error creating assessment: {e}")
            return None

    async def get_assessment_by_id(self, assessment_id: str) -> Optional[AssessmentInDB]:
        """Get assessment by ID"""
        try:
            assessment_doc = self.db.collection('assessments').document(assessment_id).get()
            if assessment_doc.exists:
                assessment_data = assessment_doc.to_dict()
                return AssessmentInDB(**assessment_data)
            return None
        except Exception as e:
            print(f"Error getting assessment: {e}")
            return None

    async def get_assessments_by_user(self, user_id: str) -> List[AssessmentInDB]:
        """Get all assessments for a user"""
        try:
            assessments = []
            query = self.db.collection('assessments').where('user_id', '==', user_id).order_by('created_at', direction='DESCENDING')
            docs = query.stream()

            for doc in docs:
                assessment_data = doc.to_dict()
                assessments.append(AssessmentInDB(**assessment_data))

            return assessments
        except Exception as e:
            print(f"Error getting user assessments: {e}")
            return []