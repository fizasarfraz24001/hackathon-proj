import json
from typing import Dict, Any
from app.agents.base_agent import BaseAgent
from app.models.recommendation import RecommendationOutput, CareerTrack, Opportunity


class CareerAdvisorAgent(BaseAgent):
    """Agent responsible for career path recommendations"""

    def __init__(self):
        super().__init__(
            name="CareerAdvisorAgent",
            description="An AI agent that provides personalized career path recommendations based on user assessment."
        )

    async def process(self, input_data: Dict[str, Any]) -> RecommendationOutput:
        """Process user data and return career recommendations"""
        # Create system prompt
        system_prompt = self._create_system_prompt(
            "Analyze user profile to provide personalized career path recommendations, "
            "including relevant opportunities and next steps."
        )

        # Create user prompt
        user_prompt = f"""
        Based on the following user profile, provide comprehensive career recommendations:

        User Profile:
        {input_data}

        Provide your recommendations in the following JSON format:

        {{
            "career_tracks": [
                {{
                    "title": "Career Track Title",
                    "focus": "Focus area of the track",
                    "starter_role": "Entry-level position",
                    "required_skills": ["skill1", "skill2", "skill3"],
                    "salary_range": "$50,000 - $70,000",
                    "growth_potential": "High growth potential in next 5 years",
                    "industry_trend": "Growing industry with high demand"
                }}
            ],
            "opportunities": [
                {{
                    "type": "course/internship/job",
                    "title": "Opportunity title",
                    "provider": "Provider name",
                    "url": "https://example.com",
                    "duration": "6 weeks",
                    "difficulty_level": "beginner",
                    "rating": 4.5
                }}
            ],
            "confidence_score": 0.85,
            "reasoning": "Detailed reasoning for these recommendations",
            "next_steps": [
                "Step 1",
                "Step 2",
                "Step 3"
            ]
        }}

        Consider these factors when making recommendations:
        1. User's interests and skills
        2. Current market trends and job demand
        3. Career growth potential
        4. Alignment with user's goals
        5. Feasibility given user's background
        """

        # Call OpenAI API
        response_text = await self._call_openai(
            system_prompt,
            user_prompt,
            response_format={"type": "json_object"}
        )

        # Parse the response
        try:
            response_data = json.loads(response_text)

            # Convert to proper models
            career_tracks = [CareerTrack(**track) for track in response_data.get("career_tracks", [])]
            opportunities = [Opportunity(**opp) for opp in response_data.get("opportunities", [])]

            return RecommendationOutput(
                career_tracks=career_tracks,
                opportunities=opportunities,
                confidence_score=response_data.get("confidence_score", 0.8),
                reasoning=response_data.get("reasoning", "AI-generated recommendations based on user profile"),
                next_steps=response_data.get("next_steps", [])
            )
        except json.JSONDecodeError as e:
            # Fallback response
            return RecommendationOutput(
                career_tracks=[
                    CareerTrack(
                        title="Software Developer",
                        focus="Web application development",
                        starter_role="Junior Developer",
                        required_skills=["JavaScript", "Python", "SQL"],
                        salary_range="$60,000 - $80,000",
                        growth_potential="High growth potential",
                        industry_trend="Strong demand"
                    )
                ],
                opportunities=[
                    Opportunity(
                        type="course",
                        title="Complete Python Bootcamp",
                        provider="Udemy",
                        url="https://udemy.com/python-bootcamp",
                        duration="8 weeks",
                        difficulty_level="beginner",
                        rating=4.7
                    )
                ],
                confidence_score=0.7,
                reasoning="General career recommendation based on technical interests",
                next_steps=[
                    "Take a Python course",
                    "Build portfolio projects",
                    "Apply for internships"
                ]
            )