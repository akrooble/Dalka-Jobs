import assert from "node:assert/strict";
import { createServer } from "node:http";
import { localApiOrigin } from "../lib/api/origin.ts";

// Contract smoke only: owns a synthetic upstream, never starts Go or contacts PostgreSQL.
// Refuses to run if port 8080 is already occupied. Start Next in live mode on 3101 first.
const origin = "http://127.0.0.1:3101";
const apiPort = Number(new URL(localApiOrigin()).port);
let available = false;
let forwardedCookies = "";
let forwardedIdentity = "";
const upstream = createServer((request, response) => {
  forwardedCookies = request.headers.cookie ?? "";
  forwardedIdentity = String(request.headers["x-role"] ?? request.headers["x-user-id"] ?? "");
  response.setHeader("Content-Type", "application/json"); response.setHeader("Cache-Control", "no-store");
  if (request.url === "/api/v1/session") { response.setHeader("Set-Cookie", [`dalka_session=${"a".repeat(64)}; Path=/; HttpOnly; SameSite=Lax`, "unrelated_cookie=never_forward; Path=/"]); response.end(JSON.stringify({ state: "anonymous", csrfToken: "b".repeat(64) })); return; }
  if (request.url?.startsWith("/api/v1/public/jobs/") && available && request.url.endsWith("contract-vacancy")) { response.end(JSON.stringify({ id: "f".repeat(32), slug: "contract-vacancy", title: "Synthetic API contract vacancy", description: "A fictional response used only by the local HTTP contract check.", employer: "Synthetic upstream employer", employerType: "NGO", locationId: "loc-mogadishu", location: "Mogadishu", categoryId: "cat-ict", category: "ICT and Technology", jobType: "Full-time", arrangement: "On-site", applicationMethod: "Company website", destination: "https://example.invalid/apply", postedAt: "2026-11-04T00:00:00Z", closesAt: "2099-01-01T00:00:00Z" })); return; }
  response.statusCode = available ? 404 : 503; response.end(JSON.stringify({ error: { code: available ? "not_found" : "service_unavailable", message: "Synthetic service state." } }));
});
await new Promise<void>((resolve, reject) => { upstream.once("error", reject); upstream.listen(apiPort, "127.0.0.1", resolve); });
try {
  for (const path of ["/admin/sign-in", "/admin/companies", "/admin/jobs", "/admin/job-editor", "/admin/lists", `/admin/job-editor?id=${"f".repeat(32)}`]) { const response = await fetch(origin + path); assert.equal(response.status, 200); const html=await response.text(); assert.match(html, /noindex/); if (path.startsWith("/admin/jobs") || path.startsWith("/admin/job-editor") || path==="/admin/lists") {const visible=html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, "");assert.doesNotMatch(visible,/Frontend preview|All jobs are fictional samples/);assert.match(visible,path==="/admin/lists"?/Checking list access/:/Checking job access/);assert.match(visible,/Local development/);} }
  for (const path of ["/account", "/account/sign-in", "/account/profile", "/account/applications", "/account/application-detail", "/account/apply", "/account/notifications", "/admin", "/admin/users", "/admin/assignments", "/admin/recruitment", "/admin/candidate", "/admin/trust", "/admin/reports", "/admin/content", "/admin/invoices", "/admin/invoice-editor", "/admin/invoice-detail", "/admin/payments", "/admin/prices", "/admin/summary", "/admin/settings", "/admin/activity", "/workspace/recruiter/jobs", "/workspace/recruiter/candidates", "/workspace/recruiter/interviews", "/workspace/recruiter/candidate", "/workspace/company/jobs", "/workspace/company/candidates", "/workspace/company/rejected", "/workspace/company/progress"]) {
    const response = await fetch(origin + path); assert.equal(response.status,200,path);
    const visible = (await response.text()).replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, "");
    assert.doesNotMatch(visible,/Frontend preview|Sample Applicant|Reset sample data|Fictional applications in this tab|Draft example|No signed-in account/i,path);
    assert.match(visible,path.startsWith("/account")?/Checking your session/:/Checking workspace access/,path);
  }
  let response = await fetch(`${origin}/api/v1/session`, { headers: { Cookie: `other_app=private; dalka_session=${"c".repeat(64)}`, "X-Role": "super_admin", "X-User-Id": "forged" } });
  assert.equal(response.status, 200); assert.equal(forwardedCookies, `dalka_session=${"c".repeat(64)}`); assert.equal(forwardedIdentity, ""); assert.equal(response.headers.get("Cache-Control"), "no-store"); assert.equal(response.headers.getSetCookie().length, 1); assert.ok(response.headers.getSetCookie()[0].startsWith("dalka_session="));
  response = await fetch(`${origin}/api/v1/auth/password`, { method: "POST", headers: { Origin: "https://attacker.invalid", "Content-Type": "application/json" }, body: "{}" }); assert.equal(response.status, 403);
  response = await fetch(`${origin}/api/v1/auth/password`, { method: "POST", headers: { Origin: origin, "Content-Type": "application/json" }, body: "x".repeat(65537) }); assert.equal(response.status, 413);
  response = await fetch(`${origin}/jobs/frontend-engineer-talo-digital`); let html = await response.text(); assert.ok(!html.includes("Fictional employer")); assert.ok(!html.includes("Example salary")); assert.ok(html.includes("could not be loaded"));
  available = true;
  response = await fetch(`${origin}/jobs/contract-vacancy`); html = await response.text(); assert.equal(response.status, 200); assert.ok(html.includes("Synthetic API contract vacancy")); assert.ok(!html.includes("Fictional employer")); assert.ok(html.includes("https://example.invalid/apply")); assert.doesNotMatch(html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, ""), /All jobs are fictional samples|Changes reset on refresh/);
  response = await fetch(origin); html=await response.text(); assert.equal(response.status,200); assert.doesNotMatch(html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, ""), /All jobs are fictional samples|Changes reset on refresh/);
  response = await fetch(`${origin}/jobs/frontend-engineer-talo-digital`); assert.equal(response.status, 404);
  console.log("PASS: live mode has no fixture fallback across public, all account, admin and role routes; dynamic detail, proxy cookie/identity allowlists and origin/body bounds. HTTP/SSR only, not hydrated session or database acceptance.");
} finally { await new Promise<void>((resolve) => upstream.close(() => resolve())); }
