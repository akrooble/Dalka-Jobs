import assert from "node:assert/strict";
import { prototypeScreens, prototypeHref } from "../lib/prototype.ts";
import { demoJobs } from "../lib/demo-jobs.ts";

// Run against a separate local production server. This does not test browser behavior.
const base = new URL(process.env.PROTOTYPE_BASE_URL ?? "http://127.0.0.1:3100");
assert.ok(base.protocol === "http:" && base.hostname === "127.0.0.1" && !base.username && !base.password && base.pathname === "/" && !base.search && !base.hash, "Use an uncredentialed loopback HTTP origin only.");
const pages = ["/", "/about", "/contact", "/privacy", "/terms", "/ui-preview", "/prototype", ...demoJobs.map((job) => `/jobs/${job.slug}`), ...prototypeScreens.map(prototypeHref)];
const checked = new Map<string, string>();
for (const path of pages) {
  const response = await fetch(new URL(path, base), { redirect: "error", signal: AbortSignal.timeout(10000) });
  assert.equal(response.status, 200, path);
  const html = await response.text();
  checked.set(path, html);
  assert.match(html, /noindex/, `${path}: preview indexing`);
  assert.doesNotMatch(html, /application\/ld\+json/, `${path}: no sample job markup`);
  if (path.startsWith("/prototype/")) {
    assert.match(html, /Design preview/);
    assert.match(html, /Live integration pending/);
    assert.doesNotMatch(html, /<form\b|type="file"|href="#"/, `${path}: no collecting forms or placeholder actions`);
    for (const match of html.matchAll(/<input\b[^>]*type="password"[^>]*>/g)) assert.match(match[0], /\bdisabled(?:="")?/, "Credential input must remain disabled");
  }
}
const links = new Set<string>();
for (const [path, html] of checked) {
  for (const match of html.matchAll(/<a\b[^>]*href="([^"]+)"/g)) {
    const href = match[1].replaceAll("&amp;", "&");
    assert.ok(href.startsWith("/") || href.startsWith("#"), `${path}: unexpected external link ${href}`);
    const url = new URL(href, new URL(path, base));
    assert.equal(url.origin, base.origin);
    links.add(url.pathname);
    if (url.pathname === path && url.hash) assert.ok(html.includes(`id="${url.hash.slice(1)}"`), `${path}: missing fragment ${url.hash}`);
  }
}
for (const path of links) {
  if (checked.has(path)) continue;
  const response = await fetch(new URL(path, base), { redirect: "error", signal: AbortSignal.timeout(10000) });
  assert.equal(response.status, 200, `Linked path ${path}`);
}
for (const path of ["/unknown", "/jobs/unknown", "/prototype/company/job-editor", "/prototype/unknown/jobs", "/prototype/admin/unknown"]) {
  assert.equal((await fetch(new URL(path, base), { signal: AbortSignal.timeout(10000) })).status, 404, path);
}
const company = checked.get("/prototype/company/candidates")!;
for (const name of ["Sample Candidate A", "Sample Candidate E", "Sample Candidate F"]) assert.ok(!company.includes(name), `Company projection exposes ${name}`);
for (const name of ["Sample Candidate B", "Sample Candidate C", "Sample Candidate D"]) assert.ok(company.includes(name), `Company projection missing ${name}`);
const recruiter = checked.get("/prototype/recruiter/candidates")!;
assert.ok(!recruiter.includes("Sample Candidate F"));
assert.ok(!checked.get("/prototype/company/rejected")!.includes("Sample Candidate E"));
assert.match(checked.get("/prototype/finance/invoice-detail")!, /USD 150\.00/);
assert.match(checked.get("/prototype/finance/summary")!, /EUR 60\.00/);
console.log(`PASS: ${pages.length} pages, ${links.size} internal link destinations, 5 expected 404s, preview boundaries and role/finance projections.`);
