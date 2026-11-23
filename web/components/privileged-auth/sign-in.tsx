"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { api, ApiError, errorMessage, type Session } from "../../lib/api/client";
import { getSession, sessionAction } from "../../lib/session/client";
import { TextField } from "../ui/fields";
import { Button } from "../ui/button";
import { Feedback } from "../ui/feedback";
import { StatePanel } from "../ui/state-panel";

export function PrivilegedSignIn() {
  const [session, setSession] = useState<Session | null>(null);
  const [email, setEmail] = useState(""); const [password, setPassword] = useState(""); const [code, setCode] = useState("");
  const [enrollment, setEnrollment] = useState<{ secret: string; uri: string } | null>(null);
  const [recovery, setRecovery] = useState(false); const [busy, setBusy] = useState(false); const [error, setError] = useState("");
  useEffect(() => { const abort = new AbortController(); getSession(abort.signal).then(setSession).catch((e) => { if (e.name !== "AbortError") setError(errorMessage(e)); }); return () => abort.abort(); }, []);
  async function refresh() { setBusy(true); setError(""); try { setSession(await getSession()); setEnrollment(null); setCode(""); } catch (e) { setError(errorMessage(e)); } finally { setBusy(false); } }
  async function handleFailure(e: unknown) {
    setError(errorMessage(e));
    if (e instanceof ApiError && [401, 403].includes(e.status) && e.code !== "invalid_credentials") {
      setSession(null); setEnrollment(null); setCode(""); setPassword(""); setRecovery(false);
      try { setSession(await getSession()); } catch { /* Retry session remains visible. */ }
    }
  }
  async function act(event: FormEvent) {
    event.preventDefault(); if (!session || busy) return; setBusy(true); setError("");
    try {
      const next = session.state === "anonymous" ? await sessionAction("/auth/password", session, { email, password }) : await sessionAction(recovery ? "/auth/recovery" : "/auth/totp/confirm", session, { code });
      setSession(next); setPassword(""); setCode(""); setEnrollment(null); setRecovery(false);
    } catch (e) { setPassword(""); await handleFailure(e); }
    finally { setBusy(false); }
  }
  async function enroll() { if (!session) return; setBusy(true); setError(""); try { setEnrollment(await api("/auth/totp/enrollment", { method: "POST", csrf: session.csrfToken })); } catch (e) { await handleFailure(e); } finally { setBusy(false); } }
  async function logout() { if (!session) return; setBusy(true); setError(""); try { await api("/auth/logout", { method: "POST", csrf: session.csrfToken }); setSession(await getSession()); setEnrollment(null); setCode(""); setRecovery(false); } catch (e) { await handleFailure(e); } finally { setBusy(false); } }
  if (session?.state === "applicant") return <section className="ui-card proto-card"><h2>Applicant session active</h2><p>Sign out of your applicant account before signing in to a team workspace.</p>{error && <Feedback tone="danger" title="Unable to continue" announce><p>{error}</p></Feedback>}<Button loading={busy} onClick={logout}>Sign out</Button> <Link href="/account">Return to applicant account</Link></section>;
  return <div className="proto-two-column"><section className="ui-card proto-card"><h2>{session?.state === "full" ? "You’re signed in" : session?.state === "pending" ? "Verify your authenticator" : "Sign in to your workspace"}</h2>
    {error && <Feedback tone="danger" title="Unable to continue" announce><p>{error}</p></Feedback>}
    {!session && <StatePanel variant={error ? "error" : "loading"} title={error ? "Session unavailable" : "Checking your session"}><p>A live session is required before signing in.</p>{error && <Button loading={busy} onClick={refresh}>Retry session</Button>}</StatePanel>}
    {session?.state === "full" ? <><p>Password and authenticator verification are complete.</p>{session.role === "super_admin" ? <Link className="button button-primary" href="/admin/companies">Manage companies →</Link> : <Feedback title="Signed in securely"><p>Your {session.role === "recruiter" ? "recruiter" : "company-admin"} workspace belongs to a later delivery task. Company management is restricted to super admins.</p></Feedback>}
      {session.recoveryCodes && <div className="live-recovery"><h3>Save your recovery codes now</h3><p>Each code works once. Store them securely. They are shown only once and disappear when you leave this page.</p><ul>{session.recoveryCodes.map((value) => <li key={value}><code>{value}</code></li>)}</ul><Button variant="secondary" onClick={() => setSession((previous) => previous ? { ...previous, recoveryCodes: undefined } : null)}>I have saved these codes</Button></div>}
      <Button variant="secondary" loading={busy} onClick={logout}>Sign out</Button></> : session && <>
      {session.state === "pending" && session.enrollmentRequired && !enrollment && <><p>Set up an authenticator before this account can access protected features.</p><Button loading={busy} onClick={enroll}>Set up authenticator</Button></>}
      {enrollment && <div className="live-recovery"><h3>Add this account to your authenticator</h3><p>Use this setup key with SHA1, six digits and a 30-second period. Keep it private.</p><code>{enrollment.secret}</code><p>Account: {email || "your privileged account"} · Issuer: Dalka Jobs</p></div>}
      <form onSubmit={act} className="live-auth-form">
        {session.state === "anonymous" ? <><TextField id="staff-email" label="Email address" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" maxLength={254} required disabled={busy} /><TextField id="staff-password" label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" maxLength={256} required disabled={busy} /></> : <TextField id="staff-code" label={recovery ? "One-use recovery code" : "Authenticator code"} value={code} onChange={(e) => setCode(e.target.value)} inputMode={recovery ? "text" : "numeric"} autoComplete="off" minLength={recovery ? 32 : 6} maxLength={recovery ? 32 : 6} pattern={recovery ? "[a-f0-9]{32}" : "[0-9]{6}"} required disabled={busy || Boolean(session.enrollmentRequired && !enrollment)} />}
        <Button type="submit" loading={busy} disabled={session.state === "pending" && Boolean(session.enrollmentRequired && !enrollment)}>{session.state === "anonymous" ? "Continue" : recovery ? "Recover and re-enroll" : "Verify authenticator"}</Button>
      </form>
      {session.state === "pending" && !session.enrollmentRequired && <Button variant="secondary" disabled={busy} onClick={() => { setRecovery(!recovery); setCode(""); }}>{recovery ? "Use authenticator instead" : "Use a recovery code"}</Button>}
      {session.state === "pending" && <Button variant="secondary" loading={busy} onClick={logout}>Cancel sign-in</Button>}
    </>}
  </section><section className="ui-card proto-card"><h2>Protected team access</h2><p>Super admins, recruiters and company admins sign in with a password and an authenticator. Applicant email codes cannot grant team access.</p><p>Lost every sign-in factor? Contact the authorised local operator. There is no public password or MFA-reset shortcut.</p><Link className="proto-text-link" href="/">Back to Dalka Jobs →</Link></section></div>;
}
