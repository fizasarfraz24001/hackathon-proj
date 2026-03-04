"use client";

import { useMemo, useState } from "react";

type Track = {
  title: string;
  focus: string;
  starterRole: string;
  requiredSkills: string[];
  sprintPlan: string[];
};

const tracksByInterest: Record<string, Track[]> = {
  Technology: [
    {
      title: "Web App Builder",
      focus: "Frontend products and dashboards",
      starterRole: "Junior Frontend Developer",
      requiredSkills: ["HTML", "CSS", "JavaScript", "React", "Git"],
      sprintPlan: ["Build 2 UI clones", "Create 1 React app", "Deploy portfolio to GitHub"],
    },
    {
      title: "Data Story Analyst",
      focus: "Transform raw data into insights",
      starterRole: "Junior Data Analyst",
      requiredSkills: ["Excel", "SQL", "Python", "Dashboarding"],
      sprintPlan: ["Solve SQL tasks", "Create 1 notebook", "Publish 1 dashboard"],
    },
  ],
  Business: [
    {
      title: "Growth Marketing Runner",
      focus: "Campaign execution and analytics",
      starterRole: "Digital Marketing Assistant",
      requiredSkills: ["Content Writing", "SEO", "Social Media", "Analytics"],
      sprintPlan: ["Build a content calendar", "Run mock campaign", "Submit analytics report"],
    },
    {
      title: "Business Problem Solver",
      focus: "Requirement analysis and process thinking",
      starterRole: "Junior Business Analyst",
      requiredSkills: ["Excel", "Documentation", "Presentation", "Stakeholder Mapping"],
      sprintPlan: ["Draft 2 case docs", "Create process flow", "Present findings"],
    },
  ],
  Design: [
    {
      title: "Product Experience Designer",
      focus: "UX research to polished interfaces",
      starterRole: "Junior UI UX Designer",
      requiredSkills: ["Figma", "Wireframing", "Research", "Design Systems"],
      sprintPlan: ["Wireframe mobile app", "Create clickable prototype", "Publish case study"],
    },
    {
      title: "Brand Visual Creator",
      focus: "Brand identity and visual storytelling",
      starterRole: "Graphic Design Intern",
      requiredSkills: ["Typography", "Color Theory", "Branding", "Visual Hierarchy"],
      sprintPlan: ["Design logo set", "Build social pack", "Export portfolio boards"],
    },
  ],
};

const navItems = [
  { label: "Home", href: "#home" },
  { label: "Tracks", href: "#tracks" },
  { label: "Career Lab", href: "#career-lab" },
  { label: "FAQ", href: "#faq" },
];

export default function Home() {
  const [name, setName] = useState("");
  const [education, setEducation] = useState("University Student");
  const [interests, setInterests] = useState<string[]>([]);
  const [skills, setSkills] = useState("");
  const [showResults, setShowResults] = useState(false);

  const normalizedSkills = useMemo(
    () => skills.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean),
    [skills],
  );

  const recommendations = useMemo(() => {
    if (interests.length === 0) return tracksByInterest.Technology;
    return interests.flatMap((interest) => tracksByInterest[interest] ?? []).slice(0, 3);
  }, [interests]);

  const toggleInterest = (interest: string) => {
    setInterests((prev) => (prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]));
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100" id="home">
      <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div>
            <p className="text-xs text-cyan-300">SkillSprint</p>
            <p className="text-lg font-bold">Youth Career Navigator</p>
          </div>
          <nav className="hidden gap-4 text-sm md:flex">
            {navItems.map((item) => (
              <a key={item.href} href={item.href} className="text-slate-300 hover:text-cyan-300">
                {item.label}
              </a>
            ))}
          </nav>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <h1 className="max-w-4xl text-4xl font-bold md:text-6xl">Move from career confusion to clear progress</h1>
        <p className="mt-4 max-w-3xl text-slate-300">
          A practical platform for students and graduates to discover career tracks, identify skill gaps,
          and follow a weekly plan toward internships and jobs.
        </p>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-14" id="tracks">
        <h2 className="text-2xl font-semibold md:text-3xl">Core Platform Features</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <FeatureCard title="AI Track Builder" description="Personalized paths based on interests and skills." />
          <FeatureCard title="Skill Gap Radar" description="Highlights what to learn first for faster growth." />
          <FeatureCard title="Weekly Sprint Planner" description="Actionable task plan for each track." />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-20" id="career-lab">
        <h2 className="text-2xl font-semibold md:text-3xl">Career Lab Demo</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setShowResults(true);
          }}
          className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-6"
        >
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm text-slate-300">Full Name</span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2"
                placeholder="Alex Khan"
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm text-slate-300">Education Level</span>
              <select
                value={education}
                onChange={(e) => setEducation(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2"
              >
                <option>College Student</option>
                <option>University Student</option>
                <option>Fresh Graduate</option>
                <option>Career Switcher</option>
              </select>
            </label>
          </div>

          <div className="mt-5">
            <p className="mb-2 text-sm text-slate-300">Select Interests</p>
            <div className="flex flex-wrap gap-2">
              {["Technology", "Business", "Design"].map((interest) => (
                <button
                  key={interest}
                  type="button"
                  onClick={() => toggleInterest(interest)}
                  className={`rounded-full border px-4 py-2 text-sm ${
                    interests.includes(interest)
                      ? "border-cyan-400 bg-cyan-500/20 text-cyan-100"
                      : "border-slate-700 bg-slate-950 text-slate-300"
                  }`}
                >
                  {interest}
                </button>
              ))}
            </div>
          </div>

          <label className="mt-5 block space-y-2">
            <span className="text-sm text-slate-300">Current Skills (comma separated)</span>
            <input
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2"
              placeholder="HTML, CSS, Communication"
            />
          </label>

          <button className="mt-6 rounded-lg bg-cyan-500 px-5 py-2.5 font-semibold text-slate-900" type="submit">
            Generate Recommendations
          </button>
        </form>

        {showResults && (
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {recommendations.map((track) => (
              <article key={track.title} className="rounded-xl border border-slate-800 bg-slate-900 p-5">
                <h3 className="text-lg font-semibold">{track.title}</h3>
                <p className="mt-1 text-sm text-slate-300">{track.focus}</p>
                <p className="mt-2 text-sm text-slate-300">Starter role: {track.starterRole}</p>
                <p className="mt-4 text-sm font-medium text-amber-300">Priority Gap</p>
                <ul className="mt-2 list-inside list-disc text-sm text-slate-300">
                  {track.requiredSkills
                    .filter((skill) => !normalizedSkills.includes(skill.toLowerCase()))
                    .slice(0, 3)
                    .map((skill) => (
                      <li key={skill}>{skill}</li>
                    ))}
                </ul>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-20" id="faq">
        <h2 className="text-2xl font-semibold md:text-3xl">Quick FAQ</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <FaqItem
            question="What if I am a complete beginner?"
            answer="The platform starts you with a beginner roadmap and gradually increases difficulty."
          />
          <FaqItem
            question="Is this only for tech students?"
            answer="No. You can select Technology, Business, or Design tracks."
          />
          <FaqItem
            question="How quickly do I get recommendations?"
            answer="Recommendations are generated immediately after submitting the form."
          />
          <FaqItem
            question="Does this support internship preparation?"
            answer="Yes. You get learning focus points and guidance for role based preparation."
          />
        </div>
      </section>
    </main>
  );
}

function FeatureCard({ title, description }: { title: string; description: string }) {
  return (
    <article className="rounded-xl border border-slate-800 bg-slate-900 p-5">
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-slate-300">{description}</p>
    </article>
  );
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  return (
    <details className="group rounded-xl border border-slate-800 bg-slate-900 p-5">
      <summary className="cursor-pointer list-none text-base font-semibold text-cyan-200">
        <span className="flex items-center justify-between gap-3">
          {question}
          <span className="text-slate-400 transition group-open:rotate-45">+</span>
        </span>
      </summary>
      <p className="mt-3 text-sm text-slate-300">{answer}</p>
    </details>
  );
}
