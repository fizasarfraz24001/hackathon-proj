'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { submitAssessment } from '@/lib/apiService';
import type React from 'react';

const AssessmentPage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const router = useRouter();

  const [formData, setFormData] = useState<{
    interests: string[];
    educationLevel: string;
    preferredCareerField: string;
    careerGoals: string;
  }>({
    interests: [],
    educationLevel: 'University Student',
    preferredCareerField: 'Technology & IT',
    careerGoals: '',
  });

  const careerFields = [
    'Technology & IT',
    'Healthcare & Medical',
    'Business & Management',
    'Finance & Accounting',
    'Marketing & Sales',
    'Education & Teaching',
    'Design & Creative Arts',
    'Engineering',
    'Law & Public Policy',
    'Social Work & Psychology',
    'Hospitality & Tourism',
    'Skilled Trades',
    'Public Service'
  ];

  const fieldSkillLibrary: Record<string, string[]> = {
    'Technology & IT': ['Programming', 'Web Development', 'Databases', 'Version Control', 'Debugging', 'System Basics'],
    'Healthcare & Medical': ['Biology Basics', 'Patient Care', 'Medical Terminology', 'Lab Procedures', 'Data Recording', 'Communication'],
    'Business & Management': ['Business Communication', 'Operations Planning', 'Spreadsheet Skills', 'Problem Solving', 'Team Collaboration', 'Presentation'],
    'Finance & Accounting': ['Bookkeeping', 'Excel', 'Financial Reporting', 'Data Accuracy', 'Budgeting', 'Accounting Basics'],
    'Marketing & Sales': ['Content Writing', 'SEO Basics', 'Social Media', 'Customer Communication', 'Negotiation', 'Analytics'],
    'Education & Teaching': ['Lesson Planning', 'Classroom Support', 'Public Speaking', 'Student Mentoring', 'Content Development', 'Communication'],
    'Design & Creative Arts': ['Design Principles', 'Typography', 'Color Theory', 'Figma/Adobe Tools', 'Creativity', 'Visual Storytelling'],
    'Engineering': ['Technical Drawing', 'Math Foundations', 'Problem Solving', 'CAD Basics', 'Safety Awareness', 'Project Coordination'],
    'Law & Public Policy': ['Legal Research', 'Policy Analysis', 'Critical Thinking', 'Report Writing', 'Documentation', 'Communication'],
    'Social Work & Psychology': ['Active Listening', 'Empathy', 'Case Documentation', 'Community Outreach', 'Observation', 'Ethics'],
    'Hospitality & Tourism': ['Customer Service', 'Planning', 'Communication', 'Booking Tools', 'Problem Solving', 'Teamwork'],
    'Skilled Trades': ['Tool Handling', 'Safety Procedures', 'Technical Basics', 'Measurement', 'Troubleshooting', 'Maintenance'],
    'Public Service': ['Public Communication', 'Program Coordination', 'Documentation', 'Community Engagement', 'Office Tools', 'Problem Solving']
  };

  const activeSkills = useMemo(
    () => fieldSkillLibrary[formData.preferredCareerField] || fieldSkillLibrary['Technology & IT'],
    [formData.preferredCareerField]
  );

  const [skillRatings, setSkillRatings] = useState<Record<string, number>>(
    activeSkills.reduce<Record<string, number>>((acc, skill) => {
      acc[skill] = 0;
      return acc;
    }, {})
  );

  useEffect(() => {
    setSkillRatings(prev => {
      const next: Record<string, number> = {};
      activeSkills.forEach((skill) => {
        next[skill] = prev[skill] ?? 0;
      });
      return next;
    });
  }, [activeSkills]);

  const handleInterestChange = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const handleSkillRatingChange = (skill: string, rating: string) => {
    setSkillRatings(prev => ({
      ...prev,
      [skill]: parseInt(rating)
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) {
      setError('You must be logged in to submit an assessment.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Prepare skills data with ratings
      const skillsWithRatings = activeSkills
        .map((skill) => ({
          name: skill,
          rating: skillRatings[skill] ?? 0
        }))
        .filter((item) => item.rating > 0);

      // Prepare assessment data for backend
      const assessmentData = {
        interests: formData.interests,
        skills: skillsWithRatings.map(skill => skill.name),
        education_level: formData.educationLevel,
        preferred_career_field: formData.preferredCareerField,
        career_goals: formData.careerGoals,
      };

      await submitAssessment(assessmentData);

      // Redirect to dashboard for consolidated AI output
      router.push('/dashboard');
      router.refresh();
    } catch (error) {
      console.error('Error submitting assessment:', error);
      setError('Failed to submit assessment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Career Assessment</h1>
          <p className="text-slate-400">
            Help us understand your interests, skills, and goals to provide personalized recommendations.
          </p>
        </div>

        {error && (
          <div className="rounded-md bg-red-900/30 p-4 mb-6 border border-red-800">
            <div className="text-sm text-red-300">{error}</div>
          </div>
        )}

        {/* Preferred Career Field */}
        <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700">
          <h2 className="text-xl font-semibold text-white mb-4">Preferred Career Field</h2>
          <p className="text-slate-400 mb-4">Select one field you want to prioritize in recommendations.</p>
          <select
            value={formData.preferredCareerField}
            onChange={(e) => setFormData(prev => ({ ...prev, preferredCareerField: e.target.value }))}
            className="w-full p-3 border border-slate-600 rounded-md bg-slate-700/50 text-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
          >
            {careerFields.map((field) => (
              <option key={field} value={field}>
                {field}
              </option>
            ))}
          </select>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Interests Section */}
          <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700">
            <h2 className="text-xl font-semibold text-white mb-4">Career Interests</h2>
            <p className="text-slate-400 mb-4">Select your areas of interest (select all that apply)</p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {careerFields.map((interest) => (
                <label
                  key={interest}
                  className={`flex items-center p-3 rounded-md border cursor-pointer transition-colors ${
                    formData.interests.includes(interest)
                      ? 'border-cyan-500 bg-cyan-900/20 text-cyan-300'
                      : 'border-slate-600 hover:border-slate-500 text-slate-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={formData.interests.includes(interest)}
                    onChange={() => handleInterestChange(interest)}
                    className="mr-3 h-4 w-4 text-cyan-600 rounded focus:ring-cyan-500"
                  />
                  <span>{interest}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Skills Section */}
          <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700">
            <h2 className="text-xl font-semibold text-white mb-4">Skills Assessment</h2>
            <p className="text-slate-400 mb-4">
              Rate skills for <span className="text-cyan-300">{formData.preferredCareerField}</span> (1 = Beginner, 5 = Expert)
            </p>

            <div className="space-y-4">
              {activeSkills.map((skill) => (
                <div key={skill} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-md">
                  <span className="text-slate-300">{skill}</span>
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <label key={rating} className="cursor-pointer">
                        <input
                          type="radio"
                          name={`skill-${skill}`}
                          value={rating}
                          checked={skillRatings[skill] === rating}
                          onChange={(e) => handleSkillRatingChange(skill, e.target.value)}
                          className="sr-only"
                        />
                        <span
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                            skillRatings[skill] === rating
                              ? 'bg-cyan-600 text-white'
                              : 'bg-slate-600 text-slate-300 hover:bg-slate-500'
                          }`}
                        >
                          {rating}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Education Level */}
          <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700">
            <h2 className="text-xl font-semibold text-white mb-4">Education Level</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                'High School Student',
                'College Student',
                'University Student',
                'Graduate Student',
                'Fresh Graduate',
                'Working Professional',
                'Career Switcher'
              ].map((level) => (
                <label
                  key={level}
                  className={`flex items-center p-3 rounded-md border cursor-pointer transition-colors ${
                    formData.educationLevel === level
                      ? 'border-cyan-500 bg-cyan-900/20 text-cyan-300'
                      : 'border-slate-600 hover:border-slate-500 text-slate-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="educationLevel"
                    value={level}
                    checked={formData.educationLevel === level}
                    onChange={(e) => setFormData(prev => ({ ...prev, educationLevel: e.target.value }))}
                    className="mr-3 h-4 w-4 text-cyan-600 rounded focus:ring-cyan-500"
                  />
                  <span>{level}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Career Goals */}
          <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700">
            <h2 className="text-xl font-semibold text-white mb-4">Career Goals</h2>
            <p className="text-slate-400 mb-4">What are your career goals? What would you like to achieve?</p>

            <textarea
              value={formData.careerGoals}
              onChange={(e) => setFormData(prev => ({ ...prev, careerGoals: e.target.value }))}
              placeholder="Describe your career goals, aspirations, and what you hope to achieve..."
              className="w-full h-32 p-3 border border-slate-600 rounded-md bg-slate-700/50 text-slate-300 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-6">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing...' : 'Generate Career Recommendations'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssessmentPage;