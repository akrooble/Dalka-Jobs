"use client";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { TextField, SelectField } from "../ui/fields";
import { Button } from "../ui/button";
import { DataTable } from "../ui/data-table";
import { Pagination } from "../ui/pagination";
import { paginate } from "../../lib/ui";
import { StatusBadge } from "../ui/status-badge";

export function PageHeading({ eyebrow = "Dalka Jobs / Workspace", title, description, action }: { eyebrow?: string; title: string; description: string; action?: ReactNode }) { return <div className="desk-heading"><div><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p>{description}</p></div>{action && <div className="desk-heading-action">{action}</div>}</div>; }
export function Card({ title, children, aside }: { title: string; children: ReactNode; aside?: ReactNode }) { return <section className="desk-card"><div className="desk-card-heading"><h2>{title}</h2>{aside}</div>{children}</section>; }
export function Badge({ value }: { value: string }) { return <StatusBadge tone={["Published", "Paid", "Hired", "Resolved", "Active", "Verified"].includes(value) ? "success" : ["Draft", "Archived", "Cancelled", "Rejected", "Inactive"].includes(value) ? "neutral" : ["Open", "Submitted", "Sent", "Overdue", "Not verified"].includes(value) ? "warning" : "info"}>{value}</StatusBadge>; }
export function FormError({ message, fieldId }: { message: string; fieldId?: string }) {
  const summary = useRef<HTMLDivElement>(null);
  useEffect(() => { if (message) summary.current?.focus(); }, [message]);
  return message ? <div ref={summary} className="desk-form-error" role="alert" tabIndex={-1}>{fieldId ? <a href={"#" + fieldId} onClick={event => { event.preventDefault(); document.getElementById(fieldId)?.focus(); }}>{message}</a> : message}</div> : null;
}
export function Empty({ title = "Nothing here yet.", children }: { title?: string; children?: ReactNode }) { return <div className="desk-empty"><span aria-hidden="true">◎</span><h3>{title}</h3><p>{children ?? "Try another search or add a sample record to get started."}</p></div>; }
export function Facts({ items }: { items: [string, ReactNode][] }) { return <dl className="desk-facts">{items.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>; }
export function Metrics({ values }: { values: [string, string | number, string][] }) { return <div className="desk-metrics">{values.map(([label, value, note], index) => <div key={label}><div><span>{label}</span><span className="desk-metric-index" aria-hidden="true">0{index + 1}</span></div><strong>{value}</strong><small>{note}</small></div>)}</div>; }
export type DeskRow = { id: string; search: string; cells: ReactNode[]; status?: string };
export function Records({ rows, headings, caption, filters = [] }: { rows: DeskRow[]; headings: string[]; caption: string; filters?: string[] }) {
  const id = useId(); const [query, setQuery] = useState(""); const [status, setStatus] = useState(""); const [page, setPage] = useState(1);
  const filtered = rows.filter(r => r.search.toLowerCase().includes(query.trim().toLowerCase()) && (!status || status === r.status));
  const result = paginate(filtered, page, 6);
  return <><div className="desk-table-tools"><TextField id={`${id}-query`} label={`Search ${caption.toLowerCase()}`} type="search" placeholder="Search by name, title or status…" value={query} onChange={e => { setQuery(e.target.value); setPage(1); }} />{filters.length > 0 && <SelectField id={`${id}-status`} label="Filter by status" value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}><option value="">All statuses</option>{filters.map(s => <option key={s}>{s}</option>)}</SelectField>}</div><DataTable caption={caption} rows={result.rows} columns={headings.map((heading, index) => ({ key: `${index}`, heading, rowHeader: index === 0, render: (row: DeskRow) => row.cells[index] }))} emptyState={<Empty title={query || status ? "No matching records." : "No records yet."}>{query || status ? <Button variant="secondary" onClick={() => { setQuery(""); setStatus(""); setPage(1); }}>Clear filters</Button> : undefined}</Empty>} /><div className="desk-table-bottom"><p role="status">Showing {result.from}–{result.to} of {result.totalRows} sample records</p><Pagination page={result.page} totalPages={result.totalPages} onPageChange={setPage} /></div></>;
}
