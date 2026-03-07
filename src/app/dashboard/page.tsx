'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { signOutUser } from '@/lib/auth';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { getFullRecommendations, getLatestAssessment, getResumeGuidance, getUserHistory } from '@/lib/apiService';
import PageNavigation from '@/components/PageNavigation';
import jsPDF from 'jspdf';

type Career = {
  title: string;
  description: string;
  required_skills?: string[];
  entry_roles?: string[];
  learning_resources?: { title: string; platform: string; link: string; skill: string }[];
};

type SkillGapAnalysis = {
  missing_skills?: string[];
  recommended_learning_path?: string[];
};

type LocalProgram = {
  name: string;
  link: string;
};

const DashboardPage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [careers, setCareers] = useState<Career[]>([]);
  const [skillGap, setSkillGap] = useState<SkillGapAnalysis | null>(null);
  const [roadmap, setRoadmap] = useState<string[]>([]);
  const [courses, setCourses] = useState<{ title: string; platform: string; link: string; skill: string }[]>([]);
  const [localPrograms, setLocalPrograms] = useState<LocalProgram[]>([]);
  const [resumeSummary, setResumeSummary] = useState('');
  const [interviewTips, setInterviewTips] = useState<string[]>([]);
  const [historyCount, setHistoryCount] = useState(0);
  const [preferredField, setPreferredField] = useState('');
  const [targetCareer, setTargetCareer] = useState('');
  const router = useRouter();

  const getNumericUserId = (uid?: string) => {
    if (!uid) return 'N/A';

    // Deterministic hash-based numeric ID for display purposes only.
    let hash = 0;
    for (const char of uid) {
      hash = (hash * 131 + char.charCodeAt(0)) % 1000000000000;
    }

    return Math.floor(hash).toString().padStart(12, '0');
  };

  const loadDashboardData = useCallback(async () => {
    try {
      const latestResponse = await getLatestAssessment();
      const latest = latestResponse?.assessment;
      if (!latest) {
        router.push('/assessment');
        return;
      }
      const userSkills = Array.isArray(latest.skills)
        ? latest.skills.map((s: unknown) => (typeof s === 'string' ? s : '')).filter(Boolean)
        : [];

      const rec = await getFullRecommendations({
        interests: latest.interests || [],
        skills: userSkills,
        education_level: latest.education_level || latest.educationLevel || '',
        preferred_career_field: latest.preferred_career_field || '',
        career_goals: latest.career_goals || ''
      });
      setCareers(rec.careers || []);
      setSkillGap(rec.skill_gap_analysis || null);
      setRoadmap(rec.learning_roadmap || []);
      setCourses(rec.courses || []);
      setLocalPrograms(rec.local_learning_programs || []);
      setPreferredField(rec.profile_context?.preferred_career_field || latest.preferred_career_field || '');
      setTargetCareer(rec.profile_context?.target_career || rec.careers?.[0]?.title || '');

      const resume = await getResumeGuidance({
        user_skills: userSkills,
        career_goal: latest.career_goals || latest.preferred_career_field || rec.careers?.[0]?.title || 'Career Growth',
        education: latest.education_level || latest.educationLevel || 'Student',
        projects: []
      });
      setResumeSummary(resume.resume_summary || '');
      setInterviewTips(resume.interview_tips || []);

      const history = await getUserHistory();
      const total =
        (history?.history?.assessments?.length || 0) +
        (history?.history?.recommendations?.length || 0) +
        (history?.history?.resumes?.length || 0);
      setHistoryCount(total);
    } catch (e) {
      console.error(e);
      setError('Failed to load dashboard data. Please retry.');
    }
  }, [router]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        loadDashboardData();
      } else {
        // Redirect to login if not authenticated
        router.push('/login');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [loadDashboardData, router]);

  const handleLogout = async () => {
    const result = await signOutUser();

    if (result.success) {
      router.push('/login');
      router.refresh();
    } else {
      setError(result.error);
    }
  };

  const handleDownloadRoadmapPdf = () => {
    const doc = new jsPDF();
    let y = 15;

    doc.setFontSize(16);
    doc.text('Career Roadmap', 14, y);
    y += 10;

    doc.setFontSize(11);
    doc.text(`Generated for: ${user?.displayName || user?.email || 'User'}`, 14, y);
    y += 8;

    const addSectionTitle = (title: string) => {
      if (y > 270) {
        doc.addPage();
        y = 15;
      }
      doc.setFontSize(13);
      doc.text(title, 14, y);
      y += 7;
      doc.setFontSize(10);
    };

    const addWrappedLine = (text: string) => {
      const lines = doc.splitTextToSize(text, 180);
      lines.forEach((line: string) => {
        if (y > 280) {
          doc.addPage();
          y = 15;
        }
        doc.text(line, 14, y);
        y += 5;
      });
    };

    addSectionTitle('Recommended Careers');
    careers.slice(0, 3).forEach((career, idx) => {
      addWrappedLine(`${idx + 1}. ${career.title}`);
      addWrappedLine(`Description: ${career.description}`);
      addWrappedLine(`Entry Roles: ${(career.entry_roles || []).join(', ')}`);
      addWrappedLine(`Required Skills: ${(career.required_skills || []).join(', ')}`);
      y += 2;
    });

    addSectionTitle('Skill Gap Analysis');
    addWrappedLine(`Missing Skills: ${(skillGap?.missing_skills || []).join(', ') || 'N/A'}`);

    addSectionTitle('Learning Roadmap');
    (roadmap || []).forEach((step, idx) => addWrappedLine(`${idx + 1}. ${step}`));

    addSectionTitle('Courses & Training');
    (courses || []).forEach((course, idx) => {
      addWrappedLine(`${idx + 1}. ${course.title} (${course.platform}) - ${course.link}`);
    });

    addSectionTitle('Montgomery Local Learning Programs');
    (localPrograms || []).forEach((program, idx) =>
      addWrappedLine(`${idx + 1}. ${program.name} - ${program.link}`)
    );

    addSectionTitle('Resume Summary');
    addWrappedLine(resumeSummary || 'N/A');

    addSectionTitle('Interview Preparation Tips');
    (interviewTips || []).forEach((tip, idx) => addWrappedLine(`${idx + 1}. ${tip}`));

    doc.save('career-roadmap.pdf');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <nav className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex items-center gap-2">
                <img src="/images/logo.jpg?v=2" alt="Youth Career Navigator logo" width={26} height={26} />
                <h1 className="text-xl font-semibold text-white">Career Guidance Dashboard</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-slate-300">
                Welcome, {user?.displayName || user?.email}!
              </div>
              <button
                onClick={handleLogout}
                className="ml-4 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-2 border-slate-700 rounded-lg p-6 bg-slate-800/50">
            <PageNavigation />
            <h2 className="text-2xl font-bold text-white mb-4">Welcome to Your Career Dashboard</h2>
            <p className="text-slate-300 mb-6">
              You are successfully logged in. This is a protected route that&apos;s only accessible to authenticated users.
            </p>

            <div className="bg-slate-800 shadow rounded-lg p-6 mb-6 border border-slate-700">
              <h3 className="text-lg font-medium text-white mb-2">User Information</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm font-medium text-slate-400">Email</p>
                  <p className="text-sm text-slate-300">{user?.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-400">Name</p>
                  <p className="text-sm text-slate-300">{user?.displayName || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-400">User ID (Numeric)</p>
                  <p className="text-sm text-slate-300">{getNumericUserId(user?.uid)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-400">Provider</p>
                  <p className="text-sm text-slate-300">{user?.providerData?.[0]?.providerId || 'Email/Password'}</p>
                </div>
              </div>
            </div>

            <div className="bg-slate-800 shadow rounded-lg p-6 mb-6 border border-slate-700">
              <h3 className="text-lg font-medium text-white mb-4">
                Top Career Recommendations {preferredField ? `- ${preferredField}` : ''}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {careers.slice(0, 3).map((career, idx) => (
                  <div key={idx} className="p-4 rounded-md bg-slate-700/40 border border-slate-600">
                    <p className="font-semibold text-white">{career.title}</p>
                    <p className="text-sm text-slate-300 mt-1">{career.description}</p>
                    <p className="text-xs text-cyan-400 mt-2">
                      Entry: {(career.entry_roles || []).join(', ')}
                    </p>
                    <p className="text-xs text-slate-300 mt-2">
                      Skills: {(career.required_skills || []).join(', ')}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {skillGap && (
              <div className="bg-slate-800 shadow rounded-lg p-6 mb-6 border border-slate-700">
                <h3 className="text-lg font-medium text-white mb-3">
                  Skill Gap Analysis {targetCareer ? `for ${targetCareer}` : ''}
                </h3>
                <div className="flex flex-wrap gap-2 mb-3">
                  {(skillGap.missing_skills || []).map((skill: string, idx: number) => (
                    <span key={idx} className="px-2 py-1 bg-red-900/30 text-red-300 text-xs rounded border border-red-800">
                      {skill}
                    </span>
                  ))}
                </div>
                <ul className="space-y-1">
                  {(skillGap.recommended_learning_path || []).map((step: string, idx: number) => (
                    <li key={idx} className="text-sm text-slate-300">- {step}</li>
                  ))}
                </ul>
              </div>
            )}

            {roadmap.length > 0 && (
              <div className="bg-slate-800 shadow rounded-lg p-6 mb-6 border border-slate-700">
                <h3 className="text-lg font-medium text-white mb-3">
                  Learning Roadmap {preferredField ? `(${preferredField})` : ''}
                </h3>
                <ul className="space-y-1">
                  {roadmap.map((step, idx) => (
                    <li key={idx} className="text-sm text-slate-300">- {step}</li>
                  ))}
                </ul>
              </div>
            )}

            {courses.length > 0 && (
              <div className="bg-slate-800 shadow rounded-lg p-6 mb-6 border border-slate-700">
                <h3 className="text-lg font-medium text-white mb-3">
                  Courses & Training {preferredField ? `for ${preferredField}` : ''}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {courses.map((course, idx) => (
                    <a
                      key={idx}
                      href={course.link}
                      target="_blank"
                      rel="noreferrer"
                      className="p-3 rounded-md border border-slate-600 bg-slate-700/30 hover:border-cyan-500"
                    >
                      <p className="text-sm text-white font-medium">{course.title}</p>
                      <p className="text-xs text-cyan-400">{course.platform}</p>
                      <p className="text-xs text-slate-300 mt-1">Skill: {course.skill}</p>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {localPrograms.length > 0 && (
              <div className="bg-slate-800 shadow rounded-lg p-6 mb-6 border border-slate-700">
                <h3 className="text-lg font-medium text-white mb-3">Montgomery Local Learning Programs</h3>
                <ul className="space-y-1">
                  {localPrograms.map((program, idx) => (
                    <li key={idx} className="text-sm text-slate-300">
                      -{' '}
                      <a
                        href={program.link}
                        target="_blank"
                        rel="noreferrer"
                        className="text-cyan-400 hover:underline"
                      >
                        {program.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {(resumeSummary || interviewTips.length > 0) && (
              <div className="bg-slate-800 shadow rounded-lg p-6 mb-6 border border-slate-700">
                <h3 className="text-lg font-medium text-white mb-3">Resume Summary</h3>
                <p className="text-sm text-slate-300 mb-4">{resumeSummary || 'Resume summary not available yet.'}</p>
                <h4 className="text-sm font-medium text-cyan-300 mb-2">Interview Preparation Tips</h4>
                <ul className="space-y-1">
                  {interviewTips.map((tip, idx) => (
                    <li key={idx} className="text-sm text-slate-300">- {tip}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="text-xs text-slate-400 mb-4">
              Saved history records: {historyCount}
            </div>

            <div className="mb-6">
              <button
                onClick={handleDownloadRoadmapPdf}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-md"
              >
                Download Career Roadmap (PDF)
              </button>
            </div>

            {error && (
              <div className="rounded-md bg-red-900/30 p-4 mb-4 border border-red-800">
                <div className="text-sm text-red-300">{error}</div>
              </div>
            )}

            <div className="mt-8">
              <h3 className="text-lg font-medium text-white mb-4">Next Steps</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="bg-slate-800 shadow rounded-lg p-4 border border-slate-700">
                  <h4 className="font-medium text-white">Take Assessment</h4>
                  <p className="text-sm text-slate-400 mt-1">Complete your career assessment to get personalized recommendations.</p>
                  <button
                    onClick={() => router.push('/assessment')}
                    className="mt-3 w-full bg-cyan-600 hover:bg-cyan-700 text-white py-2 px-4 rounded-md text-sm font-medium"
                  >
                    Start Assessment
                  </button>
                </div>
                <div className="bg-slate-800 shadow rounded-lg p-4 border border-slate-700">
                  <h4 className="font-medium text-white">View Recommendations</h4>
                  <p className="text-sm text-slate-400 mt-1">See personalized career path recommendations.</p>
                  <button
                    onClick={() => router.push('/recommendations')}
                    className="mt-3 w-full bg-cyan-600 hover:bg-cyan-700 text-white py-2 px-4 rounded-md text-sm font-medium"
                  >
                    View Recommendations
                  </button>
                </div>
                <div className="bg-slate-800 shadow rounded-lg p-4 border border-slate-700">
                  <h4 className="font-medium text-white">Learning Path</h4>
                  <p className="text-sm text-slate-400 mt-1">Access your personalized learning roadmap.</p>
                  <button
                    onClick={() => router.push('/learning-path')}
                    className="mt-3 w-full bg-cyan-600 hover:bg-cyan-700 text-white py-2 px-4 rounded-md text-sm font-medium"
                  >
                    View Learning Path
                  </button>
                </div>
                <div className="bg-slate-800 shadow rounded-lg p-4 border border-slate-700">
                  <h4 className="font-medium text-white">Resume Guidance</h4>
                  <p className="text-sm text-slate-400 mt-1">Generate AI-based resume summary and interview tips.</p>
                  <button
                    onClick={() => router.push('/resume')}
                    className="mt-3 w-full bg-cyan-600 hover:bg-cyan-700 text-white py-2 px-4 rounded-md text-sm font-medium"
                  >
                    Open Resume Assistant
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;