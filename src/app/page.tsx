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
      focus: "Frontend products and dashboard experiences",
      starterRole: "Junior Frontend Developer",
      requiredSkills: ["HTML", "CSS", "JavaScript", "React", "Git"],
      sprintPlan: ["Build 2 UI clones", "Create 1 React project", "Deploy portfolio to GitHub"],
    },
    {
      title: "Data Story Analyst",
      focus: "Transform raw data into clear business insights",
      starterRole: "Junior Data Analyst",
      requiredSkills: ["Excel", "SQL", "Python", "Dashboarding"],
      sprintPlan: ["Solve SQL practice set", "Create notebook analysis", "Publish 1 dashboard case"],
    },
  ],
  Business: [
    {
      title: "Growth Marketing Runner",
      focus: "Campaign planning and measurable growth",
      starterRole: "Digital Marketing Assistant",
      requiredSkills: ["Content Writing", "SEO", "Social Media", "Analytics"],
      sprintPlan: ["Plan content calendar", "Run campaign simulation", "Publish campaign report"],
    },
    {
      title: "Business Problem Solver",
      focus: "Requirement analysis and process improvement",
      starterRole: "Junior Business Analyst",
      requiredSkills: ["Excel", "Documentation", "Presentation", "Stakeholder Mapping"],
      sprintPlan: ["Write 2 case documents", "Build process flow", "Present solutions"],
    },
  ],
  Design: [
    {
      title: "Product Experience Designer",
      focus: "UX research to polished interface design",
      starterRole: "Junior UI UX Designer",
      requiredSkills: ["Figma", "Wireframing", "Research", "Design Systems"],
      sprintPlan: ["Wireframe mobile app", "Create clickable prototype", "Publish case study"],
    },
    {
      title: "Brand Visual Creator",
      focus: "Brand identity and visual storytelling",
      starterRole: "Graphic Design Intern",
      requiredSkills: ["Typography", "Color Theory", "Branding", "Visual Hierarchy"],
      sprintPlan: ["Design logo set", "Build social kit", "Export presentation boards"],
    },
  ],
};

const navItems = [
  { label: "Home", href: "#home" },
  { label: "Features", href: "#features" },
  { label: "Career Lab", href: "#career-lab" },
  { label: "Contact", href: "#contact" },
];

const authBackendValues = {
  signin: "student_signin",
  login: "student_login",
} as const;

const advancedFeatures = [
  {
    title: "AI Resume Studio",
    description: "Generate targeted resume summaries and achievement bullets for each role.",
  },
  {
    title: "Job Match Score",
    description: "See how close your profile is to job descriptions and what to improve next.",
  },
  {
    title: "Skill Progress Tracker",
    description: "Track completed sprints, time spent, and skill milestones in one dashboard.",
  },
  {
    title: "Interview Simulator",
    description: "Practice role-specific interview questions with confidence score feedback.",
  },
  {
    title: "Mentor Connect",
    description: "Get community mentor guidance to remove blockers and improve direction.",
  },
  {
    title: "Opportunity Alerts",
    description: "Receive internship and entry-level alerts based on your selected track.",
  },
];

const successStories = [
  {
    name: "Areeba S.",
    role: "UI UX Intern",
    quote: "The sprint plan helped me build my first design case study and land an internship interview.",
  },
  {
    name: "Hassan R.",
    role: "Junior Data Analyst",
    quote: "Skill gap radar made my learning path clear. I focused on SQL and got shortlisted in 3 weeks.",
  },
  {
    name: "Maham K.",
    role: "Digital Marketing Trainee",
    quote: "The platform gave me campaign tasks and portfolio ideas that improved my job applications.",
  },
];

export default function Home() {
  const [name, setName] = useState("");
  const [education, setEducation] = useState("University Student");
  const [interests, setInterests] = useState<string[]>([]);
  const [skills, setSkills] = useState("");
  const [weeklyHours, setWeeklyHours] = useState("6-8");
  const [showResults, setShowResults] = useState(false);
  const [account, setAccount] = useState<{ name: string; email: string; password: string } | null>(null);
  const [authMode, setAuthMode] = useState<"create" | "signin" | "login">("create");
  const [authMessage, setAuthMessage] = useState("");
  const [newStudentName, setNewStudentName] = useState("");
  const [newStudentEmail, setNewStudentEmail] = useState("");
  const [newStudentPassword, setNewStudentPassword] = useState("");
  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactSubject, setContactSubject] = useState("Mentorship Request");
  const [contactMessage, setContactMessage] = useState("");
  const [contactStatus, setContactStatus] = useState("");
  const [activeAuthBackendValue, setActiveAuthBackendValue] = useState<string>("");

  const normalizedSkills = useMemo(
    () => skills.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean),
    [skills],
  );

  const recommendations = useMemo(() => {
    if (interests.length === 0) return tracksByInterest.Technology;
    return interests.flatMap((interest) => tracksByInterest[interest] ?? []).slice(0, 3);
  }, [interests]);

  const toggleInterest = (interest: string) => {
    setInterests((prev) =>
      prev.includes(interest) ? prev.filter((item) => item !== interest) : [...prev, interest],
    );
  };

  const handleCreateAccount = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!newStudentName || !newStudentEmail || !newStudentPassword) {
      setAuthMessage("Please fill all account fields.");
      return;
    }

    const createdAccount = {
      name: newStudentName,
      email: newStudentEmail.toLowerCase(),
      password: newStudentPassword,
    };

    setAccount(createdAccount);
    setContactName(createdAccount.name);
    setContactEmail(createdAccount.email);
    setAuthMessage("Account created successfully. You can now send message to the team.");
    setAuthMode("signin");
    setSignInEmail(createdAccount.email);
    setSignInPassword(createdAccount.password);
    setActiveAuthBackendValue(authBackendValues.signin);
  };

  const handleSignIn = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!account) {
      setAuthMessage("No account found. Please create account first.");
      return;
    }

    const modeValue = authMode === "login" ? authBackendValues.login : authBackendValues.signin;

    if (account.email === signInEmail.toLowerCase() && account.password === signInPassword) {
      setContactName(account.name);
      setContactEmail(account.email);
      setActiveAuthBackendValue(modeValue);
      setAuthMessage(
        `${authMode === "login" ? "Login" : "Sign in"} successful. Backend value: ${modeValue}. You can now send message to the team.`,
      );
      return;
    }

    setAuthMessage("Invalid email or password. Please try again.");
  };

  const handleSendMessage = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!account) {
      setContactStatus("Please create account or sign in before sending message.");
      return;
    }

    if (!contactName || !contactEmail || !contactMessage) {
      setContactStatus("Please complete required fields before sending.");
      return;
    }

    setContactStatus(
      `Message sent successfully with auth value: ${activeAuthBackendValue || "none"}. Team will reach out soon.`,
    );
    setContactMessage("");
  };

  return (
    <main
      className="min-h-screen bg-linear-to-br from-slate-950 via-indigo-950 to-slate-900 text-slate-100"
      id="home"
    >
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-80 w-80 rounded-full bg-fuchsia-500/30 blur-3xl" />
        <div className="absolute -right-40 top-20 h-96 w-96 rounded-full bg-cyan-400/30 blur-3xl" />
        <div className="absolute bottom-10 left-1/3 h-72 w-72 rounded-full bg-amber-400/20 blur-3xl" />
      </div>

      <header className="sticky top-0 z-40 border-b border-fuchsia-400/20 bg-slate-950/70 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div>
            <p className="text-xs text-cyan-300">SkillSprint</p>
            <p className="text-lg font-bold tracking-tight">Youth Career Navigator</p>
          </div>
          <div className="flex items-center gap-3">
            <nav className="hidden items-center gap-5 text-sm md:flex">
              {navItems.map((item) => (
                <a key={item.href} href={item.href} className="text-slate-200 transition hover:text-fuchsia-300">
                  {item.label}
                </a>
              ))}
            </nav>
            <a
              href="#student-auth"
              onClick={() => {
                setAuthMode("signin");
                setActiveAuthBackendValue(authBackendValues.signin);
              }}
              className="inline-flex items-center gap-1.5 rounded-md bg-linear-to-r from-cyan-500 to-blue-500 px-3 py-1.5 text-xs font-semibold text-white shadow-md shadow-cyan-500/30 transition hover:from-cyan-400 hover:to-blue-400"
            >
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-sm bg-white/15 text-white">
                <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5" aria-hidden>
                  <path
                    d="M8 11V8a4 4 0 118 0v3M7 11h10a1 1 0 011 1v7a1 1 0 01-1 1H7a1 1 0 01-1-1v-7a1 1 0 011-1z"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <span>Sign In</span>
            </a>
            <a
              href="#student-auth"
              onClick={() => {
                setAuthMode("login");
                setActiveAuthBackendValue(authBackendValues.login);
              }}
              className="inline-flex items-center gap-1.5 rounded-md bg-linear-to-r from-fuchsia-500 to-violet-500 px-3 py-1.5 text-xs font-semibold text-white shadow-md shadow-fuchsia-500/30 transition hover:from-fuchsia-400 hover:to-violet-400"
            >
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-sm bg-white/15 text-white">
                <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5" aria-hidden>
                  <path
                    d="M15 8l4 4m0 0l-4 4m4-4H9M5 4h8a2 2 0 012 2v2"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <span>Login</span>
            </a>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-18 md:py-24">
        <p className="inline-flex rounded-full border border-fuchsia-400/40 bg-fuchsia-500/20 px-4 py-1 text-xs text-fuchsia-100">
          AI powered growth platform for students and fresh graduates
        </p>
        <h1 className="mt-5 max-w-4xl text-4xl font-bold leading-tight tracking-tight md:text-6xl">
          Build career clarity, close skill gaps, and get job-ready faster
        </h1>
        <p className="mt-5 max-w-3xl text-lg text-slate-300">
          Discover the best career tracks, get personalized sprint plans, practice interviews, and follow
          a guided roadmap from beginner to internship-ready candidate.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <StatCard title="3x" subtitle="faster role clarity" />
          <StatCard title="6+" subtitle="high impact tools" />
          <StatCard title="Weekly" subtitle="measurable progress" />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-14" id="features">
        <h2 className="text-2xl font-semibold md:text-3xl">Modern career navigator features</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {advancedFeatures.map((item) => (
            <FeatureCard key={item.title} title={item.title} description={item.description} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-14">
        <h2 className="text-2xl font-semibold md:text-3xl">How the journey works</h2>
        <ol className="mt-6 grid gap-3 md:grid-cols-4">
          {[
            "Set up profile and interests",
            "Get AI track recommendations",
            "Follow skill sprint roadmap",
            "Apply with stronger profile",
          ].map((step, index) => (
            <li key={step} className="rounded-xl border border-fuchsia-400/20 bg-slate-900/80 p-5">
              <span className="mb-3 inline-block rounded-full bg-fuchsia-500/20 px-3 py-1 text-xs text-fuchsia-100">
                Step {index + 1}
              </span>
              <p className="text-slate-300">{step}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-20" id="career-lab">
        <h2 className="text-2xl font-semibold md:text-3xl">Career Lab</h2>
        <p className="mt-2 text-slate-300">
          Fill this form to preview personalized recommendations and priority skill gaps.
        </p>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            setShowResults(true);
          }}
          className="mt-6 rounded-2xl border border-fuchsia-400/20 bg-slate-900/80 p-6 shadow-xl shadow-cyan-500/10"
        >
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm text-slate-300">Full Name</span>
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 outline-none ring-fuchsia-400 focus:ring"
                placeholder="Alex Khan"
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm text-slate-300">Education Level</span>
              <select
                value={education}
                onChange={(event) => setEducation(event.target.value)}
                className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 outline-none ring-fuchsia-400 focus:ring"
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
                  className={`rounded-full border px-4 py-2 text-sm transition ${
                    interests.includes(interest)
                      ? "border-fuchsia-300 bg-fuchsia-500/20 text-fuchsia-100"
                      : "border-slate-600 bg-slate-900 text-slate-300 hover:border-fuchsia-500/60"
                  }`}
                >
                  {interest}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm text-slate-300">Current Skills (comma separated)</span>
              <input
                value={skills}
                onChange={(event) => setSkills(event.target.value)}
                className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 outline-none ring-fuchsia-400 focus:ring"
                placeholder="HTML, CSS, Communication"
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm text-slate-300">Weekly Learning Hours</span>
              <select
                value={weeklyHours}
                onChange={(event) => setWeeklyHours(event.target.value)}
                className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 outline-none ring-fuchsia-400 focus:ring"
              >
                <option value="3-5">3-5 hours</option>
                <option value="6-8">6-8 hours</option>
                <option value="8-12">8-12 hours</option>
                <option value="12+">12+ hours</option>
              </select>
            </label>
          </div>

          <button
            className="mt-6 rounded-lg bg-linear-to-r from-fuchsia-500 to-cyan-400 px-5 py-2.5 font-semibold text-white shadow-lg shadow-fuchsia-500/20"
            type="submit"
          >
            Generate Recommendations
          </button>
        </form>

        {showResults && (
          <div className="mt-8 space-y-4">
            <p className="rounded-xl border border-fuchsia-400/40 bg-fuchsia-500/10 px-4 py-3 text-fuchsia-100">
              {name ? `${name}, ` : ""}
              these are your best matched tracks ({education}) with a {weeklyHours} study plan.
            </p>

            <div className="grid gap-4 md:grid-cols-3">
              {recommendations.map((track) => (
                <article key={track.title} className="rounded-xl border border-cyan-400/20 bg-slate-900/85 p-5">
                  <h3 className="text-lg font-semibold">{track.title}</h3>
                  <p className="mt-1 text-sm text-slate-300">{track.focus}</p>
                  <p className="mt-2 text-sm text-slate-300">Starter role: {track.starterRole}</p>

                  <p className="mt-4 text-sm font-medium text-rose-300">Priority skill gaps</p>
                  <ul className="mt-2 list-inside list-disc text-sm text-slate-300">
                    {track.requiredSkills
                      .filter((skill) => !normalizedSkills.includes(skill.toLowerCase()))
                      .slice(0, 3)
                      .map((skill) => (
                        <li key={skill}>{skill}</li>
                      ))}
                  </ul>

                  <p className="mt-4 text-sm font-medium text-cyan-300">Next sprint tasks</p>
                  <ul className="mt-2 list-inside list-disc text-sm text-slate-300">
                    {track.sprintPlan.map((task) => (
                      <li key={task}>{task}</li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </div>
        )}
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-16">
        <div className="rounded-2xl border border-cyan-400/20 bg-slate-900/70 p-6 md:p-8">
          <h2 className="text-2xl font-semibold md:text-3xl">Success stories from learners</h2>
          <p className="mt-2 max-w-2xl text-slate-300">
            Real progress from students and graduates who used guided tracks and weekly sprints.
          </p>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {successStories.map((story) => (
              <article key={story.name} className="rounded-xl border border-fuchsia-400/20 bg-slate-950/60 p-5">
                <p className="text-sm text-slate-200">&quot;{story.quote}&quot;</p>
                <p className="mt-4 text-sm font-semibold text-fuchsia-200">{story.name}</p>
                <p className="text-xs text-slate-400">{story.role}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-16" id="student-auth">
        <div className="grid gap-6 rounded-3xl border border-fuchsia-400/25 bg-linear-to-br from-slate-900/90 via-indigo-950/40 to-slate-900/80 p-6 shadow-2xl shadow-fuchsia-900/20 md:grid-cols-2 md:p-8">
          <div className="rounded-2xl border border-cyan-400/20 bg-slate-900/50 p-5">
            <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-linear-to-br from-fuchsia-500 to-cyan-400 text-white">
              <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden>
                <path
                  d="M12 12a4 4 0 100-8 4 4 0 000 8zM5 20a7 7 0 1114 0"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h2 className="mt-4 text-2xl font-semibold md:text-3xl">Student Portal</h2>
            <p className="mt-2 max-w-md text-slate-300">
              Create your student account, sign in, and then send message directly to the Career Navigator
              team.
            </p>

            <div className="mt-5 inline-flex rounded-xl border border-slate-700 bg-slate-900/70 p-1">
              <button
                type="button"
                onClick={() => setAuthMode("create")}
                className={`rounded-lg px-4 py-2 text-sm transition ${
                  authMode === "create"
                    ? "bg-linear-to-r from-fuchsia-500 to-cyan-400 text-white shadow-lg shadow-fuchsia-500/20"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                Create Account
              </button>
              <button
                type="button"
                onClick={() => setAuthMode("signin")}
                className={`rounded-lg px-4 py-2 text-sm transition ${
                  authMode === "signin"
                    ? "bg-linear-to-r from-cyan-500 to-fuchsia-500 text-white shadow-lg shadow-cyan-500/20"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setAuthMode("login")}
                className={`rounded-lg px-4 py-2 text-sm transition ${
                  authMode === "login"
                    ? "bg-linear-to-r from-violet-500 to-fuchsia-500 text-white shadow-lg shadow-violet-500/20"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                Login
              </button>
            </div>

            {authMessage && (
              <p className="mt-4 rounded-lg border border-cyan-400/30 bg-cyan-500/10 px-3 py-2 text-sm text-cyan-100">
                {authMessage}
              </p>
            )}
          </div>

          {authMode === "create" ? (
            <form
              onSubmit={handleCreateAccount}
              className="rounded-2xl border border-fuchsia-400/20 bg-slate-900/70 p-5 shadow-xl shadow-fuchsia-900/20"
            >
              <div className="grid gap-4">
                <label className="space-y-2">
                  <span className="text-sm text-slate-300">Student Name</span>
                  <input
                    value={newStudentName}
                    onChange={(event) => setNewStudentName(event.target.value)}
                    className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 outline-none ring-fuchsia-400 focus:ring"
                    placeholder="Your full name"
                  />
                </label>
                <label className="space-y-2">
                  <span className="text-sm text-slate-300">Email</span>
                  <input
                    type="email"
                    value={newStudentEmail}
                    onChange={(event) => setNewStudentEmail(event.target.value)}
                    className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 outline-none ring-fuchsia-400 focus:ring"
                    placeholder="student@example.com"
                  />
                </label>
                <label className="space-y-2">
                  <span className="text-sm text-slate-300">Password</span>
                  <input
                    type="password"
                    value={newStudentPassword}
                    onChange={(event) => setNewStudentPassword(event.target.value)}
                    className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 outline-none ring-fuchsia-400 focus:ring"
                    placeholder="Create password"
                  />
                </label>
                <button
                  type="submit"
                  className="w-full rounded-lg bg-linear-to-r from-fuchsia-500 to-cyan-400 px-5 py-2.5 font-semibold text-white"
                >
                  Generate Student Account
                </button>
              </div>
            </form>
          ) : (
            <form
              onSubmit={handleSignIn}
              className="rounded-2xl border border-cyan-400/20 bg-slate-900/70 p-5 shadow-xl shadow-cyan-900/20"
            >
              <div className="grid gap-4">
                <div className="rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-xs text-slate-300">
                  Backend auth value:{" "}
                  <span className="font-semibold text-cyan-200">
                    {authMode === "login" ? authBackendValues.login : authBackendValues.signin}
                  </span>
                </div>
                <label className="space-y-2">
                  <span className="text-sm text-slate-300">Email</span>
                  <input
                    type="email"
                    value={signInEmail}
                    onChange={(event) => setSignInEmail(event.target.value)}
                    className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 outline-none ring-cyan-400 focus:ring"
                    placeholder="student@example.com"
                  />
                </label>
                <label className="space-y-2">
                  <span className="text-sm text-slate-300">Password</span>
                  <input
                    type="password"
                    value={signInPassword}
                    onChange={(event) => setSignInPassword(event.target.value)}
                    className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 outline-none ring-cyan-400 focus:ring"
                    placeholder="Enter password"
                  />
                </label>
                <button
                  type="submit"
                  className="w-full rounded-lg bg-linear-to-r from-cyan-500 to-fuchsia-500 px-5 py-2.5 font-semibold text-white"
                >
                  {authMode === "login" ? "Login" : "Sign In"}
                </button>
              </div>
            </form>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-20" id="contact">
        <div className="rounded-3xl border border-cyan-400/20 bg-linear-to-br from-indigo-900/70 via-slate-900 to-fuchsia-900/40 p-6 md:p-8">
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h2 className="text-2xl font-semibold md:text-3xl">Contact the Career Navigator team</h2>
              <p className="mt-2 max-w-md text-slate-300">
                Need mentorship support, campus onboarding, or a platform demo? Share your details and our
                team will get back to you.
              </p>

              <div className="mt-6 space-y-3">
                <div className="rounded-xl border border-cyan-400/20 bg-slate-900/50 p-4">
                  <p className="text-xs uppercase tracking-wide text-slate-400">Support Email</p>
                  <p className="mt-1 text-cyan-200">support@youthnavigator.ai</p>
                </div>
                <div className="rounded-xl border border-fuchsia-400/20 bg-slate-900/50 p-4">
                  <p className="text-xs uppercase tracking-wide text-slate-400">Partnerships</p>
                  <p className="mt-1 text-fuchsia-200">partnerships@youthnavigator.ai</p>
                </div>
                <div className="rounded-xl border border-amber-400/20 bg-slate-900/50 p-4">
                  <p className="text-xs uppercase tracking-wide text-slate-400">Response Time</p>
                  <p className="mt-1 text-amber-200">Within 24 hours</p>
                </div>
              </div>
            </div>

            <form
              onSubmit={handleSendMessage}
              className="rounded-2xl border border-fuchsia-400/20 bg-slate-900/60 p-5"
            >
              <div className="grid gap-4">
                <label className="space-y-2">
                  <span className="text-sm text-slate-300">Name</span>
                  <input
                    value={contactName}
                    onChange={(event) => setContactName(event.target.value)}
                    className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 outline-none ring-fuchsia-400 focus:ring"
                    placeholder="Your name"
                  />
                </label>
                <label className="space-y-2">
                  <span className="text-sm text-slate-300">Email</span>
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(event) => setContactEmail(event.target.value)}
                    className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 outline-none ring-fuchsia-400 focus:ring"
                    placeholder="you@example.com"
                  />
                </label>
                <label className="space-y-2">
                  <span className="text-sm text-slate-300">Subject</span>
                  <select
                    value={contactSubject}
                    onChange={(event) => setContactSubject(event.target.value)}
                    className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 outline-none ring-fuchsia-400 focus:ring"
                  >
                    <option>Mentorship Request</option>
                    <option>Demo Request</option>
                    <option>Partnership</option>
                    <option>General Support</option>
                  </select>
                </label>
                <label className="space-y-2">
                  <span className="text-sm text-slate-300">Message</span>
                  <textarea
                    rows={4}
                    value={contactMessage}
                    onChange={(event) => setContactMessage(event.target.value)}
                    className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 outline-none ring-fuchsia-400 focus:ring"
                    placeholder="Tell us what you need..."
                  />
                </label>
                {contactStatus && (
                  <p className="rounded-lg border border-cyan-400/30 bg-cyan-500/10 px-3 py-2 text-sm text-cyan-100">
                    {contactStatus}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={!account}
                  className="w-full rounded-lg bg-linear-to-r from-fuchsia-500 to-cyan-400 px-5 py-2.5 font-semibold text-white transition hover:from-fuchsia-400 hover:to-cyan-300"
                >
                  {account ? "Send Message" : "Create account or sign in first"}
                </button>
              </div>
            </form>
          </div>
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

function StatCard({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
      <p className="text-3xl font-bold text-cyan-300">{title}</p>
      <p className="mt-1 text-sm text-slate-300">{subtitle}</p>
    </div>
  );
}
