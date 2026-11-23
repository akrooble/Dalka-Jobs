"use client";
import Link from "next/link";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useDemo } from "./demo-provider";
import { WorkspaceShell } from "./workspace-shell";
import { Badge, Card, Facts, FormError, Metrics, PageHeading, Records } from "./controls";
import { Companies } from "./companies";
import { Jobs, JobEditor } from "./jobs";
import { Recruitment, CandidateReview } from "./recruitment";
import { Assignments, ManagedLists, Reports, Team, Verification } from "./management";
import { InvoiceDetail, InvoiceEditor, Invoices, Payments, Revenue } from "./finance";
import { TextField, TextAreaField } from "../ui/fields";
import { Button } from "../ui/button";
import { moneyInput } from "../../lib/frontend-demo";

export function AdminScreen({ section }: { section: string }) { return <WorkspaceShell section={section}><Suspense fallback={<p role="status">Opening sample workspace…</p>}><Content section={section} /></Suspense></WorkspaceShell>; }
function Content({ section }: { section: string }) {
  if (["job-editor", "candidate", "invoice-editor", "invoice-detail"].includes(section)) return <QueryContent section={section} />;
  if (section === "overview") return <Overview />;
  if (section === "jobs") return <Jobs />;
  if (section === "companies") return <Companies />;
  if (section === "recruitment") return <Recruitment />;
  if (section === "lists") return <ManagedLists />;
  if (section === "users") return <Team />;
  if (section === "assignments") return <Assignments />;
  if (section === "trust") return <Verification />;
  if (section === "reports") return <Reports />;
  if (section === "invoices") return <Invoices />;
  if (section === "payments") return <Payments />;
  if (section === "summary") return <Revenue />;
  if (["settings", "content", "prices"].includes(section)) return <Settings key={section} section={section} />;
  return <Activity />;
}
function QueryContent({ section }: { section: string }) {
  const params = useSearchParams(); const id = params.get("id");
  if (section === "job-editor") return <JobEditor key={id ?? "new"} id={id} />;
  if (section === "candidate") return <CandidateReview key={id} id={id} />;
  if (section === "invoice-editor") return <InvoiceEditor key={id ?? "new"} id={id} />;
  return <InvoiceDetail key={id} id={id} />;
}
function Overview() {
  const { state } = useDemo();
  return <><PageHeading eyebrow="Administration / Overview" title="A clear view of the day." description="A few thoughtful next steps can make a world of difference. Here’s your sample workspace." action={<Link href="/admin/job-editor" className="button button-primary">+ Create job</Link>} /><Metrics values={[["Published vacancies", state.jobs.filter(j => j.status === "Published").length, "Visible in the sample collection"], ["Applications to review", state.candidates.filter(c => c.stage === "Submitted").length, "Sample candidates at the first stage"], ["Upcoming interviews", state.candidates.filter(c => c.stage === "Interview Scheduled").length, "Illustrative recruitment pipeline"], ["Reports to review", state.reports.filter(r => r.status === "Open").length, "Fictional vacancy reports"]]} /><div className="desk-welcome"><div><p className="eyebrow">Make room for possibility</p><h2>Good work starts<br />with a thoughtful next step.</h2><p>Keep your opportunities clear and your people connected.</p><Link className="button button-primary" href="/admin/recruitment">Explore recruitment ↗</Link></div><div className="desk-welcome-art" aria-hidden="true"><span>↗</span><small>PEOPLE. PURPOSE. POSSIBILITY.</small></div></div><div className="desk-two-column"><Card title="Recent opportunities" aside={<Link className="desk-link" href="/admin/jobs">View all ↗</Link>}><ul className="desk-overview-list">{state.jobs.slice(-4).reverse().map(j => <li key={j.id}><div className={`employer-mark tone-${j.tone}`} aria-hidden="true">{j.initials}</div><div><Link className="desk-link" href={`/admin/job-editor?id=${j.id}`}>{j.title}</Link><small>{j.employer} · {j.location}</small></div><Badge value={j.status} /></li>)}</ul></Card><Card title="Your next steps"><div className="desk-next-links">{[["01", "Review candidate applications", "Keep the recruitment pipeline moving.", "/admin/recruitment"], ["02", "Check company profiles", "Get to know the teams behind the jobs.", "/admin/companies"], ["03", "Review outstanding invoices", "See each currency on its own terms.", "/admin/summary"]].map(([n, title, subtitle, href]) => <Link key={n} href={href}><span>{n}</span><div><strong>{title}</strong><small>{subtitle}</small></div><span aria-hidden="true">↗</span></Link>)}</div></Card></div></>;
}
function Settings({ section }: { section: string }) {
  const { state, update } = useDemo(); const [values, setValues] = useState(state.settings); const [error, setError] = useState("");
  return <><PageHeading title={section === "prices" ? "A consistent starting point." : section === "content" ? "Make every message clear." : "The details that hold it together."} description="Edit sample preferences and copy. Changes affect this tab only; production policies and security settings remain separate." /><form className="desk-form" onSubmit={e => { e.preventDefault(); if (values.siteName.trim().length < 3) return setError("Use at least three characters for the site name."); if (!/^[^\s@]+@example\.invalid$/.test(values.contact)) return setError("Use a reserved @example.invalid contact address."); if (moneyInput(values.advertFee) === null || moneyInput(values.recruitmentFee) === null) return setError("Enter sample prices with at most two decimal places."); update(s => ({ ...s, settings: values }), "demo-settings", "Sample preferences saved"); setError(""); }}><FormError message={error} /><div className="desk-two-column"><Card title={section === "prices" ? "Illustrative service fees" : section === "content" ? "Website copy" : "General preferences"}><div className="desk-form">{section === "prices" ? <><TextField id="price-advert" label="Advertisement fee · USD" inputMode="decimal" value={values.advertFee} onChange={e => setValues({ ...values, advertFee: e.target.value })} /><TextField id="price-recruitment" label="Recruitment fee · USD" inputMode="decimal" value={values.recruitmentFee} onChange={e => setValues({ ...values, recruitmentFee: e.target.value })} /><p className="desk-hint">Sample defaults for new invoice drafts. Existing invoices stay unchanged. Exact prices and company/job override precedence require owner approval before live use.</p></> : <><TextField id="settings-name" label="Site display name" required maxLength={100} value={values.siteName} onChange={e => setValues({ ...values, siteName: e.target.value })} /><TextField id="settings-contact" label="Sample contact email" type="email" required value={values.contact} onChange={e => setValues({ ...values, contact: e.target.value })} /><TextAreaField id="settings-about" label="About the website" maxLength={3000} rows={5} value={values.about} onChange={e => setValues({ ...values, about: e.target.value })} /><TextAreaField id="settings-warning" label="Job safety notice" maxLength={2000} rows={4} value={values.warning} onChange={e => setValues({ ...values, warning: e.target.value })} /></>}<Button type="submit">Save sample {section === "prices" ? "prices" : "preferences"}</Button></div></Card><Card title={section === "prices" ? "Payment instructions" : "A few things stay consistent"}>{section === "prices" ? <TextAreaField id="settings-payment" label="Sample payment instructions" rows={6} maxLength={2000} value={values.paymentInstructions} onChange={e => setValues({ ...values, paymentInstructions: e.target.value })} /> : <Facts items={[["Language", "English · Somali planned later"], ["Deadline timezone", "Africa/Mogadishu · UTC+3"], ["Default currency", "USD"], ["Applicant sign-in", "Email only in production"], ["Phone sign-in", "Off in production"], ["Live security", "Owned by the existing API, unchanged"]]} />}<p className="desk-hint">Draft privacy and terms remain review documents. Saving these samples does not approve a legal policy.</p></Card></div></form></>;
}
function Activity() {
  const { state } = useDemo();
  return <><PageHeading title="A trace of the work." description="Sample actor and record identifiers with timestamps. Private text, contact information and documents are excluded." /><Card title="Sample activity"><Records caption="Activity events" headings={["Actor ID", "Record ID", "Timestamp"]} rows={state.activity.map(a => ({ id: a.id, search: `${a.actorId} ${a.recordId} ${a.time}`, cells: [a.actorId, a.recordId, a.time] }))} /></Card></>;
}
