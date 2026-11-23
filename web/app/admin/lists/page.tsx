import { SiteHeader } from "../../../components/site-header";
import { SiteFooter } from "../../../components/site-footer";
import { AdminScreen } from "../../../components/frontend/admin-screen";
import { ListManager } from "../../../components/lists/list-manager";
export const dynamic = "force-dynamic";
export const metadata = { title: "Categories and locations — Dalka Jobs", description: "Manage job categories and locations in local development." };
export default function ListsPage() {
  if (process.env.DALKA_WEBSITE_MODE !== "live") return <AdminScreen section="lists" />;
  return <><SiteHeader active="none" live /><main id="main-content" className="container live-main" tabIndex={-1}><div className="ui-page-heading"><p className="eyebrow">Dalka Jobs / Super admin</p><h1>Keep job choices clear.</h1><p>Manage saved category and location labels.</p></div><ListManager /></main><SiteFooter live /></>;
}
