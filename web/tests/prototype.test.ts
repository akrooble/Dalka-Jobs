import assert from "node:assert/strict";
import test from "node:test";
import { prototypeScreens, prototypeHref, findPrototypeScreen, companyCandidateExamples, recruiterCandidateExamples, sampleJobsFor, sampleInvoices, sampleInvoiceTotals, sampleRevenueByCurrency, sampleMoney, validateSampleJob, candidateStages } from "../lib/prototype.ts";

test("each prototype has a unique canonical route and exact lookup", () => {
  const paths = prototypeScreens.map(prototypeHref);
  assert.equal(new Set(paths).size, paths.length);
  for (const screen of prototypeScreens) {
    assert.match(prototypeHref(screen), /^\/prototype\/[a-z]+\/[a-z-]+$/);
    assert.equal(findPrototypeScreen(screen.area, screen.slug), screen);
  }
  for (const [area, slug] of [["admin", "../jobs"], ["unknown", "jobs"], ["applicant", "invoice-detail"], ["company", "job-editor"]]) assert.equal(findPrototypeScreen(area, slug), undefined);
});
test("prototype inventory covers each remaining screen task without claiming live FE-03 integration", () => {
  for (const number of [3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 14, 15, 16, 17, 18, 19]) assert.ok(prototypeScreens.some((screen) => screen.task === `FE-${String(number).padStart(2, "0")}`));
  assert.deepEqual(prototypeScreens.filter((screen) => screen.task === "FE-03").map((screen) => screen.slug), ["service-states"]);
});
test("company candidate examples expose only the known main-list projection", () => {
  const rows = companyCandidateExamples();
  assert.deepEqual(rows.map((row) => row.stage), ["Shortlisted", "Interview Scheduled", "Hired"]);
  assert.ok(rows.every((row) => Object.keys(row).sort().join(",") === "id,name,stage"));
  assert.ok(!rows.some((row) => row.name === "Sample Candidate F"));
  rows[0].name = "Local copy";
  assert.equal(companyCandidateExamples()[0].name, "Sample Candidate B");
});
test("recruiter and company job examples exclude unrelated companies and assignments", () => {
  assert.deepEqual(sampleJobsFor("recruiter").map((job) => job.id), ["sample-02"]);
  assert.deepEqual(sampleJobsFor("company").map((job) => job.id), ["sample-02"]);
  assert.ok(recruiterCandidateExamples().every((row) => row.jobId === "sample-02"));
  assert.equal(sampleJobsFor("admin").length, 6);
});
test("the displayed stage vocabulary has no invented recruitment outcomes", () => {
  assert.deepEqual(candidateStages, ["Submitted", "Shortlisted", "Interview Scheduled", "Hired", "Rejected"]);
});
test("sample invoice payments remain separate from locked line totals", () => {
  const before = JSON.stringify(sampleInvoices[0]);
  assert.deepEqual(sampleInvoiceTotals(sampleInvoices[0]), { billed: 20000, paid: 5000, unpaid: 15000 });
  assert.equal(JSON.stringify(sampleInvoices[0]), before);
  assert.equal(sampleMoney(15000, "USD"), "USD 150.00");
});
test("sample revenue keeps currencies apart and excludes unissued drafts", () => {
  assert.deepEqual(sampleRevenueByCurrency(sampleInvoices), { USD: { billed: 20000, paid: 5000, unpaid: 15000 }, EUR: { billed: 6000, paid: 6000, unpaid: 0 } });
  assert.deepEqual(sampleRevenueByCurrency([]), {});
  assert.deepEqual(sampleRevenueByCurrency([{ ...sampleInvoices[0], status: "Cancelled" }]), {});
});
test("sample editor rejects blank copy and unknown application methods with linked field IDs", () => {
  const issues = validateSampleJob({ title: " ", description: "short", method: "unknown", destination: "example.invalid" });
  assert.deepEqual(issues.map((issue) => issue.fieldId), ["sample-title", "sample-description", "sample-method"]);
});
test("sample editor refuses real external intake destinations for every external method", () => {
  const copy = { title: "Example role", description: "A long enough fictional example description.", destination: "person@example.com" };
  for (const method of ["Company website", "Email", "WhatsApp"]) assert.deepEqual(validateSampleJob({ ...copy, method }).map((issue) => issue.fieldId), ["sample-destination"]);
});
test("all four known methods can produce a local sample preview without mutating copy", () => {
  for (const method of ["Company website", "Email", "WhatsApp", "Dalka recruitment"]) {
    const values = { title: "  Example role  ", description: "A long enough fictional example description.", method, destination: "example.invalid" };
    const before = JSON.stringify(values);
    assert.deepEqual(validateSampleJob(values), []);
    assert.equal(JSON.stringify(values), before);
  }
});
