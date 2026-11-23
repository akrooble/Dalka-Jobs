import { SiteHeader } from "../../../components/site-header";
import { SiteFooter } from "../../../components/site-footer";
import { PrivilegedSignIn } from "../../../components/privileged-auth/sign-in";
import { AccessPage } from "../../../components/frontend/access-page";
export const dynamic = "force-dynamic";
export default function SignInPage() { if (process.env.DALKA_WEBSITE_MODE !== "live") return <><SiteHeader active="none" /><main id="main-content"><AccessPage /></main><SiteFooter /></>; return <><SiteHeader active="none" live /><main className="container live-main" id="main-content" tabIndex={-1}><div className="ui-page-heading"><p className="eyebrow">Dalka Jobs / Team workspace</p><h1>A secure start.</h1><p>Sign in to the workspace your role permits.</p></div><PrivilegedSignIn /></main><SiteFooter live /></>; }
