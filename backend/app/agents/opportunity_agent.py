import json
from typing import Dict, Any, List
from app.agents.base_agent import BaseAgent
from app.models.recommendation import Opportunity


class OpportunityAgent(BaseAgent):
    """Agent responsible for finding and recommending career opportunities"""

    def __init__(self):
        super().__init__(
            name="OpportunityAgent",
            description="An AI agent that finds and recommends learning opportunities, internships, and courses."
        )

    async def process(self, input_data: Dict[str, Any]) -> List[Opportunity]:
        """Process and return relevant opportunities"""
        # Create system prompt
        system_prompt = self._create_system_prompt(
            "Find and recommend relevant learning opportunities, internships, courses, and resources "
            "based on user's career goals and current skill level."
        )

        # Create user prompt
        user_prompt = f"""
        Based on the following user profile, recommend relevant opportunities:

        User's Skills: {input_data.get('current_skills', [])}
        Target Career: {input_data.get('target_career', 'General')}
        Learning Goals: {input_data.get('learning_goals', [])}
        Experience Level: {input_data.get('experience_level', 'Beginner')}
        Budget Constraints: {input_data.get('budget', 'Free/Paid')}
        Time Availability: {input_data.get('time_availability', 'Flexible')}

        Provide your recommendations in the following JSON format:

        {{
            "opportunities": [
                {{
                    "type": "course/internship/resource",
                    "title": "Opportunity title",
                    "provider": "Provider name",
                    "url": "https://example.com",
                    "duration": "Time commitment",
                    "difficulty_level": "beginner/intermediate/advanced",
                    "rating": 4.5,
                    "cost": "free/paid",
                    "relevance_score": 0.9,
                    "why_recommended": "Reason for recommendation"
                }}
            ]
        }}

        Focus on:
        1. High-quality, reputable providers
        2. Opportunities that directly address skill gaps
        3. Alignment with user's career goals
        4. Realistic expectations based on user's level
        5. Mix of free and paid resources (with emphasis on free for students)
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
            opportunities_data = response_data.get("opportunities", [])

            opportunities = []
            for opp_data in opportunities_data:
                # Ensure required fields are present with defaults
                opp = Opportunity(
                    type=opp_data.get("type", "course"),
                    title=opp_data.get("title", "Recommended Opportunity"),
                    provider=opp_data.get("provider", "Various"),
                    url=opp_data.get("url", "#"),
                    duration=opp_data.get("duration"),
                    difficulty_level=opp_data.get("difficulty_level"),
                    rating=opp_data.get("rating")
                )
                opportunities.append(opp)

            return opportunities
        except json.JSONDecodeError as e:
            # Fallback response
            return [
                Opportunity(
                    type="course",
                    title="Introduction to Programming",
                    provider="freeCodeCamp",
                    url="https://freecodecamp.org",
                    duration="3-4 months",
                    difficulty_level="beginner",
                    rating=4.8
                ),
                Opportunity(
                    type="internship",
                    title="Tech Company Internship",
                    provider="LinkedIn",
                    url="https://linkedin.com/jobs",
                    duration="3 months",
                    difficulty_level="intermediate",
                    rating=4.5
                )
            ]