from typing import Any, Dict, List

from app.services.gemini_client import gemini_client


class SkillGapAgent:
    async def run(
        self,
        user_skills: List[str],
        required_skills: List[str],
        preferred_career_field: str = "",
        target_career: str = "",
    ) -> Dict[str, Any]:
        prompt = f"""
You are SkillGapAgent.
Compare user skills vs required skills and return JSON only.

Input:
- user_skills: {user_skills}
- required_skills: {required_skills}
- preferred_career_field: {preferred_career_field}
- target_career: {target_career}

Output schema:
{{
  "missing_skills": ["..."],
  "recommended_learning_path": ["..."]
}}
"""
        try:
            return await gemini_client.generate_json(prompt)
        except Exception:
            normalized_user = {s.lower() for s in user_skills}
            missing = [skill for skill in required_skills if skill.lower() not in normalized_user]
            return {
                "missing_skills": missing,
                "recommended_learning_path": [
                    f"Learn {skill} fundamentals for {target_career or preferred_career_field or 'your selected field'}."
                    for skill in missing[:5]
                ],
            }

    async def process(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        return await self.run(
            user_skills=input_data.get("current_skills", []),
            required_skills=input_data.get("required_skills", []),
            preferred_career_field=input_data.get("preferred_career_field", ""),
            target_career=input_data.get("target_career", ""),
        )
