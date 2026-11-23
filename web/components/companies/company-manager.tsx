"use client";

import Link from "next/link";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { api, ApiError, errorMessage, type Company, type Page, type Session } from "../../lib/api/client";
import { getSession } from "../../lib/session/client";
import { Button } from "../ui/button";
import { TextField, SelectField } from "../ui/fields";
import { Feedback } from "../ui/feedback";
import { StatePanel } from "../ui/state-panel";
import { Pagination } from "../ui/pagination";
import { DataTable, type TableColumn } from "../ui/data-table";

type Associations = { company: Company; jobs: Page<{ id: string; title: string; status: string }> };
export function CompanyManager() {
  const [session, setSession] = useState<Session | null>(null); const [rows, setRows] = useState<Page<Company> | null>(null);
  const [query, setQuery] = useState(""); const [page, setPage] = useState(1); const [revision, setRevision] = useState(0);
  const [selected, setSelected] = useState<Company | null>(null); const [associations, setAssociations] = useState<Associations | null>(null); const [jobPage, setJobPage] = useState(1);
  const [name, setName] = useState(""); const [type, setType] = useState("Private company"); const [editing, setEditing] = useState(false);
  const [error, setError] = useState(""); const [notice, setNotice] = useState(""); const [busy, setBusy] = useState(false); const [loading, setLoading] = useState(true);
  useEffect(() => {
    const abort = new AbortController(); let active = true;
    async function load() { try {
      const s = await getSession(abort.signal); if (!active) return; setSession(s);
      if (s.state !== "full" || s.role !== "super_admin") { setRows(null); setSelected(null); setAssociations(null); return; }
      const data = await api<Page<Company>>(`/admin/companies?${new URLSearchParams({ q: query, page: String(page), pageSize: "10" })}`, { signal: abort.signal });
      if (active) setRows(data);
    } catch (e) { if (active && !(e instanceof Error && e.name === "AbortError")) { setError(errorMessage(e)); setRows(null); if (e instanceof ApiError && [401, 403].includes(e.status)) { setSession(null); setSelected(null); setAssociations(null); setEditing(false); } } }
    finally { if (active) setLoading(false); } }
    void load(); return () => { active = false; abort.abort(); };
  }, [query, page, revision]);
  const open = useCallback(async (company: Company, associationPage = 1) => { setError(""); setBusy(true); try { const data = await api<Associations>(`/admin/companies/${company.id}?page=${associationPage}&pageSize=10`); setSelected(data.company); setAssociations(data); setName(data.company.name); setType(data.company.employerType); setEditing(true); setJobPage(associationPage); } catch (e) { setError(errorMessage(e)); setAssociations(null); if (e instanceof ApiError && [401, 403].includes(e.status)) { setSelected(null); setEditing(false); setRows(null); setSession(null); } } finally { setBusy(false); } }, []);
  async function save(event: FormEvent) {
    event.preventDefault(); if (!session || busy) return; setBusy(true); setError(""); setNotice("");
    try {
      const company = await api<Company>(selected ? `/admin/companies/${selected.id}` : "/admin/companies", { method: selected ? "PATCH" : "POST", csrf: session.csrfToken, body: { name, employerType: type, ...(selected ? { version: selected.version } : {}) } });
      setSelected(company); setEditing(true); setName(company.name); setNotice("Company saved."); setAssociations(null); setRevision((value) => value + 1);
    } catch (e) { setError(errorMessage(e)); if (e instanceof ApiError && [401, 403].includes(e.status)) { setEditing(false); setSelected(null); setAssociations(null); setRows(null); setSession(null); } }
    finally { setBusy(false); }
  }
  async function logout() { if (!session) return; setBusy(true); try { await api("/auth/logout", { method: "POST", csrf: session.csrfToken }); setSession(null); setRows(null); setSelected(null); setAssociations(null); setEditing(false); setNotice("You have signed out."); } catch (e) { setError(errorMessage(e)); } finally { setBusy(false); } }
  const columns: TableColumn<Company>[] = [{ key: "name", heading: "Company", rowHeader: true, render: (company) => <Button variant="secondary" disabled={busy} onClick={() => open(company)}>{company.name}</Button> }, { key: "type", heading: "Employer type", render: (company) => company.employerType }, { key: "version", heading: "Version", render: (company) => company.version }];
  const authorised = session?.state === "full" && session.role === "super_admin";
  return <>
    {error && <Feedback title="Unable to complete the request" tone="danger" announce><p>{error}</p><Button variant="secondary" onClick={() => { setError(""); setRevision((value) => value + 1); }}>Reload session and list</Button>{selected && <Button variant="secondary" disabled={busy} onClick={() => open(selected)}>Reload selected company</Button>}</Feedback>}
    {notice && <Feedback title={notice} tone="success" announce onDismiss={() => setNotice("")} />}
    {loading && <StatePanel variant="loading" title="Checking company access"><p>Verifying your session and role.</p></StatePanel>}
    {!loading && !authorised && <StatePanel variant="forbidden" title="Super-admin access required"><p>Company management requires a completed password and authenticator sign-in with the super-admin role.</p><Link className="button button-primary" href="/admin/sign-in">Sign in securely →</Link></StatePanel>}
    {authorised && <><div className="proto-toolbar"><Button onClick={() => { setSelected(null); setAssociations(null); setName(""); setType("Private company"); setEditing(true); setError(""); setNotice(""); }} disabled={busy}>New company</Button><Button variant="secondary" onClick={logout} loading={busy}>Sign out</Button></div><div className="proto-two-column"><section className="ui-card proto-card"><h2>Company directory</h2><TextField id="company-search" label="Search companies" type="search" value={query} maxLength={160} onChange={(e) => { setQuery(e.target.value); setPage(1); setError(""); setLoading(true); }} />{rows && <><p className="ui-table-count" role="status">{rows.total} companies found</p><DataTable rows={rows.items} columns={columns} caption="Companies in Dalka Jobs" emptyState={<StatePanel title="No companies found"><p>{query ? "Try a broader search." : "Create the first company to get started."}</p></StatePanel>} /><Pagination page={rows.page} totalPages={Math.max(1, Math.ceil(rows.total / rows.pageSize))} onPageChange={(value) => { setLoading(true); setPage(value); }} /></>}</section>
      <section className="ui-card proto-card"><h2>{editing ? selected ? "Edit company" : "Create company" : "Company details"}</h2>{!editing ? <p>Select a company or create a new one.</p> : <><form onSubmit={save}><TextField id="company-name" label="Company name" hint="2–160 characters. Duplicate names are refused." value={name} onChange={(e) => setName(e.target.value)} minLength={2} maxLength={160} required disabled={busy} /><SelectField id="company-type" label="Employer type" value={type} onChange={(e) => setType(e.target.value)} disabled={busy}>{["Private company", "NGO", "Government"].map((value) => <option key={value}>{value}</option>)}</SelectField><Button loading={busy} type="submit">Save company</Button></form>{selected && <><p className="proto-gate">Version {selected.version}. Last updated {new Date(selected.updatedAt).toLocaleString("en-GB", { timeZone: "Africa/Mogadishu" })} (UTC+3).</p><Button variant="secondary" disabled={busy} onClick={() => open(selected)}>Load associated jobs</Button></>}</>}
      {associations && <div className="live-associated"><h3>Associated jobs</h3>{associations.jobs.items.length ? <ul className="proto-managed-list">{associations.jobs.items.map((job) => <li key={job.id}>{job.title} · {job.status}</li>)}</ul> : <p>No associated jobs.</p>}<Pagination page={jobPage} totalPages={Math.max(1, Math.ceil(associations.jobs.total / associations.jobs.pageSize))} onPageChange={(value) => { if (selected) void open(selected, value); }} label="Associated job pages" /></div>}</section></div></>}
  </>;
}
