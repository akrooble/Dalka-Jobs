"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { api, errorMessage, type PublicJob, type Page, type ListEntry } from "../lib/api/client";
import { TextField, SelectField } from "./ui/fields";
import { Button } from "./ui/button";
import { Feedback } from "./ui/feedback";
import { StatePanel } from "./ui/state-panel";
import { Pagination } from "./ui/pagination";

const initial = { q: "", locationId: "", categoryId: "", employerType: "", jobType: "", closingSoon: false, sort: "newest" };
export function LiveJobBrowser() {
  const [filters, setFilters] = useState(initial); const [page, setPage] = useState(1);
  const [lists, setLists] = useState<ListEntry[]>([]); const [jobs, setJobs] = useState<Page<PublicJob> | null>(null);
  const [error, setError] = useState(""); const [loading, setLoading] = useState(true); const [revision, setRevision] = useState(0);
  useEffect(() => {
    const abort = new AbortController(); let active = true;
    async function load() {
      const params = new URLSearchParams({ ...filters, closingSoon: String(filters.closingSoon), page: String(page), pageSize: "10" });
      try { const [listData, jobData] = await Promise.all([api<{ items: ListEntry[] }>("/public/lists", { signal: abort.signal }), api<Page<PublicJob>>(`/public/jobs?${params}`, { signal: abort.signal })]); if (active) { setLists(listData.items); setJobs(jobData); setError(""); } }
      catch (e) { if (active && !(e instanceof Error && e.name === "AbortError")) { setError(errorMessage(e)); setJobs(null); } }
      finally { if (active) setLoading(false); }
    }
    void load(); return () => { active = false; abort.abort(); };
  }, [filters, page, revision]);
  function update<K extends keyof typeof initial>(key: K, value: (typeof initial)[K]) { setLoading(true); setPage(1); setFilters((previous) => ({ ...previous, [key]: value })); }
  return <section id="jobs" className="container jobs-section"><div className="ui-page-heading"><p className="eyebrow">Published vacancies</p><h2 className="live-results-title">Find a possibility that fits.</h2><p>Browse current vacancies. Closing times are shown in Somalia time (UTC+3).</p></div>
    <form className="live-search" onSubmit={(e) => { e.preventDefault(); document.getElementById("live-job-results")?.focus(); }}><TextField id="live-keyword" label="Job title, keyword or employer" type="search" maxLength={160} value={filters.q} onChange={(e) => update("q", e.target.value)} /><Button type="submit">Search jobs</Button></form>
    <div className="results-layout"><aside className="ui-card proto-card"><h2>Refine your search</h2><SelectField id="live-location" label="Location" value={filters.locationId} onChange={(e) => update("locationId", e.target.value)}><option value="">All locations</option>{lists.filter((v) => v.kind === "location").map((v) => <option key={v.id} value={v.id}>{v.label}</option>)}</SelectField><SelectField id="live-category" label="Category" value={filters.categoryId} onChange={(e) => update("categoryId", e.target.value)}><option value="">All categories</option>{lists.filter((v) => v.kind === "category").map((v) => <option key={v.id} value={v.id}>{v.label}</option>)}</SelectField><SelectField id="live-employer-type" label="Employer type" value={filters.employerType} onChange={(e) => update("employerType", e.target.value)}><option value="">All employers</option>{["Private company", "NGO", "Government"].map((v) => <option key={v}>{v}</option>)}</SelectField><SelectField id="live-job-type" label="Job type" value={filters.jobType} onChange={(e) => update("jobType", e.target.value)}><option value="">All job types</option>{["Full-time", "Contract", "Part-time"].map((v) => <option key={v}>{v}</option>)}</SelectField><label className="checkbox-filter"><input type="checkbox" checked={filters.closingSoon} onChange={(e) => update("closingSoon", e.target.checked)} />Closing within 7 days</label><Button variant="secondary" onClick={() => { setLoading(true); setFilters(initial); setPage(1); }}>Clear all filters</Button></aside>
      <div className="results-panel"><h2 id="live-job-results" tabIndex={-1} className="live-results-title">Current opportunities</h2><SelectField id="live-sort" label="Sort jobs" value={filters.sort} onChange={(e) => update("sort", e.target.value)}><option value="newest">Newest first</option><option value="closing">Closing date</option></SelectField>
        {loading && <StatePanel variant="loading" title="Loading vacancies"><p>Checking published opportunities.</p></StatePanel>}
        {error && <Feedback title="Vacancies could not be loaded" tone="danger" announce><p>{error}</p><Button variant="secondary" onClick={() => { setLoading(true); setRevision((v) => v + 1); }}>Try again</Button></Feedback>}
        {!loading && jobs && <><p className="ui-table-count" role="status">{jobs.total} vacancies found</p>{jobs.items.length ? <div className="job-list">{jobs.items.map((job) => <article className="ui-card proto-card" key={job.id}><p className="eyebrow">{job.employer}</p><h3 className="live-job-title"><Link href={`/jobs/${job.slug}`}>{job.title}</Link></h3><p>{job.location} · {job.jobType} · {job.arrangement}</p><p>{job.description.slice(0, 180)}{job.description.length > 180 ? "…" : ""}</p><Link className="proto-text-link" href={`/jobs/${job.slug}`}>View job →</Link></article>)}</div> : <StatePanel title="No current vacancies match"><p>Try a broader search, or check back for new opportunities.</p></StatePanel>}<Pagination page={jobs.page} totalPages={Math.max(1, Math.ceil(jobs.total / jobs.pageSize))} onPageChange={(value) => { setLoading(true); setPage(value); }} label="Vacancy pages" /></>}
      </div></div></section>;
}
