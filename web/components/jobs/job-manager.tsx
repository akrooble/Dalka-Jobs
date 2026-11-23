"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { api, ApiError, errorMessage, type AdminJob, type Company, type JobSummary, type ListEntry, type Page, type Session } from "../../lib/api/client";
import { getSession } from "../../lib/session/client";
import { deadlineInput, deadlineInstant } from "../../lib/job-editor";
import { Button } from "../ui/button";
import { TextAreaField, TextField, SelectField } from "../ui/fields";
import { Feedback } from "../ui/feedback";
import { StatePanel } from "../ui/state-panel";
import { Pagination } from "../ui/pagination";
import { DataTable, type TableColumn } from "../ui/data-table";

const date = (value: string) => new Date(value).toLocaleString("en-GB", { timeZone: "Africa/Mogadishu", dateStyle: "medium", timeStyle: "short" });
export function JobManager({ editor = false, id = null }: { editor?: boolean; id?: string | null }) {
  const [session, setSession] = useState<Session | null>(null);
  const [error, setError] = useState(""); const [loading, setLoading] = useState(true); const [revision, setRevision] = useState(0);
  useEffect(() => {
    const abort = new AbortController();
    getSession(abort.signal).then(s => { if (!abort.signal.aborted) { setSession(s); setError(""); } }).catch(e => { if (!abort.signal.aborted) setError(errorMessage(e)); }).finally(() => { if (!abort.signal.aborted) setLoading(false); });
    return () => abort.abort();
  }, [revision]);
  const failure = useCallback((e: unknown) => { if (e instanceof ApiError && [401, 403].includes(e.status)) { setSession(null); setError("Your session or permission changed. Sign in again to continue."); } }, []);
  const allowed = session?.state === "full" && session.role === "super_admin";
  return <>
    <nav className="proto-toolbar" aria-label="Job management"><Link className="proto-text-link" href="/admin/jobs">Jobs</Link><Link className="proto-text-link" href="/admin/companies">Companies</Link><Link className="proto-text-link" href="/admin/lists">Categories and locations</Link><Link className="proto-text-link" href="/admin/sign-in">Account and sign out</Link></nav>
    {loading && <StatePanel variant="loading" title="Checking job access"><p>Verifying your session.</p></StatePanel>}
    {error && <Feedback title="Job access unavailable" tone="danger" announce><p>{error}</p><Button variant="secondary" onClick={() => { setLoading(true); setRevision(v => v + 1); }}>Check session again</Button></Feedback>}
    {!loading && !allowed && <StatePanel variant="forbidden" title="Super-admin access required"><p>Complete password and authenticator verification before managing live jobs.</p><Link className="button button-primary" href="/admin/sign-in">Sign in securely →</Link></StatePanel>}
    {allowed && session && (editor ? <JobEditor key={id ?? "new"} id={id} session={session} onFailure={failure} /> : <JobList onFailure={failure} />)}
  </>;
}
function JobList({ onFailure }: { onFailure: (e: unknown) => void }) {
  const [query, setQuery] = useState(""); const [status, setStatus] = useState(""); const [page, setPage] = useState(1);
  const [rows, setRows] = useState<Page<JobSummary> | null>(null); const [error, setError] = useState(""); const [loading, setLoading] = useState(true); const [revision, setRevision] = useState(0);
  useEffect(() => {
    const abort = new AbortController();
    api<Page<JobSummary>>(`/admin/jobs?${new URLSearchParams({ q: query, status, page: String(page), pageSize: "10" })}`, { signal: abort.signal }).then(data => { if (!abort.signal.aborted) { setRows(data); setError(""); } }).catch(e => { if (!abort.signal.aborted) { setRows(null); setError(errorMessage(e)); onFailure(e); } }).finally(() => { if (!abort.signal.aborted) setLoading(false); });
    return () => abort.abort();
  }, [query, status, page, revision, onFailure]);
  const columns: TableColumn<JobSummary>[] = [
    { key: "title", heading: "Job", rowHeader: true, render: j => <Link className="proto-text-link" href={`/admin/job-editor?id=${j.id}`}>{j.title}</Link> },
    { key: "company", heading: "Company", render: j => j.employer }, { key: "status", heading: "Status", render: j => j.status },
    { key: "closing", heading: "Closes · UTC+3", render: j => date(j.closesAt) },
  ];
  return <section className="ui-card proto-card"><div className="proto-toolbar"><h2>Live jobs</h2><Link className="button button-primary" href="/admin/job-editor">New draft job</Link></div><p>Only published, unexpired jobs appear publicly. On-site recruitment cannot be published yet.</p>
    <TextField id="job-search" label="Search title or company" type="search" maxLength={160} value={query} onChange={e => { setLoading(true); setQuery(e.target.value); setPage(1); }} />
    <SelectField id="job-status" label="Status" value={status} onChange={e => { setLoading(true); setStatus(e.target.value); setPage(1); }}><option value="">All statuses</option>{["draft", "published", "archived"].map(s => <option key={s}>{s}</option>)}</SelectField>
    {loading && <StatePanel variant="loading" title="Loading jobs"><p>Reading the job directory.</p></StatePanel>}{error && <Feedback title="Jobs could not be loaded" tone="danger" announce><p>{error}</p><Button variant="secondary" onClick={() => { setLoading(true); setRevision(v => v + 1); }}>Try again</Button></Feedback>}
    {!loading && rows && <><p role="status">{rows.total} jobs found</p><DataTable rows={rows.items} columns={columns} caption="Live job directory" emptyState={<p>No jobs match. Create a draft or change your search.</p>} /><Pagination page={rows.page} totalPages={Math.max(1, Math.ceil(rows.total / rows.pageSize))} onPageChange={value => { setLoading(true); setPage(value); }} /></>}
  </section>;
}

type FormValues = { companyId: string; title: string; description: string; locationId: string; categoryId: string; jobType: string; arrangement: string; applicationMethod: string; destination: string; closesAt: string };
const empty: FormValues = { companyId: "", title: "", description: "", locationId: "", categoryId: "", jobType: "Full-time", arrangement: "On-site", applicationMethod: "Company website", destination: "", closesAt: "" };
function fields(j: AdminJob): FormValues { return { companyId: j.companyId, title: j.title, description: j.description, locationId: j.locationId, categoryId: j.categoryId, jobType: j.jobType, arrangement: j.arrangement, applicationMethod: j.applicationMethod, destination: j.destination, closesAt: deadlineInput(j.closesAt) }; }
function JobEditor({ id, session, onFailure }: { id: string | null; session: Session; onFailure: (e: unknown) => void }) {
  const router = useRouter();
  const [reloadID, setReloadID] = useState(id);
  const [saved, setSaved] = useState<AdminJob | null>(null); const [values, setValues] = useState<FormValues>(empty); const [lists, setLists] = useState<ListEntry[]>([]);
  const [error, setError] = useState(""); const [notice, setNotice] = useState(""); const [busy, setBusy] = useState(false); const [loading, setLoading] = useState(true); const [ready, setReady] = useState(false); const [stale, setStale] = useState(false); const [revision, setRevision] = useState(0);
  const [companyQuery, setCompanyQuery] = useState(""); const [companyPage, setCompanyPage] = useState(1); const [companies, setCompanies] = useState<Page<Company> | null>(null); const [companyError, setCompanyError] = useState(""); const [picked, setPicked] = useState<Company | null>(null);
  const [companyRevision, setCompanyRevision] = useState(0);
  const active = useRef(true); const saving = useRef(false);
  useEffect(() => { active.current = true; return () => { active.current = false; }; }, []);
  useEffect(() => {
    const abort = new AbortController();
    async function load() { try {
      const [entries, job] = await Promise.all([api<{ items: ListEntry[] }>("/public/lists", { signal: abort.signal }), reloadID ? api<AdminJob>(`/admin/jobs/${reloadID}`, { signal: abort.signal }) : Promise.resolve(null)]);
      if (!abort.signal.aborted) { setLists(entries.items); setSaved(job); setValues(job ? fields(job) : empty); setReady(true); setStale(false); setError(""); }
    } catch (e) { if (!abort.signal.aborted) { setReady(false); setError(errorMessage(e)); onFailure(e); } } finally { if (!abort.signal.aborted) setLoading(false); } }
    void load(); return () => abort.abort();
  }, [reloadID, revision, onFailure]);
  useEffect(() => {
    if (id || saved) return;
    const abort = new AbortController();
    api<Page<Company>>(`/admin/companies?${new URLSearchParams({ q: companyQuery, page: String(companyPage), pageSize: "20" })}`, { signal: abort.signal }).then(data => { if (!abort.signal.aborted) { setCompanies(data); setCompanyError(""); } }).catch(e => { if (!abort.signal.aborted) { setCompanies(null); setCompanyError(errorMessage(e)); onFailure(e); } });
    return () => abort.abort();
  }, [id, saved, companyQuery, companyPage, companyRevision, onFailure]);
  function update(key: keyof FormValues, value: string) { setValues(v => ({ ...v, [key]: value, ...(key === "applicationMethod" ? { destination: "" } : {}) })); setNotice(""); }
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (saving.current || !ready || stale) return;
    const status = ((event.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null)?.value || saved?.status || "draft";
    const closesAt = deadlineInstant(values.closesAt);
    if (!closesAt) { setError("Enter a valid closing date and time in Somalia time (UTC+3)."); return; }
    saving.current = true; setBusy(true); setError(""); setNotice("");
    try {
      const job = await api<AdminJob>(saved ? `/admin/jobs/${saved.id}` : "/admin/jobs", { method: saved ? "PATCH" : "POST", csrf: session.csrfToken, body: { ...values, closesAt, status, ...(saved ? { version: saved.version } : {}) } });
      if (active.current) { setSaved(job); setValues(fields(job)); setNotice(`Job saved as ${job.status}. The preview below shows the saved record.`); if (!id) router.replace(`/admin/job-editor?id=${job.id}`); }
    } catch (e) { if (active.current) { setError(errorMessage(e)); if (e instanceof ApiError && e.status === 409) setStale(true); onFailure(e); } }
    finally { saving.current = false; if (active.current) setBusy(false); }
  }
  const choices = companies?.items ?? []; const selectedCompanies = picked && !choices.some(c => c.id === picked.id) ? [picked, ...choices] : choices;
  return <>
    {loading && <StatePanel variant="loading" title="Loading job editor"><p>Reading saved job details and managed lists.</p></StatePanel>}
    {error && <Feedback title="Job could not be saved or loaded" tone="danger" announce><p>{error}</p><p>Validation: check required fields, destination, deadline and publication eligibility. A published job needs a future deadline and an external application method.</p><Button variant="secondary" disabled={busy} onClick={() => { setReloadID(saved?.id ?? id); setLoading(true); setReady(false); setRevision(v => v + 1); }}>Reload saved record and discard edits</Button></Feedback>}
    {notice && <Feedback title="Job saved" tone="success" announce><p>{notice}</p></Feedback>}
    {ready && <div className="proto-two-column"><section className="ui-card proto-card"><h2>{saved ? "Edit live job" : "Create draft job"}</h2><p>Plain-text descriptions only. Closing times use Africa/Mogadishu (UTC+3).</p>
      <form className="live-auth-form" onSubmit={save}><fieldset disabled={busy || stale || loading} className="live-job-fields"><legend>Job information</legend>
        {saved ? <p><strong>Company:</strong> {saved.employer}. Company association is fixed after creation.</p> : <>
          <TextField id="job-company-search" label="Find a company" type="search" maxLength={160} value={companyQuery} onChange={e => { setCompanyQuery(e.target.value); setCompanyPage(1); }} />
          {companyError && <Feedback title="Companies unavailable" tone="danger"><p>{companyError}</p><Button variant="secondary" onClick={() => setCompanyRevision(v => v + 1)}>Retry loading</Button></Feedback>}
          <SelectField id="job-company" label="Company" value={values.companyId} required onChange={e => { update("companyId", e.target.value); setPicked(selectedCompanies.find(c => c.id === e.target.value) ?? null); }}><option value="">Select a company</option>{selectedCompanies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</SelectField>
          {companies && <Pagination page={companies.page} totalPages={Math.max(1, Math.ceil(companies.total / companies.pageSize))} onPageChange={setCompanyPage} label="Company selection pages" />}
          <Link href="/admin/companies" className="proto-text-link">Create a company first →</Link>
        </>}
        <TextField id="job-title" label="Job title" value={values.title} minLength={3} maxLength={160} required onChange={e => update("title", e.target.value)} />
        <TextAreaField id="job-description" label="Description" value={values.description} maxLength={20000} rows={12} required onChange={e => update("description", e.target.value)} />
        <SelectField id="job-location" label="Location" value={values.locationId} required onChange={e => update("locationId", e.target.value)}><option value="">Select a location</option>{lists.filter(l => l.kind === "location").map(l => <option key={l.id} value={l.id}>{l.label}</option>)}</SelectField>
        <SelectField id="job-category" label="Category" value={values.categoryId} required onChange={e => update("categoryId", e.target.value)}><option value="">Select a category</option>{lists.filter(l => l.kind === "category").map(l => <option key={l.id} value={l.id}>{l.label}</option>)}</SelectField>
        <SelectField id="job-type" label="Job type" value={values.jobType} onChange={e => update("jobType", e.target.value)}>{["Full-time", "Contract", "Part-time"].map(v => <option key={v}>{v}</option>)}</SelectField>
        <SelectField id="job-arrangement" label="Work arrangement" value={values.arrangement} onChange={e => update("arrangement", e.target.value)}>{["On-site", "Hybrid", "Remote"].map(v => <option key={v}>{v}</option>)}</SelectField>
        <TextField id="job-closing" label="Closing date and time · UTC+3" type="datetime-local" min="2000-01-01T00:00" max="9999-12-31T23:59" step={60} value={values.closesAt} required onChange={e => update("closesAt", e.target.value)} />
        <SelectField id="job-method" label="Application method" value={values.applicationMethod} onChange={e => update("applicationMethod", e.target.value)}>{["Company website", "Email", "WhatsApp", "Dalka recruitment"].map(v => <option key={v}>{v}</option>)}</SelectField>
        {values.applicationMethod === "Dalka recruitment" ? <p className="proto-gate">Draft only. On-site publishing is blocked until authority, consent, private CV and intake services are available.</p> : <TextField id="job-destination" label={values.applicationMethod === "Email" ? "Application email" : "Application URL"} hint={values.applicationMethod === "WhatsApp" ? "Use https://wa.me/ followed by the international phone number, without + or query parameters." : values.applicationMethod === "Email" ? "One plain email address; no display name or headers." : "Use a public HTTPS company application URL."} type={values.applicationMethod === "Email" ? "email" : "url"} maxLength={2048} required value={values.destination} onChange={e => update("destination", e.target.value)} />}
        <div className="proto-toolbar"><Button type="submit" value={saved?.status ?? "draft"} loading={busy}>{saved?.status === "published" ? "Save published changes" : saved?.status === "archived" ? "Save archived changes" : "Save draft"}</Button>
          {saved && saved.status !== "published" && <Button type="submit" value="published" disabled={values.applicationMethod === "Dalka recruitment"}>Publish job</Button>}
          {saved && saved.status !== "archived" && <Button variant="secondary" type="submit" value="archived">Archive job</Button>}
        </div>
      </fieldset></form>
    </section><section className="ui-card proto-card"><h2>Saved preview</h2>{saved ? <><p role="status">{saved.status} · Version {saved.version}</p><p>Unsaved form changes are not shown here.</p><h3>{saved.title}</h3><p>{saved.employer} · {saved.location} · {saved.category}</p><p>{saved.jobType} · {saved.arrangement}</p><p className="live-description">{saved.description}</p><p>Closes {date(saved.closesAt)} (UTC+3)</p><p>{saved.applicationMethod}{saved.destination ? `: ${saved.destination}` : ""}</p><p>Public URL: /jobs/{saved.slug}</p><p>No application is submitted from this protected preview.</p>{saved.status === "published" && <Link href={`/jobs/${saved.slug}`} className="proto-text-link">Open public job (404 after expiry) →</Link>}<Link href={`/admin/job-editor?id=${saved.id}`} className="proto-text-link">Open saved editor link →</Link></> : <p>Save a draft to inspect the persisted record before publishing.</p>}</section></div>}
  </>;
}
