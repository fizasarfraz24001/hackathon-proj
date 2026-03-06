from typing import Any, Dict, List, Optional

from app.services.gemini_client import gemini_client


class ResumeAgent:
    async def run(
        self,
        full_name: str,
        user_skills: List[str],
        career_goal: str,
        education: str,
        projects: Optional[List[str]] = None,
    ) -> Dict[str, Any]:
        prompt = f"""
You are ResumeAgent.
Generate concise resume and interview guidance for early-career youth.
Return strict JSON only.

Input:
- full_name: {full_name}
- user_skills: {user_skills}
- career_goal: {career_goal}
- education: {education}
- projects: {projects or []}

Output schema:
{{
  "resume_sections": {{
    "full_name": "",
    "professional_title": "",
    "professional_summary": "",
    "core_skills": [],
    "projects": [],
    "education": [],
    "achievements": []
  }},
  "resume_summary": "",
  "improved_skill_descriptions": [],
  "bullet_point_achievements": [],
  "interview_tips": []
}}
"""
        try:
            return await gemini_client.generate_json(prompt)
        except Exception:
            return {
                "resume_sections": {
                    "full_name": full_name or "Candidate Name",
                    "professional_title": career_goal or "Early Career Professional",
                    "professional_summary": f"A motivated candidate pursuing {career_goal} with practical learning mindset.",
                    "core_skills": user_skills[:8],
                    "projects": projects or [],
                    "education": [education] if education else [],
                    "achievements": [
                        "Built and shipped hands-on portfolio projects.",
                        "Collaborated with peers and used version control in project workflows.",
                    ],
                },
                "resume_summary": f"A motivated candidate pursuing {career_goal} with practical learning mindset.",
                "improved_skill_descriptions": [
                    f"{skill}: applied in guided projects and continuously improving." for skill in user_skills[:5]
                ],
                "bullet_point_achievements": [
                    "Built and shipped hands-on portfolio projects.",
                    "Collaborated with peers and used version control in project workflows.",
                ],
                "interview_tips": [
                    "Use STAR method for behavioral answers.",
                    "Show one concrete project per core skill.",
                    "Prepare questions about growth, mentorship, and team processes.",
                ],
            }
