import { AdminScreen } from "../../components/frontend/admin-screen";
import { LiveWorkspace } from "../../components/workspace/live-workspace";
export const dynamic = "force-dynamic";
export default function AdminPage() { return process.env.DALKA_WEBSITE_MODE === "live" ? <LiveWorkspace area="admin" section="overview" /> : <AdminScreen section="overview" />; }
