# Applicant profile and deletion — local synthetic development

23 November 2026: local roadmap authorization covers recommended C/D/E source. FE-09 remains partially implemented until private CV validation/scanning/storage and lifecycle acceptance exist. No real intake, external provider, purge of existing data or backup operation is enabled.

## Schema and compatibility

Owner-applied additive migration000005 creates own-data profiles and minimal deletion receipts, backfilling only active applicant identities from000004. The subsequent team slice adds000006; current server requires clean schema6, and earlier binaries refuse the newer version. Profile migration does not alter privileged accounts/jobs/company/list contracts. Down source destroys new profile/deletion evidence and is untested/unauthorized. Use reviewed forward repair or owner backup recovery; no automatic migration, down/drop/reset/adoption.

## Own profile

GET/PATCH `/api/v1/applicant/profile` derives owner from a valid applicant session; full-MFA team sessions cannot act as applicants. DTO contains name, verified loginEmail (read-only), contactEmail, phone, optional locationId/bio, version and updatedAt. PATCH replaces editable fields with required expected version; stale versions return409. Name 2–100 Unicode characters without controls; email ASCII/max254 and synthetic `.invalid` only in local mode; phone blank or bounded international `+` digits (7–15); at least one contact. Bio max2000, safe plain text; active location kind required. No identity-email replacement/role linking. Names/details must be fictional in this local environment.

## Deletion

POST `/applicant/deletion/request` requires current applicant session/CSRF and an empty JSON object, uses current verified login email and sends a fresh purpose-bound six-digit challenge through the explicit synthetic terminal adapter. Challenge ten minutes, five failures, resend60s and durable identity/peer send/verify budgets shared with sign-in. POST `/applicant/deletion/confirm` requires `{challengeId,code,confirmed:true}` and the same applicant session/CSRF. Identity lock precedes applicant/session/challenge locks, serializing sign-in/deletion races. Challenge from sign-in/another identity/session never works.

Confirmation atomically deletes profile and all identity challenges, revokes all applicant sessions, removes identity email, marks a tombstone and persists an ID/time deletion receipt. Current source has no uploaded CV/application bytes, so there are no files or submitted records to purge; this is explicitly not proof of future file/application retention. Receipt completes in the same transaction only because this source cannot accept files/applications. Before enabling those routes, deletion must integrate durable purge intents and complete only after private profile bytes are removed. Restores must reapply tombstones; backup35-day and six-calendar-month submitted-record retention acceptance remain outstanding.

CV GET/POST/remove are explicitly503 `private_files_unavailable`; no browser file is collected or transmitted by this UI. An absent scanner/storage adapter is never treated as a clean file. Source interfaces/hostile-file lifecycle and owner-run crash/restore tests are still required before FE-09 completion or FE-10 activation.

## Verification

Use established offline API/frontend checks, integration compilation and owner-run disposable integration for profile versions, cross-role/session denial, purpose-bound fresh deletion, revocation and matching privileged identity preservation. Browser reload/conflict/deletion acceptance remains separate. Never test with real applicant details or count compilation as persistence evidence.
