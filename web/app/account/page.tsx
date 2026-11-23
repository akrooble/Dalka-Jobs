import { AccountScreen } from "../../components/frontend/account-screen";
import { LiveApplicantAccount } from "../../components/applicant/account";
export const dynamic = "force-dynamic";
export default function AccountPage() { return process.env.DALKA_WEBSITE_MODE === "live" ? <LiveApplicantAccount section="overview" /> : <AccountScreen section="overview" />; }
