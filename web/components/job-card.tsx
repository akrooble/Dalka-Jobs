import type { DemoJob } from "../lib/demo-jobs";
import Link from "next/link";
import { formatJobDate, isClosed } from "../lib/job-detail";

export function JobCard({ job, index }: { job: DemoJob; index: number }) {
  const href = job.slug.startsWith("sample-") ? `/preview-job?id=${job.id}` : `/jobs/${job.slug}`;
  return (
    <article className="job-card" aria-labelledby={`title-${job.id}`}>
      <div className="job-card-top">
        <div className={`employer-mark tone-${job.tone}`} aria-hidden="true">{job.initials}</div>
        <div className="job-card-heading">
          <p className="employer-name">{job.employer}<span className="sample-employer">Sample employer</span></p>
          <h3 id={`title-${job.id}`}><Link href={href}>{job.title}</Link></h3>
        </div>
        <span className="job-index" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
      </div>
      <ul className="job-meta" aria-label="Job information">
        <li><span aria-hidden="true">⌖</span> {job.location}</li>
        <li><span className="meta-dot" aria-hidden="true" />{job.type}</li>
        <li><span className="meta-dot" aria-hidden="true" />{job.arrangement}</li>
        <li className="salary-label">{job.salary || "Salary not specified"}</li>
        <li className="posted-label">Posted {formatJobDate(job.postedAt)}</li>
      </ul>
      <p className="job-summary">{job.summary}</p>
      <div className="job-dates"><span className={isClosed(job) ? "closed-badge" : "deadline-label"}>{isClosed(job) ? "Closed sample" : `Closes ${formatJobDate(job.closesAt)}`}</span><Link href={href} className="detail-link">View job <span aria-hidden="true">↗</span><span className="sr-only">: {job.title}</span></Link></div>
      <div className="job-card-bottom">
        <span className="category-tag">{job.category}</span>
        <span className="apply-method">{job.applicationMethod}<span className="preview-only"> · Preview only</span></span>
      </div>
    </article>
  );
}
