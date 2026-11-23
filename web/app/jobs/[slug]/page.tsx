import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { demoJobs } from "../../../lib/demo-jobs";
import { getJobBySlug } from "../../../lib/job-detail";
import { LiveJobDetail } from "../../../components/live-job-detail";
import { PublicJobDetail } from "../../../components/frontend/public-job-detail";

type JobPageProps = { params: Promise<{ slug: string }> };
export const dynamicParams = true;
export const dynamic = "force-dynamic";
export function generateStaticParams() { return demoJobs.map(job => ({ slug: job.slug })); }
export async function generateMetadata({ params }: JobPageProps): Promise<Metadata> {
  if (process.env.DALKA_WEBSITE_MODE === "live") return { title: "Vacancy — Dalka Jobs", description: "Review a published vacancy on Dalka Jobs." };
  const job = getJobBySlug((await params).slug);
  return { title: job ? `${job.title} — Dalka Jobs sample` : "Job not found — Dalka Jobs", description: job ? `Fictional example: ${job.title} at ${job.employer}. Applications are not open.` : "This sample job could not be found." };
}
export default async function JobPage({ params }: JobPageProps) {
  const { slug } = await params;
  if (process.env.DALKA_WEBSITE_MODE === "live") return <LiveJobDetail slug={slug} />;
  if (!getJobBySlug(slug)) notFound();
  return <PublicJobDetail slug={slug} />;
}
