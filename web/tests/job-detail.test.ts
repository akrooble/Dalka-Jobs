import assert from "node:assert/strict";
import test from "node:test";
import { demoJobs, PREVIEW_NOW } from "../lib/demo-jobs.ts";
import { formatJobDate, getApplicationGuidance, getJobBySlug, isClosed } from "../lib/job-detail.ts";
import { emptyFilters, filterJobs } from "../lib/job-search.ts";

test("every fixture has a unique URL and lookup rejects unknown/path-like input", () => {
  assert.equal(new Set(demoJobs.map((job) => job.slug)).size, demoJobs.length);
  for (const job of demoJobs) assert.equal(getJobBySlug(job.slug), job);
  for (const slug of ["missing", "../../privacy", "", "FRONTEND-ENGINEER-TALO-DIGITAL"]) assert.equal(getJobBySlug(slug), undefined);
});

test("expiry includes the exact deadline and uses the supplied snapshot", () => {
  assert.equal(isClosed({ closesAt: PREVIEW_NOW }), true);
  assert.equal(isClosed({ closesAt: "2026-11-03T09:00:01+03:00" }), false);
  assert.equal(isClosed(demoJobs[5]), true);
  assert.equal(isClosed(demoJobs[0]), false);
  assert.equal(formatJobDate("2026-11-02T22:00:00Z"), "3 Nov 2026");
});

test("all four methods clearly distinguish receiver and future-only behavior", () => {
  const methods = new Set(demoJobs.map((job) => job.applicationMethod));
  assert.equal(methods.size, 4);
  for (const method of methods) {
    const guide = getApplicationGuidance(method);
    assert.ok(guide.title.length > 10);
    assert.equal(guide.steps.length, 3);
    assert.match(guide.description, /live listing|full-recruitment/i);
  }
  assert.match(getApplicationGuidance("Dalka recruitment").description, /account and consent/i);
  assert.match(getApplicationGuidance("Email").description, /directly to the hiring company/i);
  assert.match(getApplicationGuidance("WhatsApp").description, /outside Dalka Jobs/i);
  assert.match(getApplicationGuidance("Company website").description, /employer receives/i);
});

test("employer and job type combine with existing location/category/keyword filters", () => {
  assert.deepEqual(filterJobs(demoJobs, { ...emptyFilters(), employerType: "NGO", jobType: "Contract" }).map((job) => job.id), ["sample-02", "sample-04"]);
  assert.deepEqual(filterJobs(demoJobs, { ...emptyFilters(), employerType: "NGO", jobType: "Contract", location: "Baidoa", category: "Health and Medicine", keyword: "health" }).map((job) => job.id), ["sample-02"]);
  assert.deepEqual(filterJobs(demoJobs, { ...emptyFilters(), employerType: "Government" }), []);
});

test("seven-day selection excludes closed and distant jobs and includes the exact future boundary", () => {
  assert.deepEqual(filterJobs(demoJobs, { ...emptyFilters(), closingSoon: true }).map((job) => job.id), ["sample-02", "sample-03", "sample-04"]);
  const boundary = { ...demoJobs[0], closesAt: "2026-11-10T09:00:00+03:00" };
  assert.equal(filterJobs([boundary], { ...emptyFilters(), closingSoon: true }).length, 1);
  assert.equal(filterJobs([{ ...boundary, closesAt: "2026-11-10T09:00:01+03:00" }], { ...emptyFilters(), closingSoon: true }).length, 0);
});

test("sort is deterministic, leaves source untouched and puts closed jobs last by closing date", () => {
  const sourceIds = demoJobs.map((job) => job.id);
  assert.deepEqual(filterJobs([...demoJobs].reverse(), emptyFilters()).map((job) => job.id), sourceIds);
  assert.deepEqual(filterJobs(demoJobs, { ...emptyFilters(), sort: "closing" }).map((job) => job.id), ["sample-03", "sample-04", "sample-02", "sample-01", "sample-05", "sample-06"]);
  const tied = [{ ...demoJobs[0], id: "b" }, { ...demoJobs[0], id: "a" }];
  assert.deepEqual(filterJobs(tied, emptyFilters()).map((job) => job.id), ["a", "b"]);
  assert.deepEqual(demoJobs.map((job) => job.id), sourceIds);
});
