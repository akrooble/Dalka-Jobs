import assert from "node:assert/strict";
import test from "node:test";
import { demoJobs } from "../lib/demo-jobs.ts";
import { emptyFilters, filterJobs } from "../lib/job-search.ts";

test("blank and whitespace queries return all fixtures in original order without mutation", () => {
  const ids = demoJobs.map((job) => job.id);
  assert.deepEqual(filterJobs(demoJobs, emptyFilters()).map((job) => job.id), ids);
  assert.deepEqual(filterJobs(demoJobs, { ...emptyFilters(), keyword: "  \t " }).map((job) => job.id), ids);
  assert.deepEqual(demoJobs.map((job) => job.id), ids);
});

test("search is case-insensitive and requires all words across title and employer", () => {
  assert.deepEqual(filterJobs(demoJobs, { ...emptyFilters(), keyword: "  FRONTEND   talo " }).map((job) => job.id), ["sample-01"]);
  assert.deepEqual(filterJobs(demoJobs, { ...emptyFilters(), keyword: "health" }).map((job) => job.id), ["sample-02"]);
});

test("location and category combine with keyword rather than replace each other", () => {
  assert.deepEqual(filterJobs(demoJobs, { keyword: "design", location: "Remote", category: "ICT and Technology" }).map((job) => job.id), ["sample-05"]);
  assert.deepEqual(filterJobs(demoJobs, { keyword: "design", location: "Mogadishu", category: "ICT and Technology" }), []);
  assert.deepEqual(filterJobs(demoJobs, { keyword: "", location: "Remote", category: "Finance and Accounting" }), []);
});

test("locations are exact matches and unrepresented locations have zero results", () => {
  assert.equal(filterJobs(demoJobs, { ...emptyFilters(), location: "Mogadishu" }).length, 1);
  assert.equal(filterJobs(demoJobs, { ...emptyFilters(), location: "Mog" }).length, 0);
  assert.equal(filterJobs(demoJobs, { ...emptyFilters(), location: "Berbera" }).length, 0);
});

test("clear-all creates independent filter objects and restores the full list", () => {
  const selected = emptyFilters();
  selected.location = "Remote";
  assert.equal(filterJobs(demoJobs, selected).length, 1);
  assert.equal(filterJobs(demoJobs, emptyFilters()).length, demoJobs.length);
});

test("unmatched text and an empty source are legitimate empty results", () => {
  assert.deepEqual(filterJobs(demoJobs, { ...emptyFilters(), keyword: "no-such-vacancy" }), []);
  assert.deepEqual(filterJobs([], emptyFilters()), []);
});
