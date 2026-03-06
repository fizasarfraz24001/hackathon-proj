import json
from typing import Dict, Any, List
from app.agents.base_agent import BaseAgent
from app.models.assessment import AssessmentInput, SkillGapAnalysis, AssessmentResult


class AssessmentAgent(BaseAgent):
    """Agent responsible for comprehensive user assessment"""

    def __init__(self):
        super().__init__(
            name="AssessmentAgent",
            description="An AI agent that performs comprehensive user assessment based on interests, skills, education, and goals."
        )

    async def process(self, input_data: Dict[str, Any]) -> AssessmentResult:
        """Process user assessment data and return skill gap analysis"""
        assessment_input = AssessmentInput(**input_data)

        # Create system prompt
        system_prompt = self._create_system_prompt(
            "Analyze user's career interests, skills, education level, and goals to identify skill gaps "
            "and provide personalized assessment results."
        )

        # Create user prompt
        user_prompt = f"""
        Analyze the following user data and provide a comprehensive skill gap analysis:

        User Profile:
        - Interests: {assessment_input.interests}
        - Current Skills: {assessment_input.current_skills}
        - Education Level: {assessment_input.education_level}
        - Career Goals: {assessment_input.career_goals}
        - Personality Traits: {assessment_input.personality_traits}
        - Work Preferences: {assessment_input.work_preferences}

        Provide your analysis in the following JSON format:

        {{
            "skill_gaps": {{
                "missing_skills": ["list of skills user needs"],
                "priority_skills": ["top 3-5 skills to learn first"],
                "learning_difficulty": {{"skill_name": "beginner/intermediate/advanced"}},
                "estimated_time": {{"skill_name": "time_estimate"}}
            }},
            "confidence_score": 0.85,
            "recommendations": ["list of general recommendations"],
            "assessment_insights": "brief summary of key insights"
        }}

        Focus on identifying the most critical skill gaps for the user's career goals and prioritize skills based on:
        1. Market demand
        2. Difficulty of learning
        3. Time to acquire
        4. Impact on career progression
        """

        # Call OpenAI API
        response_text = await self._call_openai(system_prompt, user_prompt)

        # Parse the response
        try:
            response_data = json.loads(response_text)
            skill_gaps = SkillGapAnalysis(**response_data["skill_gaps"])

            return AssessmentResult(
                user_id=assessment_input.user_id,
                assessment_id="",  # Will be set by the service
                skill_gaps=skill_gaps,
                confidence_score=response_data.get("confidence_score", 0.8),
                recommendations=response_data.get("recommendations", []),
            )
        except json.JSONDecodeError as e:
            # Fallback response if JSON parsing fails
            return AssessmentResult(
                user_id=assessment_input.user_id,
                assessment_id="",
                skill_gaps=SkillGapAnalysis(
                    missing_skills=["Technical skills", "Soft skills", "Industry knowledge"],
                    priority_skills=["Technical skills", "Soft skills"],
                    learning_difficulty={"Technical skills": "intermediate"},
                    estimated_time={"Technical skills": "3-6 months"}
                ),
                confidence_score=0.7,
                recommendations=["Focus on core technical skills", "Develop communication abilities"]
            )