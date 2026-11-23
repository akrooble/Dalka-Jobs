"use client";
import Link from "next/link";
import { useState } from "react";
import { useDemo } from "./demo-provider";
import type { Company } from "../../lib/frontend-demo";
import { employerTypes } from "../../lib/demo-jobs";
import { Button } from "../ui/button";
import { Dialog } from "../ui/dialog";
import { TextField, SelectField, TextAreaField } from "../ui/fields";
import { Badge, Card, Facts, FormError, PageHeading, Records } from "./controls";

export function Companies() {
  const { state, update } = useDemo(); const [editing, setEditing] = useState<Company | null>(null); const [associations, setAssociations] = useState<Company | null>(null);
  return <><PageHeading title="The people behind the opportunities." description="Create company profiles and keep their vacancies connected." action={<Button onClick={() => setEditing({ id: "", name: "", type: "Private company", location: "Mogadishu", description: "", verified: false, authority: false })}>+ Add company</Button>} /><Card title="Company directory"><Records caption="Companies" headings={["Company", "Location", "Status", "Jobs", "Actions"]} rows={state.companies.map(c => ({ id: c.id, search: `${c.name} ${c.type} ${c.location}`, cells: [<div key="name"><strong>{c.name}</strong><small className="desk-subtext">{c.type}</small></div>, c.location, <Badge key="badge" value={c.verified ? "Verified" : "Not verified"} />, state.jobs.filter(j => j.companyId === c.id).length, <div className="desk-row-actions" key="actions"><Button variant="secondary" onClick={() => setEditing(c)}>Edit</Button><Button variant="secondary" onClick={() => setAssociations(c)}>View jobs</Button></div>] }))} /></Card>
    <Dialog open={!!editing} onClose={() => setEditing(null)} title={editing?.id ? "Edit sample company" : "Add sample company"}>{editing && <CompanyForm key={editing.id} company={editing} onSave={company => { update(s => ({ ...s, companies: editing.id ? s.companies.map(c => c.id === company.id ? company : c) : [...s.companies, company], jobs: s.jobs.map(j => j.companyId === company.id ? { ...j, employer: company.name, employerType: company.type, initials: company.name.split(" ").slice(0, 2).map(w => w[0]).join("") } : j) }), company.id, "Company saved"); setEditing(null); }} />}</Dialog>
    <Dialog open={!!associations} onClose={() => setAssociations(null)} title={`${associations?.name ?? "Company"} · Vacancies`}><Facts items={state.jobs.filter(j => j.companyId === associations?.id).map(j => [j.title, <Link className="desk-link" key={j.id} href={`/admin/job-editor?id=${j.id}`}>{j.status} · Edit vacancy ↗</Link>])} />{!state.jobs.some(j => j.companyId === associations?.id) && <p>No sample jobs yet. Create one from the job directory.</p>}</Dialog>
  </>;
}
function CompanyForm({ company, onSave }: { company: Company; onSave: (company: Company) => void }) {
  const { state } = useDemo(); const [values, setValues] = useState(company); const [error, setError] = useState("");
  return <form className="desk-form" onSubmit={e => { e.preventDefault(); if (values.name.trim().length < 3) return setError("Use at least three characters for the company name."); if (state.companies.some(c => c.id !== company.id && c.name.toLowerCase() === values.name.trim().toLowerCase())) return setError("A sample company with this name already exists."); onSave({ ...values, name: values.name.trim(), id: company.id || crypto.randomUUID() }); }}><FormError message={error} /><TextField id="company-name" label="Company name" required maxLength={120} value={values.name} onChange={e => setValues({ ...values, name: e.target.value })} /><div className="ui-field-grid"><SelectField id="company-type" label="Employer type" value={values.type} onChange={e => setValues({ ...values, type: e.target.value as Company["type"] })}>{employerTypes.map(t => <option key={t}>{t}</option>)}</SelectField><SelectField id="company-location" label="Location" value={values.location} onChange={e => setValues({ ...values, location: e.target.value })}>{state.locations.map(l => <option key={l}>{l}</option>)}</SelectField></div><TextAreaField id="company-description" label="About the company" maxLength={2000} value={values.description} onChange={e => setValues({ ...values, description: e.target.value })} /><Button type="submit">Save sample company</Button></form>;
}
