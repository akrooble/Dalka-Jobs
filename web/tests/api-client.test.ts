import assert from "node:assert/strict";
import test from "node:test";
import { api, ApiError, isSession } from "../lib/api/client.ts";
import { getSession } from "../lib/session/client.ts";
import { localApiOrigin } from "../lib/api/origin.ts";
import { deadlineInput, deadlineInstant } from "../lib/job-editor.ts";
import { knownWorkspacePath } from "../lib/route-boundaries.ts";
import { adminSections,extraAdminSections,accountSections } from "../lib/frontend-demo.ts";

test("dynamic workspace route boundary preserves real 404s before streaming", () => {
  for (const path of ["/admin","/account",...adminSections.map(s=>`/admin/${s[0]}`),...extraAdminSections.map(s=>`/admin/${s}`),...accountSections.map(s=>`/account/${s}`),"/admin/sign-in",... ["jobs","candidates","interviews","candidate"].map(s=>`/workspace/recruiter/${s}`),...["jobs","candidates","rejected","progress"].map(s=>`/workspace/company/${s}`)]) assert.ok(knownWorkspacePath(path),path);
  for (const path of ["/admin/unknown","/admin/jobs/unknown","/account/unknown","/workspace/company/job-editor","/workspace/recruiter/invoices","/workspace/unknown/jobs","/admin/%2e%2e","/api/v1/session"]) assert.equal(knownWorkspacePath(path),false,path);
});

test("managed-list writes keep stable IDs, versions and the same-origin CSRF boundary", async () => {
  const original=globalThis.fetch; let url: unknown; let request: RequestInit | undefined;
  globalThis.fetch=async(input,options)=>{url=input;request=options;return Response.json({id:"loc-mogadishu",active:true,version:2});};
  try { await api("/admin/lists/loc-mogadishu",{method:"PATCH",csrf:"synthetic",body:{label:"Mogadishu",active:true,version:1}});assert.equal(url,"/api/v1/admin/lists/loc-mogadishu");assert.equal(request?.credentials,"same-origin");assert.equal(request?.cache,"no-store");assert.equal((request?.headers as Record<string,string>)["X-CSRF-Token"],"synthetic");assert.equal(request?.body,JSON.stringify({label:"Mogadishu",active:true,version:1}));for(const bad of ["/admin/lists/../../auth/password","/admin/lists/loc-UPPER","/admin/lists/arbitrary","/admin/lists/loc-mogadishu#secret"])await assert.rejects(api(bad),(e:unknown)=>e instanceof ApiError&&e.code==="invalid_path");}finally{globalThis.fetch=original;}
});

test("job editor deadlines always use Somalia time and reject invalid calendars", () => {
  assert.equal(deadlineInstant("2026-11-11T12:00"), "2026-11-11T09:00:00Z");
  assert.equal(deadlineInput("2026-11-11T09:00:00Z"), "2026-11-11T12:00");
  assert.equal(deadlineInstant("2027-01-01T01:00"), "2026-12-31T22:00:00Z");
  for (const invalid of ["2026-02-30T12:00", "2026-13-01T12:00", "2026-11-11T24:00", "2026-11-11T12:00Z", "1999-12-31T12:00", "", "2026-11-11"]) assert.equal(deadlineInstant(invalid), null);
});

test("job writes preserve the existing same-origin CSRF boundary", async () => {
  const original = globalThis.fetch; let url: unknown; let request: RequestInit | undefined;
  globalThis.fetch = async (input, options) => { url = input; request = options; return Response.json({ status: "draft", version: 2 }); };
  try { await api(`/admin/jobs/${"a".repeat(32)}`, { method: "PATCH", csrf: "synthetic-csrf", body: { version: 1, status: "draft" } }); assert.equal(url, `/api/v1/admin/jobs/${"a".repeat(32)}`); assert.equal(request?.credentials,"same-origin"); assert.equal(request?.cache,"no-store"); assert.equal((request?.headers as Record<string,string>)["X-CSRF-Token"],"synthetic-csrf"); assert.equal(request?.body, JSON.stringify({ version: 1, status: "draft" })); } finally { globalThis.fetch = original; }
});

test("server API port override cannot introduce another host or URL", () => {
  const before = process.env.DALKA_API_PORT;
  try { delete process.env.DALKA_API_PORT; assert.equal(localApiOrigin(), "http://127.0.0.1:8080"); process.env.DALKA_API_PORT = "8081"; assert.equal(localApiOrigin(), "http://127.0.0.1:8081"); for (const bad of ["0", "65536", "8080@attacker.invalid", "http://attacker.invalid", "08081", "-1"]) { process.env.DALKA_API_PORT = bad; assert.throws(localApiOrigin); } } finally { if (before === undefined) delete process.env.DALKA_API_PORT; else process.env.DALKA_API_PORT = before; }
});

test("API paths cannot select another origin or unrelated endpoint", async () => {
  const original = globalThis.fetch; let calls = 0;
  globalThis.fetch = async () => { calls++; return Response.json({}); };
  try { for (const path of ["https://attacker.invalid", "//attacker.invalid", "/../admin", "/public/jobs#private", "/auth/password?x=#y"]) await assert.rejects(api(path), (e: unknown) => e instanceof ApiError && e.code === "invalid_path"); assert.equal(calls, 0); } finally { globalThis.fetch = original; }
});
test("credential writes use the same-origin boundary with CSRF and no cache", async () => {
  const original = globalThis.fetch; let request: RequestInit | undefined; let url: unknown;
  globalThis.fetch = async (input, options) => { url = input; request = options; return Response.json({ state: "pending", csrfToken: "a".repeat(64) }); };
  try { await api("/auth/password", { method: "POST", csrf: "sample-token", body: { email: "synthetic@example.invalid", password: "synthetic unit value" } }); assert.equal(url, "/api/v1/auth/password"); assert.equal(request?.credentials, "same-origin"); assert.equal(request?.cache, "no-store"); assert.equal(request?.redirect, "error"); assert.equal((request?.headers as Record<string, string>)["X-CSRF-Token"], "sample-token"); } finally { globalThis.fetch = original; }
});
test("session guard rejects privilege-shaped and malformed payloads", () => {
  for (const value of [null, {}, { state: "full", csrfToken: "a".repeat(64) }, { state: "full", role: "invented", csrfToken: "a".repeat(64) }, { state: "pending", csrfToken: "short" }]) assert.equal(isSession(value), false);
  assert.ok(isSession({ state: "anonymous", csrfToken: "a".repeat(64) })); assert.ok(isSession({ state: "full", role: "super_admin", csrfToken: "a".repeat(64) }));
});
test("applicant session discriminator never grants or accepts team authority", () => {
  const csrfToken = "a".repeat(64);
  assert.ok(isSession({ state: "applicant", subject: "applicant", csrfToken }));
  for (const value of [{state:"full",subject:"applicant",role:"super_admin",csrfToken},{state:"applicant",role:"super_admin",subject:"applicant",csrfToken},{state:"applicant",csrfToken},{state:"anonymous",role:"super_admin",csrfToken},{state:"pending",subject:"applicant",csrfToken},{state:"applicant",subject:"applicant",csrfToken,recoveryCodes:[]}]) assert.equal(isSession(value),false);
});
test("session client does not convert malformed server payload into authentication", async () => {
  const original = globalThis.fetch; globalThis.fetch = async () => Response.json({ role: "super_admin" });
  try { await assert.rejects(getSession(), (e: unknown) => e instanceof ApiError && e.code === "invalid_response"); } finally { globalThis.fetch = original; }
});
test("failed network and API denial preserve an honest error state", async () => {
  const original = globalThis.fetch;
  try { globalThis.fetch = async () => { throw Error("synthetic network failure"); }; await assert.rejects(api("/session"), (e: unknown) => e instanceof ApiError && e.status === 503); globalThis.fetch = async () => Response.json({ error: { code: "forbidden", message: "Access denied." } }, { status: 403 }); await assert.rejects(api("/admin/companies"), (e: unknown) => e instanceof ApiError && e.status === 403 && e.code === "forbidden"); } finally { globalThis.fetch = original; }
});
