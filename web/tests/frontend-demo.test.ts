import test from "node:test";
import assert from "node:assert/strict";
import { applicationIssue, companyCandidates, createDemoState, invoiceDisplayStatus, invoiceTotals, jobCompanyIssue, moneyInput, paymentIssue, recruiterCandidates, renameManagedLabel, sampleWorkspaceJobs, updateCandidateProgress } from "../lib/frontend-demo.ts";

test("fresh sample workspaces reset local mutable collections independently", () => {
  const first = createDemoState(); const second = createDemoState();
  first.profile.name = "Changed"; first.candidates[0].notes.push("Private sample text"); first.invoices[0].lines[0].cents = 1;
  assert.equal(second.profile.name, "Sample Applicant"); assert.deepEqual(second.candidates[0].notes, []);
  assert.equal(invoiceTotals(second.invoices[0]).billed, 20000);
});
test("all linked jobs, candidates and invoices reference matching sample companies", () => {
  const state = createDemoState();
  for (const j of state.jobs) assert.equal(state.companies.find(c => c.id === j.companyId)?.name, j.employer);
  for (const c of state.candidates) assert.equal(state.jobs.find(j => j.id === c.jobId)?.companyId, c.companyId);
  for (const i of state.invoices) assert.equal(state.jobs.find(j => j.id === i.jobId)?.companyId, i.companyId);
});
test("money parsing uses integer cents and rejects ambiguous, negative and oversized inputs", () => {
  assert.equal(moneyInput("0.01"), 1); assert.equal(moneyInput("19.9"), 1990); assert.equal(moneyInput(" 100 "), 10000);
  for (const invalid of ["", "-1", "0.001", "1e3", "1,000", "NaN", "Infinity", "10000000", "1.2.3"]) assert.equal(moneyInput(invalid), null, invalid);
});
test("partial payments keep invoice content intact and reject excess, zero and draft payments", () => {
  const state = createDemoState(); const invoice = state.invoices[0];
  assert.deepEqual(invoiceTotals(invoice), { billed: 20000, paid: 5000, unpaid: 15000 });
  assert.equal(paymentIssue(invoice, 5000), ""); assert.ok(paymentIssue(invoice, 15001)); assert.ok(paymentIssue(invoice, 0)); assert.ok(paymentIssue(invoice, null));
  assert.ok(paymentIssue(state.invoices[1], 100));
  const next = { ...invoice, payments: [...invoice.payments, { id: "test", cents: 5000, date: "2026-11-05", reference: "Sample" }] };
  assert.deepEqual(invoiceTotals(next), { billed: 20000, paid: 10000, unpaid: 10000 }); assert.deepEqual(invoice.lines, next.lines);
});
test("company projections do not widen even when details are marked for sharing", () => {
  const state = createDemoState(); state.candidates.forEach(c => { c.shared = true; c.notes.push("Private"); });
  const visible = companyCandidates(state);
  assert.equal(visible.length, 3);
  for (const c of visible) { assert.deepEqual(Object.keys(c).sort(), ["id", "name", "stage"]); assert.ok(!["Submitted", "Rejected"].includes(c.stage)); }
});
test("recruiter projection follows current assignments and revocation", () => {
  const state = createDemoState(); assert.equal(recruiterCandidates(state).length, 5);
  state.assignments = []; assert.deepEqual(recruiterCandidates(state), []);
  state.assignments.push({ jobId: "sample-04", userId: "demo-recruiter" }); assert.equal(recruiterCandidates(state)[0].id, "sample-c-06");
});
test("sample applications require open on-site job, reserved profile, sample CV, statement and consent", () => {
  const state = createDemoState(); const job = state.jobs.find(j => j.id === "sample-04")!;
  assert.match(applicationIssue(state, "sample-02", true, "A long enough sample statement."), /already/);
  assert.match(applicationIssue(state, "sample-06", true, "A long enough sample statement."), /closed/);
  assert.match(applicationIssue(state, "sample-01", true, "A long enough sample statement."), /external/);
  assert.match(applicationIssue(state, job.id, true, "A long enough sample statement."), /CV/);
  state.profile.cv = true;
  assert.match(applicationIssue(state, job.id, false, "A long enough sample statement."), /consent/);
  assert.match(applicationIssue(state, job.id, true, "Short"), /20 characters/);
  assert.equal(applicationIssue(state, job.id, true, "A long enough sample statement."), "");
  state.companies.find(c => c.id === job.companyId)!.authority = false;
  assert.match(applicationIssue(state, job.id, true, "A long enough sample statement."), /authority/);
  state.companies.find(c => c.id === job.companyId)!.authority = true;
  state.profile.email = "real@somewhere.test";
  assert.match(applicationIssue(state, job.id, true, "A long enough sample statement."), /profile/);
});
test("company reassignment preserves linked candidate and invoice company references", () => {
  const state = createDemoState(); const job = state.jobs[1];
  assert.ok(jobCompanyIssue(state, job, state.companies[0].id));
  assert.equal(jobCompanyIssue(state, job, job.companyId), "");
  assert.equal(jobCompanyIssue(state, undefined, state.companies[0].id), "");
  assert.ok(jobCompanyIssue(state, state.jobs[0], job.companyId));
});
test("managed location and category renames keep their sample references consistent", () => {
  const state = createDemoState(); const next = renameManagedLabel(state, "locations", "Baidoa", "Baidoa district");
  assert.ok(!next.locations.includes("Baidoa")); assert.equal(next.jobs[1].location, "Baidoa district");
  assert.equal(next.companies.find(c => c.id === next.jobs[1].companyId)?.location, "Baidoa district");
  assert.equal(state.jobs[1].location, "Baidoa");
  const categories = renameManagedLabel(next, "categories", "Health and Medicine", "Community health"); assert.equal(categories.jobs[1].category, "Community health");
});
test("recruitment updates synchronize own tracker and notifications, and revoke ineligible sharing", () => {
  const state = createDemoState(); state.candidates[2].shared = true;
  const next = updateCandidateProgress(state, "sample-c-03", "Submitted", "", "test-notice");
  assert.equal(next.candidates[2].shared, false); assert.equal(next.candidates[2].interview, "");
  assert.equal(next.applications[0].stage, "Submitted"); assert.equal(next.notifications[0].id, "test-notice");
  assert.match(next.notifications[0].text, /Submitted/); assert.equal(state.applications[0].stage, "Interview Scheduled");
  assert.equal(next.applications[0].appliedAt, state.applications[0].appliedAt, "Progress changes retain the original application date");
  const same = updateCandidateProgress(next, "sample-c-03", "Submitted", "", "duplicate"); assert.equal(same.notifications.length, next.notifications.length);
  const other = updateCandidateProgress(state, "sample-c-02", "Hired", "", "other"); assert.equal(other.notifications.length, state.notifications.length); assert.equal(other.applications[0].stage, "Interview Scheduled");
});

test("managed location changes preserve the applicant profile selection without mutating fixtures", () => {
  const state = createDemoState();
  const renamed = renameManagedLabel(state, "locations", "Mogadishu", "Mogadishu district");
  assert.equal(renamed.profile.location, "Mogadishu district");
  assert.ok(renamed.locations.includes(renamed.profile.location!));
  assert.equal(state.profile.location, "Mogadishu");
  const unrelated = renameManagedLabel(state, "locations", "Garowe", "Garowe district");
  assert.equal(unrelated.profile.location, "Mogadishu");
  assert.equal(renameManagedLabel(state, "categories", null, "New category").profile.location, "Mogadishu");
});

test("company preview follows membership changes and withholds revoked or missing memberships", () => {
  const state = createDemoState();
  const member = state.users.find(user => user.id === "demo-company-user")!;
  const nextCompany = state.jobs.find(job => job.id === "sample-04")!.companyId;
  member.companyId = nextCompany;
  assert.deepEqual(companyCandidates(state).map(candidate => candidate.name), ["Sample Candidate F"]);
  assert.ok(sampleWorkspaceJobs(state, "company").every(job => job.companyId === nextCompany));
  member.active = false;
  assert.deepEqual(companyCandidates(state), []);
  assert.deepEqual(sampleWorkspaceJobs(state, "company"), []);
  member.active = true;
  member.role = "Recruiter";
  assert.deepEqual(companyCandidates(state), []);
  member.role = "Company admin";
  member.companyId = "missing-company";
  assert.deepEqual(companyCandidates(state), []);
  assert.deepEqual(sampleWorkspaceJobs(state, "company"), []);
});

test("recruiter candidate and direct-review projections revoke with active role and assignment", () => {
  const state = createDemoState();
  const recruiter = state.users.find(user => user.id === "demo-recruiter")!;
  recruiter.active = false;
  assert.deepEqual(recruiterCandidates(state), []);
  assert.deepEqual(sampleWorkspaceJobs(state, "recruiter"), []);
  recruiter.active = true;
  recruiter.role = "Company admin";
  assert.deepEqual(recruiterCandidates(state), []);
  recruiter.role = "Recruiter";
  state.assignments = [];
  assert.deepEqual(recruiterCandidates(state), []);
});

test("vacancy filters intersect current sample scope without broadening on unknown or foreign IDs", () => {
  const state = createDemoState();
  for (const foreign of ["sample-04", "missing", "__proto__"]) {
    assert.deepEqual(companyCandidates(state, foreign), []);
    assert.deepEqual(recruiterCandidates(state, foreign), []);
  }
  assert.equal(companyCandidates(state, "sample-02").length, 3);
  state.assignments.push({ jobId: "sample-04", userId: "demo-recruiter" });
  assert.equal(recruiterCandidates(state).length, 6);
  assert.deepEqual(recruiterCandidates(state, "sample-04").map(candidate => candidate.name), ["Sample Candidate F"]);
  assert.equal(recruiterCandidates(state, "sample-02").length, 5);
  assert.deepEqual(companyCandidates(state, "sample-04"), [], "Recruiter assignment cannot widen the company view");
});

test("overdue presentation derives from the sample date and preserves locked invoice state", () => {
  const invoice = createDemoState().invoices[0];
  const before = structuredClone(invoice);
  assert.equal(invoiceDisplayStatus(invoice, "2026-11-17"), "Sent", "Due day is not overdue");
  assert.equal(invoiceDisplayStatus(invoice, "2026-11-18"), "Overdue", "Partial balance becomes overdue after due day");
  assert.equal(invoiceDisplayStatus(invoice, "2026-11-16"), "Sent");
  for (const status of ["Draft", "Paid", "Cancelled"] as const) assert.equal(invoiceDisplayStatus({ ...invoice, status }, "2026-11-18"), status);
  const paid = { ...invoice, payments: [{ id: "full", cents: invoiceTotals(invoice).billed, date: "2026-11-17", reference: "Sample" }] };
  assert.equal(invoiceDisplayStatus(paid, "2026-11-18"), "Sent", "No balance is not overdue");
  assert.equal(paymentIssue(invoice, 1000), "", "Overdue display does not lock valid partial payment recording");
  assert.deepEqual(invoice, before, "Display status must not mutate invoice content, payments or stored status");
});
