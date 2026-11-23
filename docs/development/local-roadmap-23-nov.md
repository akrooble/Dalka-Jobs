# Resume the locally authorized roadmap — 23 November 2026

See [execution evidence](../../tasks/specs/TASK-001-ALL-LOCAL-log.md), [independent review](../../tasks/specs/TASK-001-ALL-LOCAL-review.md) and [remaining decisions](../api/remaining-contracts-proposal.md). The owner requested all twenty tasks. Only the bounded source additions below are implemented; full roadmap acceptance remains BLOCKED.

## New local source

- FE-08 synthetic applicant sign-in: development terminal codes for `.invalid` identities, purpose/session/identity-bound digests, persisted limits, token rotation, isolated applicant sessions and protected dynamic account routes.
- FE-09 partial: own profile editing with versions/active locations and fresh-code deletion of profile/identity/sessions. No files or applications can be accepted; private file and submitted-record lifecycle remain unimplemented.
- FE-13 partial: existing team directory, protected owner, account activation/session revocation and versioned recruiter assignments. Provisioning remains the existing owner CLI; invitations/membership changes are not implemented.
- FE-16/17 partial: current-assignment/own-company job reads only. Candidate/workflow/CV/contact services are not implemented.
- FE-19 partial: actual overview counts and minimal recent access/assignment activity. Live settings are not implemented.
- All remaining live admin/role routes now use session/role guards and truthful unavailable state. Sample mode remains fictional and separate.

## Owner-run startup prerequisites

Follow the existing [local setup guide](live-first-five.md) for configuration, protected key, additive migrations, bootstrap and live website. The new server requires clean schema **6**, not the guide's historical schema3. New additive sources000004–000006 preserve earlier users/jobs/lists and add applicant identity/profile and team operations. No agent DB/setup/migration/key/bootstrap command executed. Review [auth recovery](../api/applicant-auth.md), [profile recovery](../api/applicant-profile.md) and [operations recovery](../api/team-operations.md) before applying. No migration down/drop/reset/adoption is authorized; actual migration/recovery evidence is still missing.

For **synthetic local applicant testing only**, the API operator may set `DALKA_APPLICANT_MODE=development` in the API terminal before starting the server. Unset/disabled mode accepts no applicant codes; unsupported modes refuse startup. Only `.invalid` ASCII mailboxes and the reserved `local-synthetic-v1` fictional acknowledgement are accepted. Codes appear only in that explicitly selected operator terminal; no email is sent. Keep real details/CVs out of this environment.

Live `/account/sign-in` requests/verifies the local code. Returning from the operator terminal preserves the challenge while revalidating the session. `/account/profile` saves fictional contacts/location/bio or requests a separate fresh deletion code. Sign out before switching between applicant and privileged identities, even when emails match. Deletion permanently removes the synthetic applicant profile/identity and sessions; a privileged account with the same email remains separate. No application/CV completion is implied.

Use `/admin/users` and `/admin/assignments` after full super-admin MFA; recruiter `/workspace/recruiter/jobs` and company `/workspace/company/jobs` use server-scoped persisted reads. Focus/revalidation remounts protected workspace data, so removed assignment scope is fetched again even when the session token is unchanged. Actual browser behavior and persistence require owner-run acceptance; source is not a runtime pass.

## Still unavailable

Real policies/delivery; safe private CV validation/scanning/storage/quarantine/recovery; submitted snapshots/intake/retention/outbox; authority/report/content administration; own application/notification services; recruitment stages/interviews/notes/sharing; candidate company projections; invoices/payments/prices/PDF; live settings; final integrated browser/database/owner acceptance. The [decision register](../api/remaining-contracts-proposal.md) makes their remaining contract choices explicit. No release operation is authorized or performed.
