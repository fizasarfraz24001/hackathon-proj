from typing import Any, Dict, List

from app.services.gemini_client import gemini_client
from app.services.career_catalog import GLOBAL_PLATFORMS, LOCAL_MONTGOMERY_PROVIDERS


class LearningResourceAgent:
    async def run(self, missing_skills: List[str], preferred_career_field: str = "") -> Dict[str, Any]:
        prompt = f"""
You are LearningResourceAgent.
Recommend free or affordable learning resources for missing skills.
Use global platforms and Montgomery, Alabama local providers.
Return JSON only.

Input:
- missing_skills: {missing_skills}
- preferred_career_field: {preferred_career_field}

Global platforms:
- Coursera, edX, Khan Academy, FutureLearn, Udemy, Google Career Certificates, DigiSkills

Local platforms:
- Auburn University at Montgomery
- Trenholm State Community College
- Troy University Montgomery Campus
- Montgomery City-County Public Library learning programs
- Alabama Career Center training programs

Output schema:
{{
  "courses": [
    {{
      "title": "Course Name",
      "platform": "Coursera",
      "link": "https://...",
      "skill": "React"
    }}
  ]
}}
"""
        try:
            return await gemini_client.generate_json(prompt)
        except Exception:
            defaults = []
            for idx, skill in enumerate(missing_skills[:4]):
                platform = GLOBAL_PLATFORMS[idx % len(GLOBAL_PLATFORMS)]
                defaults.append(
                    {
                        "title": f"Introduction to {skill}",
                        "platform": platform,
                        "link": "https://www.coursera.org" if platform == "Coursera" else "https://www.khanacademy.org",
                        "skill": skill,
                    }
                )
            defaults.append(
                {
                    "title": f"{preferred_career_field or 'Career'} pathway training",
                    "platform": LOCAL_MONTGOMERY_PROVIDERS[0]["name"],
                    "link": LOCAL_MONTGOMERY_PROVIDERS[0]["link"],
                    "skill": preferred_career_field or "Career Readiness",
                }
            )
            defaults.append(
                {
                    "title": "Community upskilling workshop",
                    "platform": LOCAL_MONTGOMERY_PROVIDERS[4]["name"],
                    "link": LOCAL_MONTGOMERY_PROVIDERS[4]["link"],
                    "skill": "Employability Skills",
                }
            )
            if not defaults:
                defaults = [
                    {
                        "title": "Freelancing Essentials",
                        "platform": "DigiSkills",
                        "link": "https://digiskills.pk",
                        "skill": "Career Readiness",
                    }
                ]
            return {"courses": defaults}
