import { SiteHeader } from "../../../components/site-header";
import { SiteFooter } from "../../../components/site-footer";
import { AdminScreen } from "../../../components/frontend/admin-screen";
import { JobManager } from "../../../components/jobs/job-manager";
export const dynamic = "force-dynamic";
export const metadata = { title: "Manage jobs — Dalka Jobs", description: "Create drafts, preview and manage Dalka Jobs vacancies in local development." };
export default function JobsPage() {
  if (process.env.DALKA_WEBSITE_MODE !== "live") return <AdminScreen section="jobs" />;
  return <><SiteHeader active="none" live /><main id="main-content" className="container live-main" tabIndex={-1}><div className="ui-page-heading"><p className="eyebrow">Dalka Jobs / Super admin</p><h1>Manage live vacancies.</h1></div><JobManager /></main><SiteFooter live /></>;
}
