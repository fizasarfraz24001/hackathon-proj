'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getCareerRecommendations, getLatestAssessment, getLearningResources, getSkillGapAnalysis } from '@/lib/apiService';
import PageNavigation from '@/components/PageNavigation';

type Course = {
  title: string;
  platform: string;
  link: string;
  skill: string;
};

type AssessmentShape = {
  interests?: string[];
  skills?: string[] | { name?: string }[];
  education_level?: string;
  educationLevel?: string;
  preferred_career_field?: string;
};

const LearningPathPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [courses, setCourses] = useState<Course[]>([]);
  const { user } = useAuth();
  const router = useRouter();

  const fetchLearningResources = useCallback(async () => {
    if (!user) return;
    try {
      const latestResponse = await getLatestAssessment();
      const latest = latestResponse?.assessment as AssessmentShape | null;
      if (!latest) {
        setError('No assessment found. Please complete assessment first.');
        return;
      }
      const userSkills = Array.isArray(latest.skills)
        ? latest.skills
            .map((s: string | { name?: string }) => (typeof s === 'string' ? s : s?.name || ''))
            .filter(Boolean)
        : [];

      const career = await getCareerRecommendations({
        interests: latest.interests || [],
        skills: userSkills,
        education_level: latest.education_level || latest.educationLevel || '',
        preferred_career_field: latest.preferred_career_field || ''
      });

      const requiredSkills = career.careers?.[0]?.required_skills || [];
      const gap = await getSkillGapAnalysis({
        user_skills: userSkills,
        required_skills: requiredSkills
      });

      const resourceResponse = await getLearningResources({
        missing_skills: gap.missing_skills || [],
        preferred_career_field: latest.preferred_career_field || ''
      });
      setCourses(resourceResponse.courses || []);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch learning resources.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    fetchLearningResources();
  }, [fetchLearningResources, router, user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
              <p className="text-slate-400">Fetching free learning resources...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <PageNavigation />
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Learning Resources</h1>
          <p className="text-slate-400">
            Free recommended courses tailored to your skill gaps.
          </p>
        </div>

        {error && (
          <div className="rounded-md bg-red-900/30 p-4 mb-6 border border-red-800">
            <div className="text-sm text-red-300">{error}</div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course, idx) => (
            <div key={`${course.title}-${idx}`} className="bg-slate-800/50 border border-slate-700 rounded-lg p-5">
              <h3 className="text-lg font-semibold text-white">{course.title}</h3>
              <p className="text-sm text-cyan-400 mt-1">{course.platform}</p>
              <p className="text-sm text-slate-400 mt-3">Skill: {course.skill}</p>
              <a
                href={course.link}
                target="_blank"
                rel="noreferrer"
                className="inline-block mt-4 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white text-sm rounded-md"
              >
                Open Course
              </a>
            </div>
          ))}
        </div>

        {courses.length === 0 && !error && (
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 text-slate-300">
            Courses are not available yet. Please refresh and try again.
          </div>
        )}
      </div>
    </div>
  );
};

export default LearningPathPage;
