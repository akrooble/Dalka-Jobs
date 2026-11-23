# Applicant authentication — local synthetic development

23 November 2026: owner authorized the full local roadmap. Recommended proposal A/B is now implemented for synthetic local source testing; runtime acceptance remains separate. No production provider or real policy is selected. Real intake stays disabled.

## Schema and recovery

Migration 000004 adds separate applicant identities/challenges and an exclusive applicant session FK/phase. Existing accounts, passwords, TOTP, jobs and managed lists are preserved. Existing session rows satisfy the new mutually exclusive subject constraint. Subsequent profile/team slices add000005–000006; the current new server requires clean schema6, and earlier binaries refuse newer schema versions. Owner applies additive `up` using the existing guide; no migration/setup/database command is run by the agent. Review real existing constraint names before migration if the owner has changed schema manually; do not force/adopt it. Down source deletes applicant auth state and is untested and unauthorized. Prefer a reviewed forward repair or owner backup recovery. No down/drop/reset command is added.

## Local activation and contracts

API accepts only `DALKA_APPLICANT_MODE=development` (or unset/disabled). In development mode the operator terminal adapter accepts only valid ASCII email identities ending in `.invalid`, with acknowledgement version `local-synthetic-v1`. It never sends email. Unset mode fails closed; any other configured mode prevents server startup. Production and phone delivery remain unavailable. The fictional-testing acknowledgement is not approved public privacy text. Never enter real personal details.

GET `/api/v1/auth/applicant/options` reports availability/synthetic-only/version. POST `/auth/applicant/request` accepts `{email,privacyVersion,accepted:true}` from an anonymous session with exact Origin/CSRF. Successful committed response is 202 with challenge ID, expiry and resend delay; never a code or account-existence flag. Local terminal delivery is accepted before commit; commit failure returns an error and the printed code is unusable. No external provider call is made under transaction locks. POST `/auth/applicant/verify` accepts `{challengeId,code}`, bound to the originating anonymous session, and returns a rotated `{state:"applicant",subject:"applicant",csrfToken}` session. Applicant identity has no privileged account/role linkage, including matching emails. Sign out explicitly before switching subjects.

Six digits; ten-minute exact-boundary expiry; five challenge failures; 60-second resend floor invalidating all prior identity sign-in challenges. Persistent five sends/identity/hour and twenty/peer/hour, plus twenty verifications/identity/hour and twenty/peer/hour, including rejected attempts. Requests lock the identity limiter before reading resend state, and session/challenge locks serialize replay. A successfully accepted request extends the anonymous session to at least challenge expiry (resolving the existing five-minute anonymous TTL). Successful verification revokes that originating session and all identity challenges; applicant sessions last seven days absolute and 24 hours idle. Existing privileged eight-hour/30-minute and anonymous behavior is preserved.

The existing cookie, exact Origin, synchronizer CSRF, no-store and bounded JSON boundary remain. Logout revokes applicant sessions too. All live account routes use the live session boundary; unavailable profile/intake/tracker services never fall back to sample results. Sample mode remains explicitly fictional. OTP/challenge cleanup is bounded during anonymous session creation; no application or user-data retention worker is implied.

## Verification

Offline tests cover strict identity syntax, purpose/session/challenge/key binding, development sender refusal, session shape/role rejection and route transport. Owner-only disposable integration tests cover actual persisted limits, replay/expiry, matching-privileged-email isolation and session rotation. Compilation is not execution. Database/browser acceptance and actual production delivery are not claimed.
