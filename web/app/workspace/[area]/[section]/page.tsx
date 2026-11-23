import { notFound } from "next/navigation";
import { RoleScreen } from "../../../../components/frontend/role-screen";
import { LiveWorkspace } from "../../../../components/workspace/live-workspace";
export const dynamic = "force-dynamic";
export default async function RolePage({ params, searchParams }: { params: Promise<{ area: string; section: string }>; searchParams: Promise<{ job?: string | string[] }> }) {
  const { area, section } = await params;
  if (area !== "company" && area !== "recruiter") notFound();
  const allowed = area === "company" ? ["jobs", "candidates", "rejected", "progress"] : ["jobs", "candidates", "interviews", "candidate"];
  if (!allowed.includes(section)) notFound();
  const { job } = await searchParams;
  const selectedJob = Array.isArray(job) ? "invalid-selection" : job ?? "";
  return process.env.DALKA_WEBSITE_MODE === "live" ? <LiveWorkspace area={area} section={section} selectedJob={selectedJob} /> : <RoleScreen area={area} section={section} selectedJob={selectedJob} />;
}
