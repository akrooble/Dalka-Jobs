import { SiteHeader } from "../../../components/site-header";
import Link from "next/link";
import { SiteFooter } from "../../../components/site-footer";
import { AdminScreen } from "../../../components/frontend/admin-screen";
import { JobManager } from "../../../components/jobs/job-manager";
export const dynamic = "force-dynamic";
export const metadata = { title: "Job editor — Dalka Jobs", description: "Save job drafts, inspect protected previews and publish vacancies in local development." };
export default async function JobEditorPage({ searchParams }: { searchParams: Promise<{ id?: string | string[] }> }) {
  if (process.env.DALKA_WEBSITE_MODE !== "live") return <AdminScreen section="job-editor" />;
  const { id } = await searchParams;
  const valid = id === undefined || typeof id === "string" && /^[a-f0-9]{32}$/.test(id);
  return <><SiteHeader active="none" live /><main id="main-content" className="container live-main" tabIndex={-1}><div className="ui-page-heading"><p className="eyebrow">Dalka Jobs / Super admin</p><h1>{id ? "Edit a live vacancy." : "Start with a draft."}</h1></div>{valid ? <JobManager editor id={id as string | undefined} /> : <p>Invalid job ID. <Link href="/admin/jobs">Return to jobs</Link></p>}</main><SiteFooter live /></>;
}
