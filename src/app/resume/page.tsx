'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getResumeGuidance } from '@/lib/apiService';
import PageNavigation from '@/components/PageNavigation';
import jsPDF from 'jspdf';

type ResumeResponse = {
  resume_sections?: {
    full_name?: string;
    professional_title?: string;
    professional_summary?: string;
    core_skills?: string[];
    projects?: string[];
    education?: string[];
    achievements?: string[];
  };
  resume_summary?: string;
  improved_skill_descriptions?: string[];
  bullet_point_achievements?: string[];
  interview_tips?: string[];
};

const ResumePage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fullName, setFullName] = useState('');
  const [skills, setSkills] = useState('');
  const [careerGoal, setCareerGoal] = useState('');
  const [education, setEducation] = useState('');
  const [projects, setProjects] = useState('');
  const [result, setResult] = useState<ResumeResponse | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await getResumeGuidance({
        full_name: fullName,
        user_skills: skills.split(',').map((s: string) => s.trim()).filter(Boolean),
        career_goal: careerGoal,
        education,
        projects: projects.split(',').map((p: string) => p.trim()).filter(Boolean)
      });
      setResult(response);
    } catch (err) {
      console.error(err);
      setError('Resume guidance could not be generated. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadResumePdf = () => {
    if (!result) return;

    const doc = new jsPDF();
    let y = 15;

    const parsedSkills = skills.split(',').map((s: string) => s.trim()).filter(Boolean);
    const parsedProjects = projects.split(',').map((p: string) => p.trim()).filter(Boolean);

    doc.setFontSize(18);
    const displayName = result.resume_sections?.full_name || fullName || 'Candidate Name';
    const title = result.resume_sections?.professional_title || careerGoal || 'Career Professional';
    const summary = result.resume_sections?.professional_summary || result.resume_summary || 'Summary not available.';
    const sectionSkills = result.resume_sections?.core_skills?.length ? result.resume_sections.core_skills : parsedSkills;
    const sectionProjects = result.resume_sections?.projects?.length ? result.resume_sections.projects : parsedProjects;
    const sectionEducation = result.resume_sections?.education?.length
      ? result.resume_sections.education.join(' | ')
      : education || 'Not specified';
    const sectionAchievements = result.resume_sections?.achievements?.length
      ? result.resume_sections.achievements
      : result.bullet_point_achievements || [];

    doc.text(displayName.toUpperCase(), 14, y);
    y += 8;

    doc.setFontSize(11);
    doc.text(`Professional Title: ${title}`, 14, y);
    y += 6;
    doc.text(`Education: ${sectionEducation}`, 14, y);
    y += 8;

    const addSection = (title: string) => {
      if (y > 270) {
        doc.addPage();
        y = 15;
      }
      doc.setFontSize(13);
      doc.text(title, 14, y);
      y += 6;
      doc.setFontSize(10);
    };

    const addWrapped = (text: string) => {
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

    addSection('Professional Summary');
    addWrapped(summary);

    addSection('Core Skills');
    if (sectionSkills.length) {
      sectionSkills.forEach((skill, idx) => addWrapped(`${idx + 1}. ${skill}`));
    } else {
      addWrapped('No skills provided.');
    }

    addSection('Enhanced Skill Statements');
    (result.improved_skill_descriptions || []).forEach((item, idx) => addWrapped(`${idx + 1}. ${item}`));

    addSection('Projects');
    if (sectionProjects.length) {
      sectionProjects.forEach((project, idx) => addWrapped(`${idx + 1}. ${project}`));
    } else {
      addWrapped('No projects provided.');
    }

    addSection('Achievements');
    sectionAchievements.forEach((item, idx) => addWrapped(`${idx + 1}. ${item}`));

    addSection('Interview Preparation Tips');
    (result.interview_tips || []).forEach((item, idx) => addWrapped(`${idx + 1}. ${item}`));

    doc.save(`${displayName.replace(/\s+/g, '_').toLowerCase()}_resume.pdf`);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <PageNavigation />
        <h1 className="text-3xl font-bold text-white mb-2">AI Resume Builder</h1>
        <p className="text-slate-400 mb-8">Generate a complete resume draft and download it as PDF.</p>

        {error && (
          <div className="rounded-md bg-red-900/30 p-4 mb-6 border border-red-800">
            <div className="text-sm text-red-300">{error}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 bg-slate-800/50 border border-slate-700 rounded-lg p-6">
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Full name e.g. Alex Khan"
            className="w-full p-3 rounded-md bg-slate-700 border border-slate-600"
            required
          />
          <input
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
            placeholder="Skills (comma separated) e.g. React, Python, SQL"
            className="w-full p-3 rounded-md bg-slate-700 border border-slate-600"
            required
          />
          <input
            value={careerGoal}
            onChange={(e) => setCareerGoal(e.target.value)}
            placeholder="Career goal e.g. Frontend Developer"
            className="w-full p-3 rounded-md bg-slate-700 border border-slate-600"
            required
          />
          <input
            value={education}
            onChange={(e) => setEducation(e.target.value)}
            placeholder="Education e.g. BS Computer Science"
            className="w-full p-3 rounded-md bg-slate-700 border border-slate-600"
            required
          />
          <input
            value={projects}
            onChange={(e) => setProjects(e.target.value)}
            placeholder="Projects (optional, comma separated)"
            className="w-full p-3 rounded-md bg-slate-700 border border-slate-600"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-medium rounded-md disabled:opacity-50"
          >
            {loading ? 'Generating...' : 'Build Resume'}
          </button>
        </form>

        {result && (
          <div className="mt-8 space-y-4">
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-5">
              <h2 className="text-xl font-semibold text-white mb-2">Resume Summary</h2>
              <p className="text-slate-300">{result.resume_summary}</p>
            </div>

            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-5">
              <h2 className="text-xl font-semibold text-white mb-2">Improved Skill Descriptions</h2>
              <ul className="space-y-1">
                {(result.improved_skill_descriptions || []).map((item, idx) => (
                  <li key={idx} className="text-slate-300">- {item}</li>
                ))}
              </ul>
            </div>

            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-5">
              <h2 className="text-xl font-semibold text-white mb-2">Achievements</h2>
              <ul className="space-y-1">
                {(result.bullet_point_achievements || []).map((item, idx) => (
                  <li key={idx} className="text-slate-300">- {item}</li>
                ))}
              </ul>
            </div>

            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-5">
              <h2 className="text-xl font-semibold text-white mb-2">Interview Tips</h2>
              <ul className="space-y-1">
                {(result.interview_tips || []).map((item, idx) => (
                  <li key={idx} className="text-slate-300">- {item}</li>
                ))}
              </ul>
            </div>

            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-5">
              <h2 className="text-xl font-semibold text-white mb-2">Resume Draft Preview</h2>
              <div className="rounded-md border border-slate-600 bg-slate-900 p-4 space-y-3">
                <div>
                  <p className="text-lg font-bold text-white">{result.resume_sections?.full_name || fullName || 'Candidate Name'}</p>
                  <p className="text-sm text-cyan-300">{result.resume_sections?.professional_title || careerGoal || 'Career Goal'}</p>
                  <p className="text-sm text-slate-400">
                    {(result.resume_sections?.education && result.resume_sections.education.length)
                      ? result.resume_sections.education.join(' | ')
                      : education || 'Education'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-cyan-300">Professional Summary</p>
                  <p className="text-sm text-slate-300">{result.resume_sections?.professional_summary || result.resume_summary}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-cyan-300">Core Skills</p>
                  <p className="text-sm text-slate-300">
                    {(result.resume_sections?.core_skills && result.resume_sections.core_skills.length)
                      ? result.resume_sections.core_skills.join(', ')
                      : skills || 'No skills provided'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-cyan-300">Projects</p>
                  <p className="text-sm text-slate-300">
                    {(result.resume_sections?.projects && result.resume_sections.projects.length)
                      ? result.resume_sections.projects.join(', ')
                      : projects || 'No projects provided'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-cyan-300">Achievements</p>
                  <ul className="space-y-1">
                    {((result.resume_sections?.achievements && result.resume_sections.achievements.length)
                      ? result.resume_sections.achievements
                      : result.bullet_point_achievements || []).map((item, idx) => (
                      <li key={idx} className="text-sm text-slate-300">- {item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div>
              <button
                onClick={handleDownloadResumePdf}
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-md"
              >
                Download Resume (PDF)
              </button>
            </div>
          </div>
        )}

        <button
          onClick={() => router.push('/dashboard')}
          className="mt-8 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-md"
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default ResumePage;
