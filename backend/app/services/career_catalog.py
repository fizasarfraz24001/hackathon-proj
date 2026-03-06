from typing import Dict, List


CAREER_DOMAINS: Dict[str, Dict[str, List[dict]]] = {
    "Technology & IT": {
        "keywords": ["technology", "it", "software", "data", "ai", "programming", "tech"],
        "careers": [
            {
                "title": "Frontend Developer",
                "description": "Build user-friendly web interfaces and collaborate with design teams.",
                "required_skills": ["HTML", "CSS", "JavaScript", "React", "Git"],
                "entry_roles": ["Frontend Intern", "Junior Frontend Developer"],
            },
            {
                "title": "IT Support Specialist",
                "description": "Troubleshoot systems, support users, and maintain IT operations.",
                "required_skills": ["Networking Basics", "Troubleshooting", "Customer Support", "Operating Systems"],
                "entry_roles": ["IT Support Intern", "Helpdesk Technician"],
            },
        ],
    },
    "Healthcare & Medical": {
        "keywords": ["health", "healthcare", "medical", "biology", "patient"],
        "careers": [
            {
                "title": "Medical Laboratory Technician",
                "description": "Perform laboratory tests and support clinical diagnostics.",
                "required_skills": ["Biology", "Lab Procedures", "Data Recording", "Attention to Detail"],
                "entry_roles": ["Lab Assistant", "Junior Lab Technician"],
            },
            {
                "title": "Healthcare Support Specialist",
                "description": "Assist care teams with records, scheduling, and patient support.",
                "required_skills": ["Communication", "Medical Terminology Basics", "Empathy", "Data Entry"],
                "entry_roles": ["Clinic Support Intern", "Healthcare Assistant"],
            },
        ],
    },
    "Business & Management": {
        "keywords": ["business", "management", "operations", "leadership"],
        "careers": [
            {
                "title": "Business Operations Associate",
                "description": "Support workflow planning, reporting, and process improvement.",
                "required_skills": ["Communication", "Spreadsheet Skills", "Problem Solving", "Team Collaboration"],
                "entry_roles": ["Operations Intern", "Business Assistant"],
            },
            {
                "title": "Project Coordinator",
                "description": "Coordinate project tasks, timelines, and team updates.",
                "required_skills": ["Project Planning", "Documentation", "Stakeholder Communication", "Organization"],
                "entry_roles": ["Project Assistant", "Junior Coordinator"],
            },
        ],
    },
    "Finance & Accounting": {
        "keywords": ["finance", "accounting", "audit", "tax", "bookkeeping"],
        "careers": [
            {
                "title": "Accounts Assistant",
                "description": "Support bookkeeping, reconciliations, and financial reporting.",
                "required_skills": ["Bookkeeping", "Excel", "Attention to Detail", "Basic Accounting"],
                "entry_roles": ["Accounting Intern", "Accounts Clerk"],
            },
            {
                "title": "Financial Analyst Trainee",
                "description": "Help analyze budgets and financial trends for decision support.",
                "required_skills": ["Excel", "Financial Modeling Basics", "Data Analysis", "Reporting"],
                "entry_roles": ["Finance Intern", "Junior Financial Analyst"],
            },
        ],
    },
    "Marketing & Sales": {
        "keywords": ["marketing", "sales", "branding", "advertising", "seo"],
        "careers": [
            {
                "title": "Digital Marketing Associate",
                "description": "Support campaigns, content, and channel performance analysis.",
                "required_skills": ["SEO", "Content Writing", "Social Media", "Analytics Basics"],
                "entry_roles": ["Marketing Intern", "Digital Marketing Executive"],
            },
            {
                "title": "Sales Development Representative",
                "description": "Identify leads and support sales pipeline growth.",
                "required_skills": ["Communication", "CRM Basics", "Negotiation", "Presentation"],
                "entry_roles": ["Sales Intern", "Junior Sales Representative"],
            },
        ],
    },
    "Education & Teaching": {
        "keywords": ["education", "teaching", "learning", "training", "school"],
        "careers": [
            {
                "title": "Teaching Assistant",
                "description": "Support instructors with lesson delivery and student engagement.",
                "required_skills": ["Communication", "Lesson Support", "Student Mentoring", "Classroom Management Basics"],
                "entry_roles": ["Classroom Assistant", "Academic Support Intern"],
            },
            {
                "title": "Learning Content Coordinator",
                "description": "Create and organize learning materials for online and offline learners.",
                "required_skills": ["Content Development", "Presentation", "Digital Tools", "Organization"],
                "entry_roles": ["Education Program Intern", "Content Assistant"],
            },
        ],
    },
    "Design & Creative Arts": {
        "keywords": ["design", "creative", "art", "ui", "ux", "media"],
        "careers": [
            {
                "title": "Graphic Designer",
                "description": "Design visuals for digital campaigns, products, and communication.",
                "required_skills": ["Design Principles", "Typography", "Adobe/Canva Tools", "Creativity"],
                "entry_roles": ["Design Intern", "Junior Graphic Designer"],
            },
            {
                "title": "UI Designer",
                "description": "Create user-centered interfaces and visual design systems.",
                "required_skills": ["Wireframing", "Figma", "Visual Hierarchy", "User Research Basics"],
                "entry_roles": ["UI Design Intern", "Junior UI Designer"],
            },
        ],
    },
    "Engineering": {
        "keywords": ["engineering", "mechanical", "electrical", "civil"],
        "careers": [
            {
                "title": "Junior CAD Technician",
                "description": "Prepare technical drawings and support engineering documentation.",
                "required_skills": ["CAD Tools", "Technical Drawing", "Math Basics", "Attention to Detail"],
                "entry_roles": ["Engineering Drafting Intern", "CAD Assistant"],
            },
            {
                "title": "Engineering Project Assistant",
                "description": "Support project coordination and technical reporting for engineering teams.",
                "required_skills": ["Project Coordination", "Documentation", "Data Analysis", "Problem Solving"],
                "entry_roles": ["Engineering Intern", "Project Support Assistant"],
            },
        ],
    },
    "Law & Public Policy": {
        "keywords": ["law", "policy", "legal", "public policy", "government"],
        "careers": [
            {
                "title": "Legal Research Assistant",
                "description": "Assist with legal research, document preparation, and case support.",
                "required_skills": ["Research", "Legal Writing Basics", "Critical Thinking", "Documentation"],
                "entry_roles": ["Legal Intern", "Paralegal Assistant"],
            },
            {
                "title": "Policy Research Assistant",
                "description": "Support public policy analysis and reporting for social impact projects.",
                "required_skills": ["Policy Analysis Basics", "Research", "Communication", "Report Writing"],
                "entry_roles": ["Policy Intern", "Public Affairs Assistant"],
            },
        ],
    },
    "Social Work & Psychology": {
        "keywords": ["social work", "psychology", "counseling", "community"],
        "careers": [
            {
                "title": "Community Support Worker",
                "description": "Assist community programs and support vulnerable groups.",
                "required_skills": ["Empathy", "Case Documentation", "Communication", "Community Outreach"],
                "entry_roles": ["Social Services Intern", "Support Worker Assistant"],
            },
            {
                "title": "Behavioral Health Assistant",
                "description": "Support mental health teams with client coordination and records.",
                "required_skills": ["Active Listening", "Confidentiality", "Documentation", "Empathy"],
                "entry_roles": ["Counseling Support Intern", "Behavioral Health Assistant"],
            },
        ],
    },
    "Hospitality & Tourism": {
        "keywords": ["hospitality", "tourism", "hotel", "travel", "customer service"],
        "careers": [
            {
                "title": "Hospitality Operations Associate",
                "description": "Support guest services, operations, and event coordination.",
                "required_skills": ["Customer Service", "Communication", "Organization", "Problem Solving"],
                "entry_roles": ["Hotel Operations Intern", "Guest Services Associate"],
            },
            {
                "title": "Travel Consultant Assistant",
                "description": "Help plan travel experiences and manage bookings.",
                "required_skills": ["Client Communication", "Booking Tools", "Planning", "Sales Basics"],
                "entry_roles": ["Travel Agency Intern", "Tour Coordinator Assistant"],
            },
        ],
    },
    "Skilled Trades": {
        "keywords": ["skilled trades", "trade", "electrician", "plumbing", "construction", "mechanic"],
        "careers": [
            {
                "title": "Electrical Technician Trainee",
                "description": "Support electrical installations, maintenance, and safety checks.",
                "required_skills": ["Electrical Basics", "Safety Procedures", "Tool Handling", "Troubleshooting"],
                "entry_roles": ["Electrical Apprentice", "Maintenance Helper"],
            },
            {
                "title": "HVAC Assistant Technician",
                "description": "Assist HVAC teams with installation and servicing tasks.",
                "required_skills": ["Mechanical Basics", "Equipment Handling", "Safety Compliance", "Diagnostics"],
                "entry_roles": ["HVAC Apprentice", "Service Assistant"],
            },
        ],
    },
    "Public Service": {
        "keywords": ["public service", "government", "community service", "administration", "civic"],
        "careers": [
            {
                "title": "Public Program Assistant",
                "description": "Support community and civic programs with coordination and outreach.",
                "required_skills": ["Communication", "Program Coordination", "Documentation", "Community Outreach"],
                "entry_roles": ["Program Intern", "Public Service Assistant"],
            },
            {
                "title": "Administrative Services Assistant",
                "description": "Support public office operations, records, and citizen service requests.",
                "required_skills": ["Office Tools", "Record Management", "Communication", "Problem Solving"],
                "entry_roles": ["Administrative Intern", "Office Assistant"],
            },
        ],
    },
}


GLOBAL_PLATFORMS = [
    "Coursera",
    "edX",
    "Khan Academy",
    "FutureLearn",
    "Udemy",
    "Google Career Certificates",
    "DigiSkills",
]


LOCAL_MONTGOMERY_PROVIDERS = [
    {"name": "Auburn University at Montgomery", "link": "https://www.aum.edu"},
    {"name": "Trenholm State Community College", "link": "https://trenholmstate.edu"},
    {"name": "Troy University Montgomery Campus", "link": "https://www.troy.edu/location/montgomery.html"},
    {
        "name": "Montgomery City-County Public Library learning programs",
        "link": "https://mcpl.lib.al.us",
    },
    {"name": "Alabama Career Center training programs", "link": "https://www.labor.alabama.gov"},
]
