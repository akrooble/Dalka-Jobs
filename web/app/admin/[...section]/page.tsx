import { notFound } from "next/navigation";
import { adminSections, extraAdminSections } from "../../../lib/frontend-demo";
import { AdminScreen } from "../../../components/frontend/admin-screen";
import { LiveWorkspace } from "../../../components/workspace/live-workspace";
export const dynamic = "force-dynamic";
export default async function AdminSectionPage({ params }: { params: Promise<{ section: string[] }> }) {
  const { section } = await params;
  if (section.length !== 1 || ![...adminSections.map(s => s[0]), ...extraAdminSections].includes(section[0])) notFound();
  return process.env.DALKA_WEBSITE_MODE === "live" ? <LiveWorkspace area="admin" section={section[0]} /> : <AdminScreen section={section[0]} />;
}
