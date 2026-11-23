"use client";

import Link from "next/link";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { api, ApiError, errorMessage, type Session } from "../../lib/api/client";
import { getSession, sessionAction } from "../../lib/session/client";
import { SessionCoordinator } from "../../lib/session/coordinator";
import { SiteHeader } from "../site-header";
import { SiteFooter } from "../site-footer";
import { MobileNavigation } from "../mobile-navigation";
import { Button } from "../ui/button";
import { TextField } from "../ui/fields";
import { Feedback } from "../ui/feedback";
import { StatePanel } from "../ui/state-panel";
import { LiveApplicantProfile } from "./profile";

type AuthOptions = { enabled: boolean; syntheticOnly: true; privacyVersion: string };
type Challenge = { challengeId: string; resendAfter: number; expiresAt: string };
const links = [["overview", "/account", "Overview"], ["applications", "/account/applications", "My applications"], ["profile", "/account/profile", "Profile"], ["notifications", "/account/notifications", "Updates"]];

export function LiveApplicantAccount({ section }: { section: string }) {
  const [session, setSession] = useState<Session | null>(null);
  const [options, setOptions] = useState<AuthOptions | null>(null);
  const [error, setError] = useState(""); const [busy, setBusy] = useState(false);
  const [checking, setChecking] = useState(true);
  const [coordinator] = useState(() => new SessionCoordinator(getSession,setSession,setChecking,e => setError(errorMessage(e))));
  useEffect(() => {
    coordinator.activate();
    const abort = new AbortController();
    function refresh() { void coordinator.refresh(); }
    refresh();
    api<AuthOptions>("/auth/applicant/options", { signal: abort.signal }).then(value => {
      if (typeof value.enabled !== "boolean" || value.syntheticOnly !== true || value.privacyVersion !== "local-synthetic-v1") throw new Error("Invalid authentication options");
      setOptions(value);
    }).catch(e => { if (e.name !== "AbortError") setError(errorMessage(e)); });
    // Keep the challenge/draft mounted while revalidating on terminal return.
    // Hide and disable private children until the same session is verified;
    // subject/CSRF changes remount them, and errors clear them entirely.
    const visible = () => { if (document.visibilityState === "visible") refresh(); };
    window.addEventListener("focus", refresh); document.addEventListener("visibilitychange", visible);
    return () => { abort.abort(); coordinator.dispose(); window.removeEventListener("focus", refresh); document.removeEventListener("visibilitychange", visible); };
  }, [coordinator]);
  async function retry() { coordinator.clear(); setError(""); setBusy(true); try { const [,o] = await Promise.all([coordinator.refresh(),api<AuthOptions>("/auth/applicant/options")]); setOptions(o); } catch(e) { setError(errorMessage(e)); } finally { setBusy(false); } }
  async function logout() { if (!session) return; setBusy(true); setError(""); const current = session; try { await coordinator.mutate(async () => { setSession(null); await api("/auth/logout", { method: "POST", csrf: current.csrfToken }); return getSession(); }); } catch(e) { setError(errorMessage(e)); } finally { setBusy(false); } }
  const expired = useCallback((e: unknown) => { setError(errorMessage(e)); if (e instanceof ApiError && [401,403].includes(e.status) && e.code !== "invalid_code") { coordinator.clear(); void coordinator.refresh(); } }, [coordinator]);
  async function deleted(remove: () => Promise<void>) { await coordinator.mutate(async () => { await remove(); setSession(null); setError(""); return getSession(); }); }
  async function verified(body: {challengeId: string;code: string}) { if (!session) throw new Error("Session unavailable"); await coordinator.mutate(() => sessionAction("/auth/applicant/verify",session,body)); }
  const active = section.startsWith("application") ? "applications" : section === "profile" ? "profile" : undefined;
  return <><SiteHeader active={active ?? "none"} live /><main id="main-content" tabIndex={-1} className={`applicant-main applicant-${section}`}><div className="container">
    <nav className="applicant-links" aria-label="Applicant workspace">{links.map(([key,href,label]) => <Link key={key} href={href} aria-current={section === key ? "page" : undefined}>{label}</Link>)}{session && session.state !== "anonymous" && <Button variant="secondary" loading={busy} onClick={logout}>Sign out</Button>}</nav>
    {error && <Feedback tone="danger" title="Unable to continue" announce><p>{error}</p></Feedback>}
    {checking && session?.state === "applicant" && <p role="status">Rechecking your session…</p>}
    <div hidden={checking && session?.state === "applicant"} inert={checking && session?.state === "applicant"}>
    {!session || !options ? <StatePanel variant={error ? "error" : "loading"} title={error ? "Account service unavailable" : "Checking your session"}><p>Your account information is shown only after its session is verified.</p>{error && <Button loading={busy} onClick={retry}>Retry</Button>}</StatePanel> : session.state === "pending" || session.state === "full" ? <StatePanel variant="forbidden" title="Team session active"><p>Sign out before switching to an applicant account.</p><Button loading={busy} onClick={logout}>Sign out of team account</Button> <Link href="/admin/sign-in">Team workspace</Link></StatePanel> : session.state === "anonymous" ? <ApplicantSignIn key={session.csrfToken} options={options} session={session} onVerify={verified} onFailure={expired} /> : <ApplicantWorkspace key={session.csrfToken} section={section} session={session} onFailure={expired} onDeleted={deleted} />}
    </div>
  </div></main><SiteFooter live /><MobileNavigation active={active} /></>;
}

function ApplicantWorkspace({ section,session,onFailure,onDeleted }: { section: string; session: Session; onFailure: (e: unknown) => void; onDeleted: (remove: () => Promise<void>) => Promise<void> }) {
  if (section === "profile") return <LiveApplicantProfile session={session} onFailure={onFailure} onDeleted={onDeleted} />;
  return <section className="ui-card proto-card"><p className="eyebrow">Applicant account</p><h1>{section === "sign-in" ? "You’re signed in" : section.startsWith("application") ? "Your applications" : section === "notifications" ? "Your updates" : "Your next chapter"}</h1><Feedback title="Local fictional testing"><p>Use fictional details only. Email delivery and real applicant intake are unavailable.</p></Feedback>{section === "overview" || section === "sign-in" ? <><p>Your applicant session is verified.</p><Link className="button button-primary" href="/account/profile">Complete your profile</Link></> : <StatePanel title="This service is not available yet"><p>Applications and updates will appear here when their live services are ready.</p><Link href="/">Browse jobs</Link></StatePanel>}</section>;
}

function ApplicantSignIn({ options, session, onVerify, onFailure }: { options: AuthOptions; session: Session; onVerify: (body: {challengeId: string;code: string}) => Promise<void>; onFailure: (e: unknown) => void }) {
  const [email,setEmail] = useState(""); const [accepted,setAccepted] = useState(false);
  const [challenge,setChallenge] = useState<Challenge | null>(null); const [code,setCode] = useState("");
  const [busy,setBusy] = useState(false); const [message,setMessage] = useState("");
  const [remaining,setRemaining] = useState(0);
  useEffect(() => { if (remaining <= 0) return; const timer = setTimeout(() => setRemaining(value => Math.max(0,value-1)),1000); return () => clearTimeout(timer); }, [remaining]);
  async function request() { if (busy) return; setBusy(true); setMessage(""); setCode(""); try { const value = await api<Challenge>("/auth/applicant/request",{method:"POST",csrf:session.csrfToken,body:{email,privacyVersion:options.privacyVersion,accepted}}); if (!/^[a-f0-9]{32}$/.test(value.challengeId) || !Number.isFinite(Date.parse(value.expiresAt)) || value.resendAfter !== 60) throw new ApiError(503,"invalid_response","The sign-in request could not be verified. Try again."); setChallenge(value); setRemaining(value.resendAfter); setMessage("A code is available in the local operator terminal. It expires after ten minutes. No email was sent."); } catch(e) { onFailure(e); } finally { setBusy(false); } }
  async function verify(event: FormEvent) { event.preventDefault(); if (!challenge || busy) return; setBusy(true); setMessage(""); try { await onVerify({challengeId:challenge.challengeId,code}); setCode(""); setChallenge(null); } catch(e) { setCode(""); onFailure(e); } finally { setBusy(false); } }
  return <div className="applicant-access"><div className="access-context"><span>Candidate portal</span><span>Local fictional testing</span></div><section className="access-card" aria-labelledby="access-title"><p className="eyebrow">Applicant access</p><h1 id="access-title">Portal Sign In</h1>{!options.enabled ? <StatePanel variant="forbidden" title="Applicant sign-in is unavailable"><p>The local operator has not enabled applicant authentication. No code has been requested or sent.</p><Link href="/">Browse public jobs</Link></StatePanel> : <><p>Use a fictional address ending in .invalid. No email is sent and real applicant intake is disabled.</p>{message && <Feedback title="Code requested" announce><p>{message}</p></Feedback>}{!challenge ? <form className="live-auth-form" onSubmit={e => { e.preventDefault(); void request(); }}><TextField id="applicant-email" label="Fictional email address" type="email" autoComplete="off" maxLength={254} placeholder="applicant@example.invalid" value={email} onChange={e => setEmail(e.target.value)} required disabled={busy} /><label className="desk-checkbox"><input type="checkbox" checked={accepted} onChange={e => setAccepted(e.target.checked)} required disabled={busy} />I am using fictional details for local testing. This is not a real job application.</label><Button type="submit" loading={busy} disabled={!accepted}>Request local code</Button></form> : <form className="live-auth-form" onSubmit={verify}><p>Verifying {email}</p><TextField id="applicant-code" label="Six-digit code" autoComplete="one-time-code" inputMode="numeric" pattern="[0-9]{6}" minLength={6} maxLength={6} value={code} onChange={e => setCode(e.target.value)} required disabled={busy} /><Button type="submit" loading={busy}>Verify code</Button><Button variant="secondary" disabled={busy || remaining > 0} onClick={request}>{remaining > 0 ? `Resend in ${remaining}s` : "Request another local code"}</Button><Button variant="secondary" disabled={busy} onClick={() => { setChallenge(null); setCode(""); setMessage(""); }}>Change email</Button></form>}</>}<p className="access-policy"><Link href="/privacy">Privacy draft</Link> · <Link href="/terms">Terms draft</Link></p></section><div className="access-help"><Link href="/contact">Need sign-in assistance?</Link><Link href="/admin/sign-in">Team sign-in</Link></div></div>;
}
