import { demoJobs } from "./demo-jobs.ts";

// Presentation data only. These types are not backend payloads or security rules.
export type PrototypeArea = "public" | "access" | "admin" | "applicant" | "recruiter" | "company" | "finance";
export type PrototypeScreen = { area: PrototypeArea; slug: string; title: string; description: string; task: string };
export const areaLabels: Record<PrototypeArea, string> = {
  public: "Public website", access: "Staff sign-in", admin: "Super admin", applicant: "Applicant", recruiter: "Recruiter", company: "Company", finance: "Finance",
};
export const prototypeScreens: readonly PrototypeScreen[] = [
  { area: "public", slug: "service-states", title: "Opportunities, connected.", description: "Review the public journey and its future service states.", task: "FE-03" },
  { area: "access", slug: "sign-in", title: "A secure start for your team.", description: "Password and authenticator steps for super admins, recruiters and company admins.", task: "FE-04" },
  { area: "admin", slug: "companies", title: "Good work starts with people.", description: "A clear view of the organisations behind your vacancies.", task: "FE-05" },
  { area: "admin", slug: "jobs", title: "Make the next opportunity count.", description: "Review drafts, published vacancies and archived listings.", task: "FE-06" },
  { area: "admin", slug: "job-editor", title: "Shape an opportunity.", description: "Preview a fictional vacancy before a future publishing workflow.", task: "FE-06" },
  { area: "admin", slug: "lists", title: "Keep discovery organised.", description: "The shared categories and locations used across Dalka Jobs.", task: "FE-07" },
  { area: "applicant", slug: "sign-in", title: "Your next chapter starts here.", description: "A simple email-code journey, without another password to remember.", task: "FE-08" },
  { area: "applicant", slug: "profile", title: "Put your experience forward.", description: "Your profile, private CV and account preferences in one place.", task: "FE-09" },
  { area: "applicant", slug: "apply", title: "Take a thoughtful next step.", description: "Review an on-site application before it would be submitted.", task: "FE-10" },
  { area: "applicant", slug: "applications", title: "Every step, in one place.", description: "Follow the progress of your on-site applications.", task: "FE-11" },
  { area: "applicant", slug: "application-detail", title: "A little closer to what’s next.", description: "A fictional application timeline and interview summary.", task: "FE-11" },
  { area: "applicant", slug: "notifications", title: "Stay in the loop.", description: "Application and interview updates, clearly explained.", task: "FE-11" },
  { area: "admin", slug: "overview", title: "A clear view of the day.", description: "Move from the work that needs attention to the right workspace.", task: "FE-19" },
  { area: "admin", slug: "users", title: "The right people. The right access.", description: "Review staff roles and authenticator setup.", task: "FE-13" },
  { area: "admin", slug: "assignments", title: "Connect your team to the work.", description: "Recruiter assignments stay tied to individual jobs.", task: "FE-13" },
  { area: "admin", slug: "trust", title: "Build trust with clear evidence.", description: "Employer verification and recruitment authority are separate checks.", task: "FE-14" },
  { area: "admin", slug: "reports", title: "Listen. Review. Follow through.", description: "A focused queue for reported vacancies.", task: "FE-14" },
  { area: "admin", slug: "content", title: "Keep every message clear.", description: "Warnings, contact information and policy content.", task: "FE-14" },
  { area: "admin", slug: "recruitment", title: "Help talent move forward.", description: "Applications, interviews and team coordination.", task: "FE-15" },
  { area: "admin", slug: "candidate", title: "See the story behind a stage.", description: "A candidate review layout with private staff notes.", task: "FE-15" },
  { area: "admin", slug: "sharing", title: "Share with care.", description: "Candidate details require an explicit super-admin decision.", task: "FE-15" },
  { area: "recruiter", slug: "jobs", title: "Your assigned opportunities.", description: "Focus on the jobs assigned to your team workspace.", task: "FE-16" },
  { area: "recruiter", slug: "candidates", title: "Give every application attention.", description: "Review fictional candidates on assigned jobs.", task: "FE-16" },
  { area: "recruiter", slug: "interview", title: "Make room for a conversation.", description: "An interview planning layout for an assigned candidate.", task: "FE-16" },
  { area: "recruiter", slug: "notes", title: "Keep the team informed.", description: "Private recruitment notes belong with the application.", task: "FE-16" },
  { area: "company", slug: "jobs", title: "Your opportunities, at a glance.", description: "A read-only view for the fictional Daryeel Community Initiative.", task: "FE-17" },
  { area: "company", slug: "candidates", title: "Meet the next stage of talent.", description: "Shortlisted, interview-scheduled and hired candidates for your company.", task: "FE-17" },
  { area: "company", slug: "rejected", title: "A separate place for closed outcomes.", description: "The rejected-candidate view awaits its approved information policy.", task: "FE-17" },
  { area: "company", slug: "progress", title: "Know where things stand.", description: "Read-only interview and recruitment progress for your company.", task: "FE-17" },
  { area: "finance", slug: "invoices", title: "Keep the numbers in order.", description: "Company invoices, clear statuses and separate payment records.", task: "FE-18" },
  { area: "finance", slug: "invoice-editor", title: "Start with a clear invoice.", description: "A draft layout for job and recruitment service charges.", task: "FE-18" },
  { area: "finance", slug: "invoice-detail", title: "Every line, accounted for.", description: "A locked Sent invoice and its separate illustrative payment.", task: "FE-18" },
  { area: "finance", slug: "prices", title: "A consistent starting point.", description: "Service fees and company or job overrides.", task: "FE-18" },
  { area: "finance", slug: "payments", title: "Record progress, one payment at a time.", description: "Partial payments are separate from invoice content.", task: "FE-18" },
  { area: "finance", slug: "summary", title: "Clarity in every currency.", description: "Billed, paid and outstanding amounts stay separate by currency.", task: "FE-18" },
  { area: "admin", slug: "settings", title: "The details that hold it together.", description: "General settings and the boundaries behind them.", task: "FE-19" },
  { area: "admin", slug: "activity", title: "A trace of the work.", description: "An ID-and-time-only activity view, without copied private content.", task: "FE-19" },
];

export function prototypeHref(screen: Pick<PrototypeScreen, "area" | "slug">) { return `/prototype/${screen.area}/${screen.slug}`; }
export function findPrototypeScreen(area: string, slug: string) { return prototypeScreens.find((screen) => screen.area === area && screen.slug === slug); }
export const candidateStages = ["Submitted", "Shortlisted", "Interview Scheduled", "Hired", "Rejected"] as const;
export type CandidateStage = (typeof candidateStages)[number];
type SampleCandidate = { id: string; name: string; jobId: string; companyId: string; stage: CandidateStage };
export const sampleCandidates: readonly SampleCandidate[] = [
  { id: "sample-c-01", name: "Sample Candidate A", jobId: "sample-02", companyId: "sample-company-daryeel", stage: "Submitted" },
  { id: "sample-c-02", name: "Sample Candidate B", jobId: "sample-02", companyId: "sample-company-daryeel", stage: "Shortlisted" },
  { id: "sample-c-03", name: "Sample Candidate C", jobId: "sample-02", companyId: "sample-company-daryeel", stage: "Interview Scheduled" },
  { id: "sample-c-04", name: "Sample Candidate D", jobId: "sample-02", companyId: "sample-company-daryeel", stage: "Hired" },
  { id: "sample-c-05", name: "Sample Candidate E", jobId: "sample-02", companyId: "sample-company-daryeel", stage: "Rejected" },
  { id: "sample-c-06", name: "Sample Candidate F", jobId: "sample-04", companyId: "sample-company-wadajir", stage: "Shortlisted" },
];
export const sampleAssignedJobIds: readonly string[] = ["sample-02"];
// Explicit projection: adding private fixture properties later must not widen this view.
export function companyCandidateExamples() {
  return sampleCandidates.filter((row) => row.companyId === "sample-company-daryeel" && ["Shortlisted", "Interview Scheduled", "Hired"].includes(row.stage))
    .map(({ id, name, stage }) => ({ id, name, stage }));
}
export function recruiterCandidateExamples() { return sampleCandidates.filter((row) => sampleAssignedJobIds.includes(row.jobId)); }
export function sampleJobsFor(area: PrototypeArea) {
  return demoJobs.filter((job) => area === "company" ? job.id === "sample-02" : area === "recruiter" ? sampleAssignedJobIds.includes(job.id) : true);
}

export type SampleInvoice = { id: string; number: string; company: string; currency: "USD" | "EUR"; status: "Draft" | "Sent" | "Paid" | "Cancelled"; lines: readonly { label: string; cents: number }[]; payments: readonly { id: string; cents: number }[] };
export const sampleInvoices: readonly SampleInvoice[] = [
  { id: "sample-invoice-01", number: "DJ-2026-0001", company: "Talo Digital Studio", currency: "USD", status: "Sent", lines: [{ label: "Job advertisement — illustrative", cents: 7500 }, { label: "Recruitment service — illustrative", cents: 12500 }], payments: [{ id: "sample-payment-01", cents: 5000 }] },
  { id: "sample-invoice-02", number: "Draft example", company: "Wadajir Development Lab", currency: "USD", status: "Draft", lines: [{ label: "Illustrative draft fee", cents: 10000 }], payments: [] },
  { id: "sample-invoice-03", number: "DJ-2026-0002", company: "Hilaac Learning Collective", currency: "EUR", status: "Paid", lines: [{ label: "Job advertisement — illustrative", cents: 6000 }], payments: [{ id: "sample-payment-02", cents: 6000 }] },
];
export function sampleInvoiceTotals(invoice: SampleInvoice) {
  const billed = invoice.lines.reduce((sum, line) => sum + line.cents, 0);
  const paid = invoice.payments.reduce((sum, payment) => sum + payment.cents, 0);
  return { billed, paid, unpaid: billed - paid };
}
export function sampleRevenueByCurrency(invoices: readonly SampleInvoice[]) {
  const result: Partial<Record<SampleInvoice["currency"], { billed: number; paid: number; unpaid: number }>> = {};
  for (const invoice of invoices) {
    if (invoice.status === "Draft" || invoice.status === "Cancelled") continue;
    const total = sampleInvoiceTotals(invoice);
    const previous = result[invoice.currency] ?? { billed: 0, paid: 0, unpaid: 0 };
    result[invoice.currency] = { billed: previous.billed + total.billed, paid: previous.paid + total.paid, unpaid: previous.unpaid + total.unpaid };
  }
  return result;
}
export function sampleMoney(cents: number, currency: string) { return `${currency} ${(cents / 100).toFixed(2)}`; }
export function validateSampleJob(values: { title: string; description: string; method: string; destination: string }) {
  const issues: { fieldId: string; label: string; message: string }[] = [];
  if (values.title.trim().length < 3) issues.push({ fieldId: "sample-title", label: "Job title", message: "Use at least three characters for the sample title." });
  if (values.description.trim().length < 20) issues.push({ fieldId: "sample-description", label: "Description", message: "Use at least twenty characters for this sample description." });
  if (!["Company website", "Email", "WhatsApp", "Dalka recruitment"].includes(values.method)) issues.push({ fieldId: "sample-method", label: "Application method", message: "Choose one of the four known application methods." });
  // Never accept destinations or identifiers for real intake in the local demonstration.
  if (values.method !== "Dalka recruitment" && values.destination !== "example.invalid") issues.push({ fieldId: "sample-destination", label: "Sample destination", message: "Use the reserved example.invalid marker. Real destinations are not connected." });
  return issues;
}
