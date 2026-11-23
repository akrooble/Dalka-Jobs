import assert from "node:assert/strict";
import { adminSections, extraAdminSections, accountSections } from "../lib/frontend-demo.ts";

// Read-only requests to the frontend preview only. Never starts or requests the API.
const base = new URL(process.env.PROTOTYPE_BASE_URL ?? "http://127.0.0.1:3100");
assert.ok(base.protocol === "http:" && base.hostname === "127.0.0.1" && !base.username && !base.password && base.pathname === "/" && !base.search && !base.hash);
const pages = ["/", "/admin", "/admin/sign-in", ...adminSections.filter(s => s[0] !== "overview").map(s => `/admin/${s[0]}`), ...extraAdminSections.map(s => `/admin/${s}`), "/account", ...accountSections.map(s => `/account/${s}`), "/preview-job?id=sample-01", ...["jobs", "candidates", "rejected", "progress"].map(s => `/workspace/company/${s}`), ...["jobs", "candidates", "interviews", "candidate"].map(s => `/workspace/recruiter/${s}`)];
const checked = new Map<string, string>();
for (const path of pages) {
  const response = await fetch(new URL(path, base), { redirect: "error", signal: AbortSignal.timeout(10000) });
  assert.equal(response.status, 200, path);
  const html = await response.text(); checked.set(path, html);
  assert.match(html, /noindex/, `${path}: noindex`);
  assert.doesNotMatch(html, /application\/ld\+json/, `${path}: no real vacancy markup`);
  if (path.startsWith("/admin/") && path !== "/admin/sign-in") assert.match(html, /Frontend preview/, `${path}: sample banner`);
  for (const field of html.matchAll(/<input\b[^>]*(?:type="password"|type="file")[^>]*>/g)) assert.match(field[0], /\bdisabled(?:="")?/, `${path}: sensitive field must be disabled`);
}
const links = new Set<string>();
for (const [path, html] of checked) {
  for (const match of html.matchAll(/<a\b[^>]*href="([^"]+)"/g)) {
    const url = new URL(match[1].replaceAll("&amp;", "&"), base);
    assert.equal(url.origin, base.origin, `${path}: no external data destination`);
    assert.ok(!url.pathname.startsWith("/api/"), `${path}: no API request link`);
    links.add(url.pathname + url.search);
  }
}
for (const path of links) {
  if (checked.has(path)) continue;
  assert.equal((await fetch(new URL(path, base), { redirect: "error", signal: AbortSignal.timeout(10000) })).status, 200, `Linked destination ${path}`);
}
for (const path of ["/admin/unknown", "/admin/jobs/unknown", "/account/unknown", "/workspace/company/job-editor", "/workspace/recruiter/invoices", "/workspace/unknown/jobs"]) assert.equal((await fetch(new URL(path, base))).status, 404, path);
const company = checked.get("/workspace/company/candidates")!;
for (const name of ["Sample Candidate A", "Sample Candidate E", "Sample Candidate F"]) assert.ok(!company.includes(name), `Company must withhold ${name}`);
for (const name of ["Sample Candidate B", "Sample Candidate C", "Sample Candidate D"]) assert.ok(company.includes(name));
const recruiter = checked.get("/workspace/recruiter/candidates")!; assert.ok(!recruiter.includes("Sample Candidate F"));
assert.ok(!checked.get("/workspace/company/rejected")!.includes("Sample Candidate E"));
for (const area of ["company", "recruiter"]) {
  const jobs = checked.get(`/workspace/${area}/jobs`)!;
  assert.ok(jobs.includes(`/workspace/${area}/candidates?job=sample-02`), `${area}: vacancy links retain the selected job`);
  const header = jobs.match(/<header class="desk-header">([\s\S]*?)<\/header>/)?.[1] ?? "";
  assert.ok(header && !header.includes("/admin/reports"), `${area}: header must stay within the role workspace`);
  for (const selection of ["sample-04", "missing", "sample-02&job=sample-04"]) {
    const html = await (await fetch(new URL(`/workspace/${area}/candidates?job=${selection}`, base))).text();
    assert.ok(html.includes("This vacancy is outside the sample workspace"), `${area}: reject unavailable/ambiguous selection ${selection}`);
    for (const name of ["Sample Candidate A", "Sample Candidate B", "Sample Candidate F"]) assert.ok(!html.includes(name), `${area}: no candidate rows for ${selection}`);
  }
}
console.log(`PASS: ${pages.length} frontend pages, ${links.size} internal destinations, 6 expected 404s, preview boundaries and company/recruiter projections. No API/database requested.`);
