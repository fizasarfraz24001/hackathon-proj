'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getCareerRecommendations, getLatestAssessment, getSkillGapAnalysis } from '@/lib/apiService';

type AssessmentData = {
  id?: string;
  interests?: string[];
  skills?: string[] | { name?: string }[];
  education_level?: string;
  educationLevel?: string;
  preferred_career_field?: string;
  careerGoals?: string;
};

type Resource = {
  title: string;
  platform: string;
  link: string;
  skill: string;
};

type RecommendationCard = {
  id: number;
  title: string;
  focus: string;
  starterRole: string;
  requiredSkills: string[];
  growthPotential: string;
  salaryRange: string;
  learningTime: string;
  description: string;
  learningResources: Resource[];
};

const RecommendationsPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [recommendations, setRecommendations] = useState<RecommendationCard[]>([]);
  const [userAssessment, setUserAssessment] = useState<AssessmentData | null>(null);
  const [skillGap, setSkillGap] = useState<{ missing_skills?: string[]; recommended_learning_path?: string[] } | null>(null);
  const { user } = useAuth();
  const router = useRouter();

  const fetchRecommendations = useCallback(async (assessmentData: AssessmentData) => {
    try {
      const assessmentSkills = Array.isArray(assessmentData.skills)
        ? assessmentData.skills
            .map((skill: string | { name?: string }) => (typeof skill === 'string' ? skill : skill?.name || ''))
            .filter(Boolean)
        : [];

      const backendResponse = await getCareerRecommendations({
        interests: assessmentData.interests || [],
        skills: assessmentSkills,
        education_level: assessmentData.education_level || assessmentData.educationLevel || '',
        preferred_career_field: assessmentData.preferred_career_field || ''
      });

      const transformedRecommendations: RecommendationCard[] = (backendResponse.careers || []).map(
        (rec: { title: string; description: string; entry_roles?: string[]; required_skills?: string[]; learning_resources?: Resource[] }, idx: number) => ({
          id: idx + 1,
          title: rec.title,
          focus: rec.description,
          starterRole: rec.entry_roles?.[0] || 'Entry-level role',
          requiredSkills: rec.required_skills || [],
          growthPotential: 'High for consistent learners',
          salaryRange: 'Varies by market',
          learningTime: '3-12 months based on pace',
          description: rec.description,
          learningResources: rec.learning_resources || []
        })
      );

      setRecommendations(transformedRecommendations);

      if (transformedRecommendations.length > 0) {
        const gapResponse = await getSkillGapAnalysis({
          user_skills: assessmentSkills,
          required_skills: transformedRecommendations[0].requiredSkills
        });
        setSkillGap(gapResponse);
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      setError('Failed to fetch recommendations. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUserAssessment = useCallback(async () => {
    if (!user) return;

    try {
      const latestResponse = await getLatestAssessment();
      const assessmentData = latestResponse?.assessment as AssessmentData | null;
      if (assessmentData) {
        setUserAssessment(assessmentData);
        await fetchRecommendations(assessmentData);
      } else {
        setError('No assessment found. Please complete the assessment first.');
        setLoading(false);
      }
    } catch (error) {
      console.error('Error fetching assessment:', error);
      setError('Failed to fetch your assessment. Please try again.');
      setLoading(false);
    }
  }, [fetchRecommendations, user]);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    fetchUserAssessment();
  }, [fetchUserAssessment, router, user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
              <p className="text-slate-400">Generating personalized recommendations...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Career Recommendations</h1>
          <p className="text-slate-400">
            Based on your assessment, here are personalized career recommendations tailored for you.
          </p>
        </div>

        {error && (
          <div className="rounded-md bg-red-900/30 p-4 mb-6 border border-red-800">
            <div className="text-sm text-red-300">{error}</div>
          </div>
        )}

        {userAssessment && (
          <div className="mb-8 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
            <h2 className="text-lg font-semibold text-cyan-400 mb-2">Your Assessment Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-slate-400">Interests</p>
                <p className="text-white">{userAssessment.interests?.join(', ')}</p>
              </div>
              <div>
                <p className="text-slate-400">Education Level</p>
                <p className="text-white">{userAssessment.education_level || userAssessment.educationLevel}</p>
              </div>
              <div>
                <p className="text-slate-400">Career Goals</p>
                <p className="text-white">{userAssessment.careerGoals || 'Not specified'}</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendations.map((recommendation) => (
            <div
              key={recommendation.id}
              className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 hover:border-cyan-500 transition-colors"
            >
              <div className="mb-4">
                <h3 className="text-xl font-bold text-white mb-1">{recommendation.title}</h3>
                <p className="text-cyan-400 text-sm">{recommendation.starterRole}</p>
              </div>

              <p className="text-slate-300 text-sm mb-4">{recommendation.description}</p>

              <div className="mb-4">
                <h4 className="text-sm font-semibold text-cyan-400 mb-2">Focus Area</h4>
                <p className="text-slate-300 text-sm">{recommendation.focus}</p>
              </div>

              <div className="mb-4">
                <h4 className="text-sm font-semibold text-cyan-400 mb-2">Required Skills</h4>
                <div className="flex flex-wrap gap-1">
                  {recommendation.requiredSkills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-slate-700 text-slate-300 text-xs rounded"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-slate-400">Growth Potential</p>
                  <p className="text-white">{recommendation.growthPotential}</p>
                </div>
                <div>
                  <p className="text-slate-400">Salary Range</p>
                  <p className="text-white">{recommendation.salaryRange}</p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-700">
                <p className="text-slate-400 text-sm">Time to Get Started: {recommendation.learningTime}</p>
              </div>

              <button className="mt-4 w-full py-2 bg-cyan-600 hover:bg-cyan-700 text-white text-sm font-medium rounded-md transition-colors">
                Explore This Path
              </button>

              {recommendation.learningResources.length > 0 && (
                <div className="mt-4 pt-3 border-t border-slate-700">
                  <p className="text-xs font-medium text-cyan-400 mb-2">Learning Resources</p>
                  <ul className="space-y-1">
                    {recommendation.learningResources.slice(0, 3).map((resource, ridx) => (
                      <li key={ridx} className="text-xs text-slate-300">
                        - {resource.platform}: {resource.title}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>

        {skillGap && (
          <div className="mt-8 bg-slate-800/50 border border-slate-700 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-3">Skill Gap Analysis</h2>
            <p className="text-sm text-slate-400 mb-2">Missing Skills</p>
            <div className="flex flex-wrap gap-2 mb-4">
              {(skillGap.missing_skills || []).map((skill, idx) => (
                <span key={idx} className="px-2 py-1 bg-red-900/30 border border-red-700 text-red-300 text-xs rounded">
                  {skill}
                </span>
              ))}
            </div>
            <p className="text-sm text-slate-400 mb-2">Learning Roadmap</p>
            <ul className="space-y-1">
              {(skillGap.recommended_learning_path || []).map((step, idx) => (
                <li key={idx} className="text-sm text-slate-300">- {step}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-8 text-center">
          <button
            onClick={() => router.push('/learning-path')}
            className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-md transition-colors"
          >
            Generate Learning Path
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecommendationsPage;