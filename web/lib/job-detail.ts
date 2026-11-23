import { demoJobs, PREVIEW_NOW, type DemoJob } from "./demo-jobs.ts";

export function getJobBySlug(slug: string): DemoJob | undefined {
  return demoJobs.find((job) => job.slug === slug);
}

export function isClosed(job: Pick<DemoJob, "closesAt">, now = PREVIEW_NOW): boolean {
  return Date.parse(job.closesAt) <= Date.parse(now);
}

export function formatJobDate(value: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric", month: "short", year: "numeric", timeZone: "Africa/Mogadishu",
  }).format(new Date(value));
}

const guidance: Record<DemoJob["applicationMethod"], { title: string; description: string; steps: readonly string[] }> = {
  "Company website": {
    title: "Apply on the company website",
    description: "For a live listing, the application button would take you to the employer’s own website. The employer receives and manages your application there.",
    steps: ["Read the employer’s requirements and application instructions.", "Follow the verified company link when real listings launch.", "Complete the application on that website; Dalka Jobs cannot confirm its outcome."],
  },
  Email: {
    title: "Apply by email",
    description: "For a live listing, send your application directly to the hiring company using its published email instructions. A Dalka Jobs account is not required for this method.",
    steps: ["Prepare the documents requested in the real listing.", "Use the employer’s required email subject and recipient.", "The hiring company handles follow-up; opening an email link does not submit an application."],
  },
  WhatsApp: {
    title: "Contact the employer on WhatsApp",
    description: "For a live listing, a verified WhatsApp link would open a conversation with the hiring company. The company receives anything you send, outside Dalka Jobs.",
    steps: ["Check the real listing’s instructions before sharing documents.", "Use only the employer contact published in that listing.", "Opening a chat is not proof of an application or a hiring outcome."],
  },
  "Dalka recruitment": {
    title: "Apply through Dalka Jobs",
    description: "For full-recruitment jobs, the Dalka Jobs team would collect and review applications for the employer. An applicant account and consent will be required when this service launches.",
    steps: ["Sign in to your applicant account once secure accounts are available.", "Review your profile, the job’s document requirements and the collection/retention notice.", "Submit on Dalka Jobs and follow the recorded stage in My applications."],
  },
};

export function getApplicationGuidance(method: DemoJob["applicationMethod"]) {
  return guidance[method];
}
