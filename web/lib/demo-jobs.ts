// Fictional presentation fixtures only. Not a production seed or API contract.
export const locations = [
  "Mogadishu", "Hargeisa", "Garowe", "Kismayo", "Baidoa", "Beledweyne",
  "Galkayo", "Bosaso", "Berbera", "Burao", "Jowhara", "Remote", "Other",
] as const;

export const categories = [
  "Health and Medicine", "Education and Training", "ICT and Technology",
  "Finance and Accounting", "Administration and Office", "Engineering and Construction",
  "NGO Humanitarian and Development", "Legal and Governance", "Logistics and Transport",
  "Hospitality and Tourism", "Sales Marketing and Media", "Agriculture and Environment",
  "Security", "Other",
] as const;

export const employerTypes = ["Private company", "NGO", "Government"] as const;
export const jobTypes = ["Full-time", "Contract", "Part-time"] as const;
export const PREVIEW_NOW = "2026-11-03T09:00:00+03:00";
export const PREVIEW_DATE_LABEL = "3 November 2026";

export type DemoJob = {
  id: string;
  title: string;
  employer: string;
  initials: string;
  location: (typeof locations)[number];
  category: (typeof categories)[number];
  type: "Full-time" | "Contract" | "Part-time";
  arrangement: "On-site" | "Hybrid" | "Remote";
  summary: string;
  applicationMethod: "Company website" | "Email" | "WhatsApp" | "Dalka recruitment";
  tone: "purple" | "green" | "amber";
  slug: string;
  employerType: (typeof employerTypes)[number];
  postedAt: string;
  closesAt: string;
  salary: string;
  responsibilities: readonly string[];
  requirements: readonly string[];
};

export const demoJobs: readonly DemoJob[] = [
  {
    id: "sample-01", title: "Frontend Engineer", employer: "Talo Digital Studio", initials: "TD",
    location: "Mogadishu", category: "ICT and Technology", type: "Full-time", arrangement: "Hybrid",
    summary: "Build thoughtful, accessible web experiences with a small team working on everyday digital services.",
    applicationMethod: "Company website", tone: "purple",
    slug: "frontend-engineer-talo-digital", employerType: "Private company",
    postedAt: "2026-11-03T08:00:00+03:00", closesAt: "2026-11-17T23:59:59+03:00", salary: "$1,200–1,800 USD / month · illustrative",
    responsibilities: ["Build responsive interfaces for everyday digital services.", "Work with designers to improve accessibility and performance.", "Review code, document decisions and help maintain reusable components."],
    requirements: ["Practical experience with modern JavaScript and a component framework.", "An understanding of semantic HTML, CSS and accessible interfaces.", "Clear communication and a collaborative approach to problem solving."],
  },
  {
    id: "sample-02", title: "Community Health Officer", employer: "Daryeel Community Initiative", initials: "DC",
    location: "Baidoa", category: "Health and Medicine", type: "Contract", arrangement: "On-site",
    summary: "Support community health programmes, coordinate outreach and help connect people with essential services.",
    applicationMethod: "Dalka recruitment", tone: "green",
    slug: "community-health-officer-daryeel", employerType: "NGO",
    postedAt: "2026-11-02T08:00:00+03:00", closesAt: "2026-11-09T23:59:59+03:00", salary: "Illustrative salary not specified",
    responsibilities: ["Coordinate community outreach with local health workers.", "Support programme monitoring and accurate activity reporting.", "Help families understand available services and referral pathways."],
    requirements: ["Relevant training in public health, nursing or community development.", "Experience working respectfully with local communities.", "Good organisation, communication and record-keeping skills."],
  },
  {
    id: "sample-03", title: "Finance & Administration Officer", employer: "Hilaac Learning Collective", initials: "HL",
    location: "Hargeisa", category: "Finance and Accounting", type: "Full-time", arrangement: "On-site",
    summary: "Bring clarity to day-to-day accounts, financial reporting and operations for a growing education team.",
    applicationMethod: "Email", tone: "amber",
    slug: "finance-administration-officer-hilaac", employerType: "Private company",
    postedAt: "2026-11-01T08:00:00+03:00", closesAt: "2026-11-05T23:59:59+03:00", salary: "$700–1,000 USD / month · illustrative",
    responsibilities: ["Maintain clear financial records and supporting documents.", "Prepare monthly summaries and help reconcile accounts.", "Support purchasing, scheduling and everyday office administration."],
    requirements: ["Relevant training in finance, accounting or business administration.", "Confidence working with spreadsheets and financial records.", "Attention to detail and discretion with organisational information."],
  },
  {
    id: "sample-04", title: "Programme Coordinator", employer: "Wadajir Development Lab", initials: "WD",
    location: "Garowe", category: "NGO Humanitarian and Development", type: "Contract", arrangement: "On-site",
    summary: "Work with local partners to plan community projects, track progress and turn good ideas into practical action.",
    applicationMethod: "Dalka recruitment", tone: "purple",
    slug: "programme-coordinator-wadajir", employerType: "NGO",
    postedAt: "2026-10-31T08:00:00+03:00", closesAt: "2026-11-08T23:59:59+03:00", salary: "Illustrative salary not specified",
    responsibilities: ["Turn project plans into manageable activities with local partners.", "Track milestones, budgets and programme reports.", "Organise team meetings and document decisions and follow-up actions."],
    requirements: ["Experience coordinating community or development projects.", "Strong planning and written communication skills.", "A practical, inclusive approach to working with partners."],
  },
  {
    id: "sample-05", title: "Product Designer", employer: "Talo Digital Studio", initials: "TD",
    location: "Remote", category: "ICT and Technology", type: "Full-time", arrangement: "Remote",
    summary: "Shape simple, useful digital products through research, clear visual design and close collaboration with engineers.",
    applicationMethod: "Company website", tone: "purple",
    slug: "product-designer-talo-digital", employerType: "Private company",
    postedAt: "2026-10-30T08:00:00+03:00", closesAt: "2026-11-20T23:59:59+03:00", salary: "$1,000–1,600 USD / month · illustrative",
    responsibilities: ["Understand user needs through research and feedback.", "Create clear interface flows, wireframes and visual designs.", "Partner with engineers to test and refine accessible experiences."],
    requirements: ["A portfolio showing thoughtful digital product design.", "Experience with interface prototyping and design systems.", "Ability to explain design choices and work with feedback."],
  },
  {
    id: "sample-06", title: "Logistics Assistant", employer: "Sahan Supply Cooperative", initials: "SS",
    location: "Kismayo", category: "Logistics and Transport", type: "Part-time", arrangement: "On-site",
    summary: "Keep deliveries moving by supporting inventory records, local suppliers and daily transport coordination.",
    applicationMethod: "WhatsApp", tone: "green",
    slug: "logistics-assistant-sahan", employerType: "Private company",
    postedAt: "2026-10-29T08:00:00+03:00", closesAt: "2026-10-31T23:59:59+03:00", salary: "Illustrative salary not specified",
    responsibilities: ["Keep inventory and delivery records accurate and current.", "Coordinate with local suppliers and transport teams.", "Help identify delays and communicate practical next steps."],
    requirements: ["Experience supporting logistics or office operations.", "Basic spreadsheet and record-keeping skills.", "Reliability, attention to detail and clear communication."],
  },
];
