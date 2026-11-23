import { categories, demoJobs, locations, PREVIEW_NOW, type DemoJob } from "./demo-jobs.ts";
import { sampleCandidates, sampleInvoices, type CandidateStage } from "./prototype.ts";

// This is a disposable presentation model, never an API contract or authorization layer.
export type Company = { id: string; name: string; type: DemoJob["employerType"]; location: string; description: string; verified: boolean; authority: boolean };
export type Vacancy = DemoJob & { companyId: string; status: "Draft" | "Published" | "Archived"; destination: string };
export type Candidate = { id: string; name: string; jobId: string; companyId: string; stage: CandidateStage; notes: string[]; interview: string; shared: boolean; history: string[] };
export type Invoice = { id: string; number: string; companyId: string; jobId: string; currency: "USD" | "EUR"; status: "Draft" | "Sent" | "Paid" | "Cancelled"; issued: string; due: string; lines: { label: string; cents: number }[]; payments: { id: string; cents: number; date: string; reference: string }[]; instructions: string };
export type DemoState = {
  companies: Company[]; jobs: Vacancy[]; candidates: Candidate[]; invoices: Invoice[];
  categories: string[]; locations: string[];
  users: { id: string; name: string; role: string; active: boolean; companyId: string }[];
  assignments: { jobId: string; userId: string }[];
  reports: { id: string; jobId: string; reason: string; status: "Open" | "Resolved"; note: string }[];
  profile: { name: string; email: string; phone: string; bio: string; cv: boolean; location?: string };
  applications: { id: string; jobId: string; statement: string; stage: CandidateStage; appliedAt?: string }[];
  notifications: { id: string; text: string; read: boolean }[];
  settings: { siteName: string; contact: string; warning: string; about: string; paymentInstructions: string; advertFee: string; recruitmentFee: string };
  activity: { id: string; actorId: string; recordId: string; time: string }[];
};

export const adminSections = [
  ["overview", "Overview", "Your workspace, at a glance."], ["jobs", "Jobs", "Make the next opportunity count."],
  ["companies", "Companies", "The people behind the opportunities."], ["recruitment", "Recruitment", "Give every application attention."],
  ["users", "Team & access", "The right people for the work."], ["assignments", "Assignments", "Connect your team to opportunities."],
  ["lists", "Categories & locations", "Keep discovery organised."], ["trust", "Verification", "Build trust with clear evidence."],
  ["reports", "Job reports", "Listen. Review. Follow through."], ["content", "Website content", "Make every message clear."],
  ["invoices", "Invoices", "Every line, accounted for."], ["payments", "Payments", "Track the progress of each invoice."],
  ["prices", "Service pricing", "A consistent starting point."], ["summary", "Revenue summary", "Clarity in every currency."],
  ["settings", "Settings", "The details that hold it together."], ["activity", "Activity log", "A trace of the work."],
] as const;
export const extraAdminSections = ["job-editor", "candidate", "invoice-editor", "invoice-detail"];
export const accountSections = ["overview", "profile", "applications", "application-detail", "notifications", "apply", "sign-in"];

export function createDemoState(): DemoState {
  const employers = [...new Map(demoJobs.map(job => [job.employer, job])).values()];
  const companies: Company[] = employers.map((job, index) => ({ id: `demo-company-${index}`, name: job.employer, type: job.employerType, location: job.location, description: "A fictional organisation for exploring the Dalka Jobs frontend.", verified: false, authority: job.applicationMethod === "Dalka recruitment" }));
  const jobs = demoJobs.map(job => ({ ...job, companyId: companies.find(c => c.name === job.employer)!.id, status: (job.id === "sample-06" ? "Archived" : "Published") as Vacancy["status"], destination: "example.invalid" }));
  return {
    companies, jobs, categories: [...categories], locations: [...locations],
    candidates: sampleCandidates.map(c => ({ ...c, companyId: jobs.find(j => j.id === c.jobId)!.companyId, notes: [], interview: c.stage === "Interview Scheduled" ? "2026-11-06T10:00" : "", shared: false, history: ["Submitted", ...(c.stage === "Submitted" ? [] : [c.stage])] })),
    invoices: sampleInvoices.map((invoice, index) => ({ ...invoice, companyId: companies.find(c => c.name === invoice.company)!.id, jobId: jobs.find(j => j.employer === invoice.company)!.id, issued: "2026-11-03", due: "2026-11-17", lines: invoice.lines.map(l => ({ ...l })), payments: invoice.payments.map(p => ({ ...p, date: "2026-11-03", reference: "Sample payment" })), instructions: "Illustrative invoice. No real payment destination.", number: index === 1 ? "Draft example" : invoice.number })),
    users: [{ id: "demo-owner", name: "Sample Administrator", role: "Super admin", active: true, companyId: "" }, { id: "demo-recruiter", name: "Sample Recruiter", role: "Recruiter", active: true, companyId: "" }, { id: "demo-company-user", name: "Sample Company Admin", role: "Company admin", active: true, companyId: jobs[1].companyId }],
    assignments: [{ jobId: "sample-02", userId: "demo-recruiter" }],
    reports: [{ id: "demo-report-01", jobId: "sample-01", reason: "Listing information appears incomplete", status: "Open", note: "" }],
    profile: { name: "Sample Applicant", email: "applicant@example.invalid", phone: "", bio: "Community health and outreach experience.", cv: false, location: "Mogadishu" },
    applications: [{ id: "demo-application-01", jobId: "sample-02", statement: "An illustrative application for community health work.", stage: "Interview Scheduled", appliedAt: "2026-11-02T09:00:00+03:00" }],
    notifications: [{ id: "demo-notice-01", text: "Your sample interview for Community Health Officer is scheduled for 6 November, 10:00 Somalia time.", read: false }, { id: "demo-notice-02", text: "Your sample application has been received. Follow its progress in My applications.", read: false }],
    settings: { siteName: "Dalka Jobs", contact: "contact@example.invalid", warning: "Never pay to apply. Check the employer and vacancy before sharing personal information.", about: "Connecting people with possibilities across Somalia.", paymentInstructions: "Illustrative invoice. No real payment destination.", advertFee: "75.00", recruitmentFee: "125.00" },
    activity: [{ id: "demo-event-01", actorId: "demo-owner", recordId: "sample-01", time: "2026-11-03T09:00:00+03:00" }],
  };
}

export function moneyInput(value: string): number | null {
  if (!/^\d{1,7}(\.\d{1,2})?$/.test(value.trim())) return null;
  const [whole, fraction = ""] = value.trim().split(".");
  return Number(whole) * 100 + Number(fraction.padEnd(2, "0"));
}
export function invoiceTotals(invoice: Invoice) {
  const billed = invoice.lines.reduce((sum, l) => sum + l.cents, 0);
  const paid = invoice.payments.reduce((sum, p) => sum + p.cents, 0);
  return { billed, paid, unpaid: billed - paid };
}
export function invoiceDisplayStatus(invoice: Invoice, today = PREVIEW_NOW.slice(0, 10)): Invoice["status"] | "Overdue" {
  return invoice.status === "Sent" && invoiceTotals(invoice).unpaid > 0 && invoice.due < today ? "Overdue" : invoice.status;
}
export function paymentIssue(invoice: Invoice, cents: number | null): string {
  if (!["Sent", "Paid"].includes(invoice.status)) return "Payments can only be recorded on a sent invoice.";
  if (cents === null || cents <= 0) return "Enter a positive amount with at most two decimal places.";
  if (cents > invoiceTotals(invoice).unpaid) return "The sample payment cannot exceed the outstanding balance.";
  return "";
}
export function sampleWorkspaceUser(state: DemoState, area: "company" | "recruiter") {
  const id = area === "company" ? "demo-company-user" : "demo-recruiter";
  const role = area === "company" ? "Company admin" : "Recruiter";
  return state.users.find(user => user.id === id && user.active && user.role === role);
}
export function sampleWorkspaceJobs(state: DemoState, area: "company" | "recruiter") {
  const user = sampleWorkspaceUser(state, area);
  if (!user) return [];
  if (area === "company") return state.companies.some(company => company.id === user.companyId)
    ? state.jobs.filter(job => job.companyId === user.companyId) : [];
  return state.jobs.filter(job => state.assignments.some(assignment => assignment.userId === user.id && assignment.jobId === job.id));
}
export function companyCandidates(state: DemoState, jobId?: string) {
  const companyId = sampleWorkspaceUser(state, "company")?.companyId;
  const jobs = sampleWorkspaceJobs(state, "company").filter(job => !jobId || job.id === jobId).map(job => job.id);
  return state.candidates.filter(c => c.companyId === companyId && jobs.includes(c.jobId) && ["Shortlisted", "Interview Scheduled", "Hired"].includes(c.stage)).map(({ id, name, stage }) => ({ id, name, stage }));
}
export function recruiterCandidates(state: DemoState, jobId?: string) {
  const jobs = sampleWorkspaceJobs(state, "recruiter").filter(job => !jobId || job.id === jobId).map(job => job.id);
  return state.candidates.filter(c => jobs.includes(c.jobId));
}
export function applicationIssue(state: DemoState, jobId: string, consent: boolean, statement: string): string {
  const job = state.jobs.find(j => j.id === jobId);
  if (!job || job.status !== "Published" || Date.parse(job.closesAt) <= Date.parse("2026-11-03T09:00:00+03:00")) return "This sample vacancy is closed or unavailable.";
  if (job.applicationMethod !== "Dalka recruitment") return "This sample uses an external application method.";
  if (!state.companies.find(c => c.id === job.companyId)?.authority) return "Sample on-site applications are paused until recruitment authority is marked for this company.";
  if (state.applications.some(a => a.jobId === jobId)) return "You already have a sample application for this job.";
  if (!state.profile.name.trim() || !/^[^\s@]+@example\.invalid$/.test(state.profile.email)) return "Complete your sample profile first using an @example.invalid email.";
  if (!state.profile.cv) return "Attach the built-in sample CV on your profile first.";
  if (statement.trim().length < 20) return "Add at least 20 characters about your sample experience.";
  if (!consent) return "Confirm the sample consent checkbox to continue.";
  return "";
}

export function jobCompanyIssue(state: DemoState, original: Vacancy | undefined, companyId: string) {
  return original && original.companyId !== companyId && (state.candidates.some(c => c.jobId === original.id) || state.invoices.some(i => i.jobId === original.id))
    ? "This sample job has linked candidates or invoices. Keep its company unchanged; create a new vacancy for another company." : "";
}
export function renameManagedLabel(state: DemoState, kind: "categories" | "locations", previous: string | null, next: string): DemoState {
  return { ...state, [kind]: previous ? state[kind].map(v => v === previous ? next : v) : [...state[kind], next],
    profile: kind === "locations" && state.profile.location === previous ? { ...state.profile, location: next } : state.profile,
    companies: kind === "locations" ? state.companies.map(c => c.location === previous ? { ...c, location: next } : c) : state.companies,
    jobs: state.jobs.map(j => kind === "categories" && j.category === previous ? { ...j, category: next as Vacancy["category"] } : kind === "locations" && j.location === previous ? { ...j, location: next as Vacancy["location"] } : j) };
}
export function updateCandidateProgress(state: DemoState, candidateId: string, stage: CandidateStage, interview: string, notificationId: string): DemoState {
  const candidate = state.candidates.find(c => c.id === candidateId);
  if (!candidate) return state;
  const applicationId = candidateId === "sample-c-03" ? "demo-application-01" : candidateId;
  const scheduled = stage === "Interview Scheduled" ? interview : "";
  const changed = stage !== candidate.stage || scheduled !== candidate.interview;
  const ownApplication = state.applications.some(a => a.id === applicationId);
  const title = state.jobs.find(j => j.id === candidate.jobId)?.title ?? "this opportunity";
  return { ...state,
    candidates: state.candidates.map(c => c.id === candidateId ? { ...c, stage, interview: scheduled, shared: ["Submitted", "Rejected"].includes(stage) ? false : c.shared, history: c.stage === stage ? c.history : [...c.history, stage] } : c),
    applications: state.applications.map(a => a.id === applicationId ? { ...a, stage } : a),
    notifications: changed && ownApplication ? [{ id: notificationId, text: `Sample update for ${title}: ${stage}${scheduled ? ` · ${scheduled.replace("T", " ")} Somalia time` : ""}. No email or invitation was sent.`, read: false }, ...state.notifications] : state.notifications,
  };
}
