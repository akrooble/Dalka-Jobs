import { SiteHeader } from "../../../components/site-header";
import { SiteFooter } from "../../../components/site-footer";
import { CompanyManager } from "../../../components/companies/company-manager";
import { AdminScreen } from "../../../components/frontend/admin-screen";
import Link from "next/link";
export const dynamic = "force-dynamic";
export default function CompaniesPage() { if (process.env.DALKA_WEBSITE_MODE !== "live") return <AdminScreen section="companies" />; return <><SiteHeader active="none" /><main id="main-content" className="container live-main" tabIndex={-1}><div className="ui-page-heading"><p className="eyebrow">Dalka Jobs / Super admin</p><h1>The organisations behind the opportunities.</h1><p>Create and maintain company records and inspect their associated jobs.</p><Link className="proto-text-link" href="/admin/jobs">Manage live jobs →</Link></div><CompanyManager /></main><SiteFooter /></>; }
