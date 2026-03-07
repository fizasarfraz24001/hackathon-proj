from typing import Any, Dict, List

from app.services.gemini_client import gemini_client
from app.services.career_catalog import CAREER_DOMAINS, GLOBAL_PLATFORMS, LOCAL_MONTGOMERY_PROVIDERS


class CareerRecommendationAgent:
    def _is_career_in_domain(self, career: Dict[str, Any], domain: str) -> bool:
        details = CAREER_DOMAINS.get(domain, {})
        keywords = details.get("keywords", [])
        text_blob = " ".join(
            [
                career.get("title", ""),
                career.get("description", ""),
                " ".join(career.get("required_skills", []) or []),
                " ".join(career.get("entry_roles", []) or []),
            ]
        ).lower()
        return any(keyword in text_blob for keyword in keywords)

    def _build_strict_domain_fallback(self, domain: str) -> List[Dict[str, Any]]:
        source = [dict(career) for career in CAREER_DOMAINS.get(domain, {}).get("careers", [])]
        selected: List[Dict[str, Any]] = source[:3]

        if len(selected) < 3 and source:
            existing_titles = {career.get("title", "") for career in selected}
            base_skills = []
            for career in source:
                for skill in career.get("required_skills", []):
                    if skill not in base_skills:
                        base_skills.append(skill)

            domain_label = domain.replace("&", "and")
            generated_titles = [
                f"Junior {domain_label} Specialist",
                f"{domain_label} Operations Associate",
                f"{domain_label} Program Assistant",
            ]

            for title in generated_titles:
                if len(selected) >= 3:
                    break
                if title in existing_titles:
                    continue
                selected.append(
                    {
                        "title": title,
                        "description": f"Support entry-level {domain} workflows with practical hands-on execution.",
                        "required_skills": (base_skills[:4] or ["Communication", "Problem Solving", "Documentation"]),
                        "entry_roles": [f"{domain} Intern", f"Junior {domain_label} Associate"],
                    }
                )
                existing_titles.add(title)

        for career in selected:
            career["learning_resources"] = self._build_learning_resources(career.get("required_skills", []))
        return selected[:3]

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
        strict_domain = preferred_career_field if preferred_career_field in CAREER_DOMAINS else ""
        matched_domains = [strict_domain] if strict_domain else self._match_domains(interests, preferred_career_field)
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
- If preferred_career_field is provided and valid, ALL 3 careers must belong to that same field only.

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

            if strict_domain:
                if len(normalized) < 3 or not all(self._is_career_in_domain(career, strict_domain) for career in normalized):
                    return {"careers": self._build_strict_domain_fallback(strict_domain)}
            return {"careers": normalized}
        except Exception:
            if strict_domain:
                return {"careers": self._build_strict_domain_fallback(strict_domain)}

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
