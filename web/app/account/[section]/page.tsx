import { notFound } from "next/navigation";
import { accountSections } from "../../../lib/frontend-demo";
import { AccountScreen } from "../../../components/frontend/account-screen";
import { LiveApplicantAccount } from "../../../components/applicant/account";
export const dynamic = "force-dynamic";
export default async function AccountSectionPage({ params }: { params: Promise<{ section: string }> }) { const { section } = await params; if (!accountSections.includes(section)) notFound(); return process.env.DALKA_WEBSITE_MODE === "live" ? <LiveApplicantAccount section={section} /> : <AccountScreen section={section} />; }
