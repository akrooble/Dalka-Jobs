"use client";

import { useState } from "react";
import { demoJobs, type DemoJob } from "../lib/demo-jobs";
import { isClosed } from "../lib/job-detail";
import { paginate, type ValidationIssue } from "../lib/ui";
import { validateExample } from "../lib/ui-preview";
import { Button } from "./ui/button";
import { TextField, SelectField, TextAreaField } from "./ui/fields";
import { ValidationSummary } from "./ui/validation-summary";
import { StatusBadge } from "./ui/status-badge";
import { Feedback } from "./ui/feedback";
import { StatePanel } from "./ui/state-panel";
import { Dialog } from "./ui/dialog";
import { DataTable, type TableColumn } from "./ui/data-table";
import { Pagination } from "./ui/pagination";

const columns: TableColumn<DemoJob>[] = [
  { key: "title", heading: "Example job", rowHeader: true, render: (job) => <><strong>{job.title}</strong><span className="ui-table-subtext">{job.employer} · Fictional</span></> },
  { key: "location", heading: "Location", render: (job) => job.location },
  { key: "status", heading: "Example status", render: (job) => <StatusBadge tone={isClosed(job) ? "neutral" : "info"}>{isClosed(job) ? "Closed example" : "Open example"}</StatusBadge> },
];

export function UiPreview() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [notice, setNotice] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [notes, setNotes] = useState("");
  const [issues, setIssues] = useState<ValidationIssue[]>([]);
  const [validated, setValidated] = useState(false);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const filteredRows = demoJobs.filter((job) => `${job.title} ${job.employer} ${job.location}`.toLowerCase().includes(query.trim().toLowerCase()));
  const table = paginate(filteredRows, page, 3);

  function checkExample() {
    const nextIssues = validateExample({ name, type });
    setIssues(nextIssues);
    setValidated(!nextIssues.length);
    if (nextIssues.length) requestAnimationFrame(() => document.getElementById("example-validation")?.focus());
  }

  return <>
    <div className="ui-page-heading"><p className="eyebrow">Task 2 / Interface foundation</p><h1>A consistent place to start.</h1><p>Reusable controls and layout patterns for the future Dalka Jobs panels.</p></div>
    <Feedback title="Component preview only" tone="warning"><p>This page is public and unauthenticated. It does not grant any role or admin access. Use fictional values only; examples stay in memory and nothing is saved or sent.</p></Feedback>

    <section className="ui-preview-section" id="components" aria-labelledby="components-heading">
      <div className="ui-section-heading"><p className="eyebrow">01 / Components</p><h2 id="components-heading">Small parts. Shared language.</h2><p>Consistent actions, status labels and confirmation patterns.</p></div>
      <div className="ui-card"><h3>Buttons</h3><div className="ui-example-row"><Button onClick={() => setDialogOpen(true)}>Open example dialog</Button><Button variant="secondary" onClick={() => setNotice(true)}>Show example notification</Button><Button variant="danger" disabled>Danger style · disabled</Button><Button loading loadingLabel="Busy example" /></div><p className="ui-example-note">The busy control is a visual example. No request is running.</p></div>
      <div className="ui-card"><h3>Status badges</h3><div className="ui-example-row"><StatusBadge>Neutral example</StatusBadge><StatusBadge tone="info">Information example</StatusBadge><StatusBadge tone="success">Success example</StatusBadge><StatusBadge tone="warning">Warning example</StatusBadge><StatusBadge tone="danger">Error example</StatusBadge></div></div>
    </section>

    <section className="ui-preview-section" id="fields" aria-labelledby="fields-heading">
      <div className="ui-section-heading"><p className="eyebrow">02 / Fields & validation</p><h2 id="fields-heading">Clear labels. Useful feedback.</h2><p>Check the empty example to see a linked error summary and field-level messages.</p></div>
      <div className="ui-card"><ValidationSummary issues={issues} id="example-validation" />
        <fieldset className="ui-example-fields"><legend>Local example · not a submission form</legend>
          <div className="ui-field-grid"><TextField id="example-name" label="Example name" hint="Use a fictional name with at least two characters." value={name} onChange={(event) => { setName(event.target.value); setValidated(false); }} error={issues.find((issue) => issue.fieldId === "example-name")?.message} autoComplete="off" maxLength={100} />
            <SelectField id="example-type" label="Example type" hint="Choose a value to test validation." value={type} onChange={(event) => { setType(event.target.value); setValidated(false); }} error={issues.find((issue) => issue.fieldId === "example-type")?.message}><option value="">Choose an example</option><option value="sample-a">Sample A</option><option value="sample-b">Sample B</option></SelectField></div>
          <TextAreaField id="example-notes" label="Optional example notes" hint="Fictional text only. Not stored, sent or attached to a record." rows={3} value={notes} onChange={(event) => setNotes(event.target.value)} maxLength={300} />
          <div className="ui-example-row"><Button onClick={checkExample}>Validate example</Button><TextField id="example-disabled" label="Disabled field example" value="Unavailable in this example" disabled /></div>
        </fieldset>
        {validated && <Feedback title="Example checked locally" tone="success" announce><p>Nothing was saved or sent. These rules demonstrate the controls, not a production validation contract.</p></Feedback>}
      </div>
    </section>

    <section className="ui-preview-section" id="tables" aria-labelledby="tables-heading">
      <div className="ui-section-heading"><p className="eyebrow">03 / Tables & pagination</p><h2 id="tables-heading">Easy to scan. Simple to navigate.</h2><p>A small table with scoped headers, a caption, local filtering and three rows per page.</p></div>
      <div className="ui-card"><TextField id="example-table-search" label="Filter the example table" hint="Try Remote or a title. This filters only fictional fixtures." type="search" value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} />
        <p className="ui-table-count" role="status" aria-live="polite">Showing {table.from}–{table.to} of {table.totalRows} example rows.</p>
        <DataTable rows={table.rows} columns={columns} caption="Fictional job rows for layout review" emptyState={<StatePanel title="No example rows match"><p>Try a broader table search.</p><Button variant="secondary" onClick={() => { setQuery(""); setPage(1); }}>Clear table search</Button></StatePanel>} />
        <Pagination page={table.page} totalPages={table.totalPages} onPageChange={setPage} />
      </div>
    </section>

    <section className="ui-preview-section" id="states" aria-labelledby="states-heading">
      <div className="ui-section-heading"><p className="eyebrow">04 / Feedback & states</p><h2 id="states-heading">Make every state understandable.</h2><p>These are component illustrations, not the result of actual network or authorisation checks.</p></div>
      <div className="ui-state-grid"><StatePanel variant="loading" title="Loading example"><p>A future data request would show a clear progress state here. No request is running.</p></StatePanel><StatePanel title="Empty example"><p>Explain what is missing and offer the relevant next step.</p></StatePanel><StatePanel variant="error" title="Error example"><p>Explain that data could not load without exposing internal errors or credentials.</p></StatePanel><StatePanel variant="forbidden" title="Forbidden example"><p>A future API denial would be explained here. This preview does not check or grant permissions.</p></StatePanel></div>
      <div className="ui-card"><Feedback title="Information example"><p>Keep messages specific and useful.</p></Feedback><Feedback title="Warning example" tone="warning"><p>Explain a condition before the person takes an action.</p></Feedback></div>
    </section>

    {notice && <div className="ui-notification"><Feedback title="Example notification" tone="success" announce onDismiss={() => setNotice(false)}><p>This is a local UI demonstration. Nothing was saved or sent.</p></Feedback></div>}
    <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} title="An example confirmation dialog" description="For layout and keyboard review only. No record or setting will change."><p>Use Close example, the close control, or Escape to dismiss this dialog. The browser’s native modal behavior keeps keyboard focus inside while it is open.</p></Dialog>
  </>;
}
