"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDemo } from "./demo-provider";
import { companyCandidates, recruiterCandidates, sampleWorkspaceJobs, sampleWorkspaceUser } from "../../lib/frontend-demo";
import { candidateStages } from "../../lib/prototype";
import { WorkspaceShell } from "./workspace-shell";
import { SelectField } from "../ui/fields";
import { Badge, Card, Empty, Metrics, PageHeading, Records } from "./controls";
import { CandidateReview } from "./recruitment";

type Area = "company" | "recruiter";

export function RoleScreen({ area, section, selectedJob = "" }: { area: Area; section: string; selectedJob?: string }) {
  return <WorkspaceShell area={area} section={section}><Suspense fallback={<p role="status">Opening sample workspace…</p>}><Content area={area} section={section} selectedJob={selectedJob} /></Suspense></WorkspaceShell>;
}

function Content({ area, section, selectedJob }: { area: Area; section: string; selectedJob: string }) {
  const { state } = useDemo();
  const router = useRouter();
  const user = sampleWorkspaceUser(state, area);
  const company = area === "company" ? state.companies.find(item => item.id === user?.companyId) : undefined;
  const jobs = sampleWorkspaceJobs(state, area);
  const prefix = "/workspace/" + area;
  const filtered = ["candidates", "interviews", "progress"].includes(section);
  const jobId = filtered ? selectedJob : "";
  const job = jobs.find(item => item.id === jobId);

  if (!user || (area === "company" && !company)) return <>
    <PageHeading title="This sample workspace is unavailable." description="Its sample team member is inactive, has a different role or has no valid company membership." />
    <Card title="Sample access changed"><Empty title="No sample records are shown.">Update the fictional member in the admin team preview, or reset the sample workspace. This is a presentation check, not live authorization.</Empty></Card>
  </>;

  if (section === "candidate" && area === "recruiter") return <CandidateQuery />;
  if (jobId && !job) return <>
    <PageHeading title="This vacancy is outside the sample workspace." description="The selected vacancy is unavailable under the current company membership or recruiter assignment." />
    <Empty title="Choose an available vacancy."><Link className="desk-link" href={prefix + "/" + section}>Clear the vacancy selection</Link></Empty>
  </>;

  const vacancyFilter = <SelectField id={area + "-vacancy-filter"} label="Filter by vacancy" value={jobId} onChange={event => router.push(prefix + "/" + section + (event.target.value ? "?job=" + encodeURIComponent(event.target.value) : ""))}>
    <option value="">{area === "company" ? "All company vacancies" : "All assigned vacancies"}</option>
    {jobs.map(item => <option key={item.id} value={item.id}>{item.title} · {item.employer}</option>)}
  </SelectField>;

  if (section === "rejected") return <><PageHeading title="A separate place for closed outcomes." description="Company preview · Read-only fictional workspace." /><Card title="Rejected applications"><Empty title="Candidate details withheld.">The rejected-list projection and sharing lifecycle need an approved policy. This frontend shows no rejected names, CVs, contacts or private notes.</Empty></Card></>;

  if (section === "progress") {
    const candidates = companyCandidates(state, jobId);
    return <><PageHeading title="Know where things stand." description={"Read-only sample recruitment progress for " + company?.name + "."} />
      <Card title="Select a vacancy">{vacancyFilter}</Card>
      <Metrics values={["Shortlisted", "Interview Scheduled", "Hired"].map(stage => [stage, candidates.filter(candidate => candidate.stage === stage).length, "Eligible fictional company candidates"])} />
      <Card title="Company recruitment summary"><p className="desk-muted">{job ? job.title : jobs.length + " company sample vacancies"}. Candidate details stay limited to names and eligible stages. No private staff notes, CVs or contact information is shown.</p><Link href={prefix + "/candidates" + (jobId ? "?job=" + encodeURIComponent(jobId) : "")} className="desk-link">Review candidate stages ↗</Link></Card>
    </>;
  }

  if (section === "jobs") return <>
    <PageHeading title={area === "company" ? "Your opportunities, at a glance." : "Your assigned opportunities."} description={area === "company" ? "Read-only sample vacancies for " + company?.name + "." : "Sample vacancies assigned to " + user.name + ". No job authoring or billing controls."} />
    <Card title={area === "company" ? "Company vacancies" : "Assigned vacancies"}><Records caption="Vacancies" headings={["Vacancy", "Location", "Status", "Actions"]} rows={jobs.map(item => ({ id: item.id, search: item.title + " " + item.location + " " + item.status, cells: [item.title, item.location, <Badge key="badge" value={item.status} />, <Link className="desk-link" key="link" href={prefix + "/candidates?job=" + encodeURIComponent(item.id)}>View candidates<span className="sr-only"> for {item.title}</span> ↗</Link>] }))} /></Card>
  </>;

  if (area === "company") return <>
    <PageHeading title="Meet the next stage of talent." description="Only own-company Shortlisted, Interview Scheduled and Hired candidates appear here. This sample projection is not live access control." />
    <Card title={job ? "Candidates · " + job.title : "Company candidates"}>{vacancyFilter}<Records caption="Company candidates" headings={["Candidate", "Stage", "Details"]} filters={["Shortlisted", "Interview Scheduled", "Hired"]} rows={companyCandidates(state, jobId).map(candidate => ({ id: candidate.id, status: candidate.stage, search: candidate.name + " " + candidate.stage, cells: [candidate.name, <Badge key="badge" value={candidate.stage} />, "CV, contact and private notes withheld"] }))} /></Card>
  </>;

  const candidates = recruiterCandidates(state, jobId).filter(candidate => section !== "interviews" || candidate.stage === "Interview Scheduled");
  return <>
    <PageHeading title={section === "interviews" ? "Make room for a conversation." : "Give every application attention."} description="Assigned-job sample candidates only. Open a candidate to update sample stages, plan an interview or add a private sample note." />
    <Card title={section === "interviews" ? "Sample interviews" : job ? "Candidates · " + job.title : "Assigned candidates"}>{vacancyFilter}<Records caption="Assigned candidates" headings={["Candidate", "Vacancy", "Stage", "Review"]} filters={section === "interviews" ? [] : [...candidateStages]} rows={candidates.map(candidate => ({ id: candidate.id, status: candidate.stage, search: candidate.name + " " + candidate.stage + " " + state.jobs.find(item => item.id === candidate.jobId)?.title, cells: [candidate.name, state.jobs.find(item => item.id === candidate.jobId)?.title, <Badge key="badge" value={candidate.stage} />, <Link className="desk-link" key="link" href={prefix + "/candidate?id=" + encodeURIComponent(candidate.id) + "&job=" + encodeURIComponent(candidate.jobId)}>Review candidate<span className="sr-only"> {candidate.name}</span> ↗</Link>] }))} /></Card>
  </>;
}

function CandidateQuery() {
  const params = useSearchParams();
  return <CandidateReview key={params.get("id")} id={params.get("id")} recruiter />;
}
