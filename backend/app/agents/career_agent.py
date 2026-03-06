from typing import Any, Dict, List

from app.services.gemini_client import gemini_client
from app.services.career_catalog import CAREER_DOMAINS, GLOBAL_PLATFORMS, LOCAL_MONTGOMERY_PROVIDERS


class CareerRecommendationAgent:
    def _match_domains(self, interests: List[str], preferred_career_field: str) -> List[str]:
        normalized = " ".join(interests + ([preferred_career_field] if preferred_career_field else [])).lower()
        matched = []
        for domain, details in CAREER_DOMAINS.items():
            if any(keyword in normalized for keyword in details["keywords"]):
                matched.append(domain)
        if not matched and preferred_career_field in CAREER_DOMAINS:
            matched.append(preferred_career_field)
        if not matched:
            matched = ["Technology & IT", "Business & Management", "Healthcare & Medical"]
        return matched[:3]

    def _build_learning_resources(self, required_skills: List[str]) -> List[Dict[str, str]]:
        resources = []
        for idx, skill in enumerate(required_skills[:3]):
            platform = GLOBAL_PLATFORMS[idx % len(GLOBAL_PLATFORMS)]
            resources.append(
                {
                    "title": f"{skill} Fundamentals",
                    "platform": platform,
                    "link": "https://www.coursera.org" if platform == "Coursera" else "https://www.edx.org",
                    "skill": skill,
                }
            )
        resources.append(
            {
                "title": "Local Career Pathway Program",
                "platform": LOCAL_MONTGOMERY_PROVIDERS[0]["name"],
                "link": LOCAL_MONTGOMERY_PROVIDERS[0]["link"],
                "skill": "Career Readiness",
            }
        )
        return resources

    async def run(
        self,
        interests: List[str],
        skills: List[str],
        education_level: str,
        preferred_career_field: str = "",
    ) -> Dict[str, Any]:
        matched_domains = self._match_domains(interests, preferred_career_field)
        prompt = f"""
You are CareerRecommendationAgent.
Generate exactly 3 realistic career recommendations in valid JSON only for diverse academic backgrounds.

Input:
- interests: {interests}
- skills: {skills}
- education_level: {education_level}
- preferred_career_field: {preferred_career_field}
- matched_domains: {matched_domains}

Guidance:
- Include domains from: Technology, Healthcare, Business, Finance, Marketing, Education, Design, Engineering, Law, Social Work, Hospitality, Skilled Trades, Public Service.
- Keep recommendations practical for youth and early-career profiles.

Return JSON only with this schema:
{{
  "careers": [
    {{
      "title": "Frontend Developer",
      "description": "short practical description",
      "required_skills": ["React", "JavaScript", "Git"],
      "entry_roles": ["Junior Web Developer", "Frontend Intern"],
      "learning_resources": [
        {{"title":"Course","platform":"Coursera","link":"https://...","skill":"React"}}
      ]
    }}
  ]
}}
"""
        try:
            data = await gemini_client.generate_json(prompt)
            careers = data.get("careers", [])
            normalized = []
            for career in careers[:3]:
                career.setdefault("learning_resources", self._build_learning_resources(career.get("required_skills", [])))
                normalized.append(career)
            return {"careers": normalized}
        except Exception:
            selected = []
            for domain in matched_domains:
                selected.extend([dict(career) for career in CAREER_DOMAINS[domain]["careers"][:1]])
            if len(selected) < 3:
                for domain, details in CAREER_DOMAINS.items():
                    for career in details["careers"]:
                        if len(selected) >= 3:
                            break
                        if career["title"] not in [c["title"] for c in selected]:
                            selected.append(dict(career))
            for career in selected:
                career["learning_resources"] = self._build_learning_resources(career.get("required_skills", []))
            return {"careers": selected[:3]}
