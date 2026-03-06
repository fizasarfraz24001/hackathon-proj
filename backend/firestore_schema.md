




# Firestore Database Schema

## Collections Structure

### 1. Users Collection (`users`)
**Document ID**: Firebase UID
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "full_name": "John Doe",
  "education_level": "University Student",
  "current_skills": ["JavaScript", "Python"],
  "career_interests": ["Technology", "Design"],
  "career_goals": "Become a software engineer",
  "is_active": true,
  "created_at": "2023-10-01T12:00:00Z",
  "updated_at": "2023-10-01T12:00:00Z",
  "last_login": "2023-10-01T12:00:00Z"
}
```

### 2. Assessments Collection (`assessments`)
**Document ID**: UUID
```json
{
  "id": "uuid",
  "user_id": "firebase_uid",
  "assessment_id": "uuid",
  "skill_gaps": {
    "missing_skills": ["Data Structures", "Algorithms"],
    "priority_skills": ["Data Structures"],
    "learning_difficulty": {
      "Data Structures": "intermediate"
    },
    "estimated_time": {
      "Data Structures": "3 months"
    }
  },
  "confidence_score": 0.85,
  "recommendations": ["Focus on core programming concepts"],
  "raw_input": {
    "interests": ["Technology"],
    "current_skills": ["JavaScript"],
    "education_level": "University Student"
  },
  "assessment_type": "comprehensive",
  "created_at": "2023-10-01T12:00:00Z",
  "updated_at": "2023-10-01T12:00:00Z"
}
```

### 3. Recommendations Collection (`recommendations`)
**Document ID**: UUID
```json
{
  "id": "uuid",
  "user_id": "firebase_uid",
  "assessment_id": "assessment_uuid",
  "career_tracks": [
    {
      "title": "Software Developer",
      "focus": "Web application development",
      "starter_role": "Junior Developer",
      "required_skills": ["JavaScript", "Python", "SQL"],
      "salary_range": "$60,000 - $80,000",
      "growth_potential": "High growth potential",
      "industry_trend": "Strong demand"
    }
  ],
  "opportunities": [
    {
      "type": "course",
      "title": "Complete Python Bootcamp",
      "provider": "Udemy",
      "url": "https://udemy.com/python-bootcamp",
      "duration": "8 weeks",
      "difficulty_level": "beginner",
      "rating": 4.7
    }
  ],
  "confidence_score": 0.85,
  "reasoning": "Based on your interest in technology and current JavaScript skills",
  "next_steps": [
    "Take a Python course",
    "Build portfolio projects",
    "Apply for internships"
  ],
  "source": "ai_agent",
  "is_primary": true,
  "created_at": "2023-10-01T12:00:00Z",
  "updated_at": "2023-10-01T12:00:00Z"
}
```

### 4. Learning Roadmaps Collection (`learning_roadmaps`)
**Document ID**: UUID
```json
{
  "id": "uuid",
  "user_id": "firebase_uid",
  "recommendation_id": "recommendation_uuid",
  "assessment_id": "assessment_uuid",
  "career_track": "Software Developer",
  "total_duration": "6 months",
  "milestones": [
    {
      "title": "Foundation Building",
      "description": "Learn core concepts and basic skills",
      "estimated_duration": "2 months",
      "required_skills": ["HTML", "CSS"],
      "resources": ["Online courses", "Books"],
      "success_criteria": ["Complete 3 projects"]
    }
  ],
  "weekly_plans": [
    {
      "week_number": 1,
      "focus_area": "Introduction and Setup",
      "learning_objectives": ["Understand basic concepts"],
      "tasks": ["Read introductory materials"],
      "resources": [
        {
          "type": "video",
          "link": "https://example.com/intro"
        }
      ]
    }
  ],
  "prerequisites": ["Basic programming knowledge"],
  "success_metrics": [
    "Complete all milestones",
    "Build a portfolio of projects"
  ],
  "additional_resources": [
    "https://example.com/community"
  ],
  "status": "active",
  "progress": 0.0,
  "current_week": 1,
  "created_at": "2023-10-01T12:00:00Z",
  "updated_at": "2023-10-01T12:00:00Z"
}
```

### 5. Resume Feedback Collection (Optional) (`resume_feedback`)
**Document ID**: UUID
```json
{
  "id": "uuid",
  "user_id": "firebase_uid",
  "resume_file_url": "https://storage.googleapis.com/...",
  "feedback": {
    "strengths": ["Good project descriptions"],
    "improvements": ["Add more quantifiable achievements"],
    "ats_score": 85,
    "keyword_analysis": {
      "missing_keywords": ["Agile", "JavaScript"],
      "suggested_keywords": ["Full-stack", "React"]
    }
  },
  "suggestions": ["Add metrics to project descriptions"],
  "created_at": "2023-10-01T12:00:00Z",
  "updated_at": "2023-10-01T12:00:00Z"
}
```

## Indexes for Efficient Queries

1. **Users Collection**:
   - By email (for login)
   - By creation date

2. **Assessments Collection**:
   - By user_id (for user's assessments)
   - By user_id and creation date (for chronological order)

3. **Recommendations Collection**:
   - By user_id (for user's recommendations)
   - By assessment_id (for recommendations linked to assessment)

4. **Learning Roadmaps Collection**:
   - By user_id (for user's roadmaps)
   - By recommendation_id (for roadmaps linked to recommendations)
   - By status (for filtering active/paused/completed roadmaps)

## Security Rules Example

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Assessments can only be accessed by the user who created them
    match /assessments/{assessmentId} {
      allow read, write: if request.auth != null &&
        resource.data.user_id == request.auth.uid;
    }

    // Similar rules for recommendations and roadmaps
    match /recommendations/{recommendationId} {
      allow read, write: if request.auth != null &&
        resource.data.user_id == request.auth.uid;
    }

    match /learning_roadmaps/{roadmapId} {
      allow read, write: if request.auth != null &&
        resource.data.user_id == request.auth.uid;
    }
  }
}
```