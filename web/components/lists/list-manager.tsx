"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { api, ApiError, errorMessage, type ManagedListEntry, type Page, type Session } from "../../lib/api/client";
import { getSession } from "../../lib/session/client";
import { Button } from "../ui/button";
import { TextField, SelectField } from "../ui/fields";
import { Feedback } from "../ui/feedback";
import { StatePanel } from "../ui/state-panel";
import { Pagination } from "../ui/pagination";
import { DataTable, type TableColumn } from "../ui/data-table";

export function ListManager() {
  const [session, setSession] = useState<Session | null>(null); const [loading, setLoading] = useState(true); const [error, setError] = useState(""); const [revision, setRevision] = useState(0);
  useEffect(() => { const abort = new AbortController(); getSession(abort.signal).then(s => { if (!abort.signal.aborted) { setSession(s); setError(""); } }).catch(e => { if (!abort.signal.aborted) setError(errorMessage(e)); }).finally(() => { if (!abort.signal.aborted) setLoading(false); }); return () => abort.abort(); }, [revision]);
  const failure = useCallback((e: unknown) => { if (e instanceof ApiError && [401, 403].includes(e.status)) { setSession(null); setError("Your session or permission changed. Sign in again to continue."); } }, []);
  return <>
    <nav className="proto-toolbar" aria-label="Administration"><Link className="proto-text-link" href="/admin/jobs">Jobs</Link><Link className="proto-text-link" href="/admin/companies">Companies</Link><Link className="proto-text-link" href="/admin/sign-in">Account and sign out</Link></nav>
    {loading && <StatePanel variant="loading" title="Checking list access"><p>Verifying your session.</p></StatePanel>}
    {error && <Feedback title="List access unavailable" tone="danger" announce><p>{error}</p><Button variant="secondary" onClick={() => { setLoading(true); setRevision(v => v + 1); }}>Check session again</Button></Feedback>}
    {!loading && session?.role !== "super_admin" && <StatePanel variant="forbidden" title="Super-admin access required"><p>Complete password and authenticator verification to manage categories and locations.</p><Link className="button button-primary" href="/admin/sign-in">Sign in securely →</Link></StatePanel>}
    {session?.state === "full" && session.role === "super_admin" && <ListWorkspace session={session} onFailure={failure} />}
  </>;
}

function ListWorkspace({ session, onFailure }: { session: Session; onFailure: (e: unknown) => void }) {
  const [query, setQuery] = useState(""); const [filterKind, setFilterKind] = useState(""); const [filterActive, setFilterActive] = useState(""); const [page, setPage] = useState(1); const [revision, setRevision] = useState(0);
  const [rows, setRows] = useState<Page<ManagedListEntry> | null>(null); const [listLoading, setListLoading] = useState(true); const [listError, setListError] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null); const [selected, setSelected] = useState<ManagedListEntry | null>(null); const [loadTarget, setLoadTarget] = useState<{ id: string } | null>(null);
  const [editing, setEditing] = useState(false); const [recordLoading, setRecordLoading] = useState(false); const [label, setLabel] = useState(""); const [kind, setKind] = useState("category"); const [active, setActive] = useState(true);
  const [recordError, setRecordError] = useState(""); const [notice, setNotice] = useState(""); const [busy, setBusy] = useState(false); const [stale, setStale] = useState(false);
  const saving = useRef(false); const mounted = useRef(true);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  useEffect(() => {
    const abort = new AbortController();
    api<Page<ManagedListEntry>>(`/admin/lists?${new URLSearchParams({ q: query, kind: filterKind, active: filterActive, page: String(page), pageSize: "10" })}`, { signal: abort.signal }).then(data => { if (!abort.signal.aborted) { setRows(data); setListError(""); } }).catch(e => { if (!abort.signal.aborted) { setRows(null); setListError(errorMessage(e)); onFailure(e); } }).finally(() => { if (!abort.signal.aborted) setListLoading(false); });
    return () => abort.abort();
  }, [query, filterKind, filterActive, page, revision, onFailure]);
  useEffect(() => {
    if (!loadTarget) return;
    const abort = new AbortController();
    api<ManagedListEntry>(`/admin/lists/${loadTarget.id}`, { signal: abort.signal }).then(data => { if (!abort.signal.aborted) { setSelected(data); setLabel(data.label); setKind(data.kind); setActive(data.active); setEditing(true); setStale(false); setRecordError(""); } }).catch(e => { if (!abort.signal.aborted) { setEditing(false); setRecordError(errorMessage(e)); onFailure(e); } }).finally(() => { if (!abort.signal.aborted) setRecordLoading(false); });
    return () => abort.abort();
  }, [loadTarget, onFailure]);
  function open(row: ManagedListEntry) { if (saving.current) return; setRecordLoading(true); setEditing(false); setSelected(null); setSelectedId(row.id); setLoadTarget({ id: row.id }); setRecordError(""); setNotice(""); }
  function create() { if (saving.current) return; setLoadTarget(null); setSelectedId(null); setSelected(null); setRecordLoading(false); setLabel(""); setKind("category"); setActive(true); setStale(false); setEditing(true); setRecordError(""); setNotice(""); }
  async function save(event: FormEvent) {
    event.preventDefault(); if (saving.current || stale || recordLoading) return;
    saving.current = true; setBusy(true); setRecordError(""); setNotice("");
    try {
      const row = await api<ManagedListEntry>(selected ? `/admin/lists/${selected.id}` : "/admin/lists", { method: selected ? "PATCH" : "POST", csrf: session.csrfToken, body: selected ? { label, active, version: selected.version } : { label, kind } });
      if (mounted.current) { setSelected(row); setSelectedId(row.id); setLabel(row.label); setKind(row.kind); setActive(row.active); setNotice(`Saved ${row.label} as ${row.active ? "active" : "inactive"}.`); setListLoading(true); setRevision(v => v + 1); }
    } catch (e) { if (mounted.current) { setRecordError(errorMessage(e)); if (e instanceof ApiError && e.code === "stale_list") setStale(true); onFailure(e); } }
    finally { saving.current = false; if (mounted.current) setBusy(false); }
  }
  const columns: TableColumn<ManagedListEntry>[] = [
    { key: "label", heading: "Label", rowHeader: true, render: row => <Button variant="secondary" disabled={busy || recordLoading} onClick={() => open(row)}>{row.label}</Button> },
    { key: "kind", heading: "Type", render: row => row.kind }, { key: "active", heading: "State", render: row => row.active ? "Active" : "Inactive" }, { key: "jobs", heading: "Linked jobs", render: row => row.jobCount },
  ];
  return <><div className="proto-toolbar"><Button disabled={busy || recordLoading} onClick={create}>New category or location</Button></div>
    {notice && <Feedback title="List entry saved" tone="success" announce><p>{notice}</p></Feedback>}
    <div className="proto-two-column"><section className="ui-card proto-card"><h2>Categories and locations</h2><p>Renaming keeps job links intact. Inactive entries can be restored. Values linked to any job must stay active.</p>
      <TextField id="list-search" label="Search labels" type="search" maxLength={100} value={query} onChange={e => { setQuery(e.target.value); setPage(1); setListLoading(true); }} />
      <SelectField id="list-kind-filter" label="Type" value={filterKind} onChange={e => { setFilterKind(e.target.value); setPage(1); setListLoading(true); }}><option value="">All types</option><option value="category">Categories</option><option value="location">Locations</option></SelectField>
      <SelectField id="list-active-filter" label="State" value={filterActive} onChange={e => { setFilterActive(e.target.value); setPage(1); setListLoading(true); }}><option value="">All states</option><option value="true">Active</option><option value="false">Inactive</option></SelectField>
      {listLoading && <StatePanel variant="loading" title="Loading lists"><p>Reading saved categories and locations.</p></StatePanel>}
      {listError && <Feedback title="Lists unavailable" tone="danger" announce><p>{listError}</p><Button variant="secondary" onClick={() => { setListLoading(true); setRevision(v => v + 1); }}>Retry list</Button></Feedback>}
      {!listLoading && rows && <><p role="status">{rows.total} entries found</p><DataTable rows={rows.items} columns={columns} caption="Managed category and location entries" emptyState={<p>No entries match. Adjust the filters or create a new value.</p>} /><Pagination page={rows.page} totalPages={Math.max(1, Math.ceil(rows.total / rows.pageSize))} onPageChange={value => { setPage(value); setListLoading(true); }} /></>}
    </section><section className="ui-card proto-card"><h2>{editing ? selected ? "Edit saved entry" : "Create entry" : "Entry details"}</h2>
      {recordLoading && <StatePanel variant="loading" title="Loading entry"><p>Checking the latest saved version and job links.</p></StatePanel>}
      {recordError && <Feedback title="Entry could not be saved or loaded" tone="danger" announce><p>{recordError}</p><p>Use a unique label of 2–100 characters. To resolve a duplicate, change the label. To resolve a stale version, reload the saved entry.</p>{selectedId && <Button variant="secondary" disabled={busy} onClick={() => { setRecordLoading(true); setEditing(false); setLoadTarget({ id: selectedId }); }}>Reload entry and discard edits</Button>}</Feedback>}
      {!editing && !recordLoading && !recordError && <p>Select an entry or create a new one.</p>}
      {editing && <form className="live-auth-form" onSubmit={save}><fieldset className="live-job-fields" disabled={busy || stale || recordLoading}><legend>Entry information</legend>
        {selected ? <p><strong>Type:</strong> {selected.kind} · <strong>Linked jobs:</strong> {selected.jobCount} (all statuses)</p> : <SelectField id="list-kind" label="Type" value={kind} onChange={e => setKind(e.target.value)}><option value="category">Category</option><option value="location">Location</option></SelectField>}
        <TextField id="list-label" label="Label" value={label} required minLength={2} maxLength={100} hint="Unique within its type, including inactive entries. Renaming updates labels on linked jobs." onChange={e => setLabel(e.target.value)} />
        {selected && <><SelectField id="list-active" label="State" value={String(active)} onChange={e => setActive(e.target.value === "true")}><option value="true">Active</option><option value="false" disabled={selected.jobCount > 0}>Inactive</option></SelectField><p>Version {selected.version}. {selected.jobCount ? "This entry is linked to jobs and cannot be deactivated." : "Inactive values disappear from public filters and new job selections."}</p></>}
        <Button type="submit" loading={busy}>{selected ? "Save changes" : "Create active entry"}</Button>
      </fieldset></form>}
    </section></div>
  </>;
}
