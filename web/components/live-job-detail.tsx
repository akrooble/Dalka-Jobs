import Link from "next/link";
import { notFound } from "next/navigation";
import type { PublicJob } from "../lib/api/client";
import { SiteHeader } from "./site-header";
import { SiteFooter } from "./site-footer";
import { Feedback } from "./ui/feedback";
import { localApiOrigin } from "../lib/api/origin";

function date(value: string) { return new Date(value).toLocaleString("en-GB", { timeZone: "Africa/Mogadishu", dateStyle: "medium", timeStyle: "short" }); }
export async function LiveJobDetail({ slug }: { slug: string }) {
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug) || slug.length > 180) notFound();
  let job: PublicJob;
  try {
    const response = await fetch(`${localApiOrigin()}/api/v1/public/jobs/${encodeURIComponent(slug)}`, { cache: "no-store", redirect: "error", signal: AbortSignal.timeout(10000) });
    if (response.status === 404) notFound();
    if (!response.ok) throw new Error("unavailable");
    job = await response.json();
  } catch (e) { if (e instanceof Error && e.message.startsWith("NEXT_HTTP_ERROR_FALLBACK;404")) throw e; return <><SiteHeader active="none" live /><main className="container live-main" id="main-content"><Feedback title="This vacancy could not be loaded" tone="danger"><p>Please try again shortly.</p><Link href="/">Back to vacancies →</Link></Feedback></main><SiteFooter live /></>; }
  const href = job.applicationMethod === "Email" ? `mailto:${job.destination}` : job.destination;
  return <><SiteHeader active="none" live /><main className="job-detail-main" id="main-content" tabIndex={-1}><div className="container"><Link className="back-link" href="/#jobs">← Back to vacancies</Link><div className="job-detail-heading"><div><p className="eyebrow">{job.employer}</p><h1>{job.title}</h1><ul className="detail-meta"><li>{job.location}</li><li>{job.jobType}</li><li>{job.arrangement}</li></ul></div></div><div className="job-detail-layout"><section className="job-detail-content"><h2>About the role</h2><p className="live-description">{job.description}</p><h2>About the employer</h2><p>{job.employer} · {job.employerType}</p></section><aside className="job-detail-sidebar"><div className="job-facts"><h2>At a glance</h2><dl><div><dt>Category</dt><dd>{job.category}</dd></div><div><dt>Posted</dt><dd>{date(job.postedAt)}</dd></div><div><dt>Closing</dt><dd>{date(job.closesAt)} (UTC+3)</dd></div></dl></div><section className="application-panel"><h2>{job.applicationMethod === "Dalka recruitment" ? "On-site recruitment" : `Apply via ${job.applicationMethod.toLowerCase()}`}</h2>{job.applicationMethod === "Dalka recruitment" ? <p>On-site applications are not available yet. Private document, consent and recruitment-authority services must be ready before intake opens.</p> : job.destination ? <><p>Your application goes directly to the employer. Opening this link does not confirm that an application was submitted.</p><a className="button button-primary" href={href} rel="noopener noreferrer">Continue to employer →</a></> : <p>The application destination is unavailable. Please check back later.</p>}</section></aside></div></div></main><SiteFooter live /></>;
}
