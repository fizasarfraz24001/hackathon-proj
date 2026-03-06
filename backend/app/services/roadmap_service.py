from typing import Optional, List
from datetime import datetime
from app.models.roadmap import LearningRoadmap, RoadmapInDB
from app.config.database import get_firestore_db
from app.utils.mcp_client import mcp_client


class RoadmapService:
    """Service class for learning roadmap management"""

    def __init__(self):
        self.db = get_firestore_db()

    async def generate_roadmap(self, user_id: str, recommendation_id: str) -> Optional[RoadmapInDB]:
        """Generate a personalized learning roadmap based on recommendations"""
        try:
            # Get recommendation data
            recommendation_doc = self.db.collection('recommendations').document(recommendation_id).get()
            if not recommendation_doc.exists:
                return None

            recommendation_data = recommendation_doc.to_dict()

            # Generate a basic roadmap based on recommendations
            # In a real implementation, you'd have a dedicated agent for this
            career_track = recommendation_data['career_tracks'][0] if recommendation_data['career_tracks'] else {}

            roadmap = LearningRoadmap(
                career_track=career_track.get('title', 'Career Track'),
                total_duration="6 months",
                milestones=[
                    {
                        "title": "Foundation Building",
                        "description": "Learn core concepts and basic skills",
                        "estimated_duration": "2 months",
                        "required_skills": career_track.get('required_skills', [])[:2],
                        "resources": ["Online courses", "Books", "Practice projects"],
                        "success_criteria": ["Complete 3 projects", "Pass basic skills test"]
                    },
                    {
                        "title": "Intermediate Development",
                        "description": "Build intermediate skills and understanding",
                        "estimated_duration": "2 months",
                        "required_skills": career_track.get('required_skills', [])[2:4],
                        "resources": ["Advanced courses", "Mentorship", "Real projects"],
                        "success_criteria": ["Complete 2 complex projects", "Get feedback from peers"]
                    },
                    {
                        "title": "Advanced Application",
                        "description": "Apply skills to real-world scenarios",
                        "estimated_duration": "2 months",
                        "required_skills": career_track.get('required_skills', [])[4:],
                        "resources": ["Capstone project", "Internship", "Portfolio building"],
                        "success_criteria": ["Build portfolio", "Get endorsement", "Apply for roles"]
                    }
                ],
                weekly_plans=[
                    {
                        "week_number": 1,
                        "focus_area": "Introduction and Setup",
                        "learning_objectives": ["Understand basic concepts", "Set up development environment"],
                        "tasks": ["Read introductory materials", "Install necessary software", "Complete first tutorial"],
                        "resources": [
                            {"type": "video", "link": "https://example.com/intro"},
                            {"type": "article", "link": "https://example.com/setup"}
                        ]
                    },
                    {
                        "week_number": 2,
                        "focus_area": "Basic Skills",
                        "learning_objectives": ["Learn fundamental skills"],
                        "tasks": ["Complete basic tutorials", "Practice exercises", "Build simple project"],
                        "resources": [
                            {"type": "course", "link": "https://example.com/basic-skills"},
                            {"type": "exercise", "link": "https://example.com/practice"}
                        ]
                    }
                    # Additional weeks would be generated based on full implementation
                ],
                prerequisites=career_track.get('required_skills', []),
                success_metrics=[
                    "Complete all milestones",
                    "Build a portfolio of projects",
                    "Demonstrate learned skills",
                    "Apply for relevant positions"
                ],
                additional_resources=[
                    "https://example.com/community",
                    "https://example.com/forums",
                    "https://example.com/practice-platforms"
                ]
            )

            # Generate ID for the roadmap
            from uuid import uuid4
            roadmap_id = str(uuid4())

            # Create roadmap record
            roadmap_record = RoadmapInDB(
                id=roadmap_id,
                user_id=user_id,
                recommendation_id=recommendation_id,
                assessment_id=recommendation_data.get('assessment_id', ''),
                career_track=roadmap.career_track,
                total_duration=roadmap.total_duration,
                milestones=roadmap.milestones,
                weekly_plans=roadmap.weekly_plans,
                prerequisites=roadmap.prerequisites,
                success_metrics=roadmap.success_metrics,
                additional_resources=roadmap.additional_resources,
                created_at=datetime.now(),
                updated_at=datetime.now()
            )

            # Store in Firestore
            roadmap_ref = self.db.collection('learning_roadmaps').document(roadmap_id)
            roadmap_ref.set(roadmap_record.dict())

            # Store context in MCP
            await mcp_client.store_context(
                user_id=user_id,
                session_id=roadmap_id,
                context_type="roadmap",
                data=roadmap_record.dict()
            )

            return roadmap_record
        except Exception as e:
            print(f"Error generating roadmap: {e}")
            return None

    async def get_roadmap_by_id(self, roadmap_id: str) -> Optional[RoadmapInDB]:
        """Get roadmap by ID"""
        try:
            roadmap_doc = self.db.collection('learning_roadmaps').document(roadmap_id).get()
            if roadmap_doc.exists:
                roadmap_data = roadmap_doc.to_dict()
                return RoadmapInDB(**roadmap_data)
            return None
        except Exception as e:
            print(f"Error getting roadmap: {e}")
            return None

    async def get_roadmaps_by_user(self, user_id: str) -> List[RoadmapInDB]:
        """Get all roadmaps for a user"""
        try:
            roadmaps = []
            query = self.db.collection('learning_roadmaps').where('user_id', '==', user_id).order_by('created_at', direction='DESCENDING')
            docs = query.stream()

            for doc in docs:
                roadmap_data = doc.to_dict()
                roadmaps.append(RoadmapInDB(**roadmap_data))

            return roadmaps
        except Exception as e:
            print(f"Error getting user roadmaps: {e}")
            return []