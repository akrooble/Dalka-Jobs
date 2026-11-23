# First-five API contract

Approved scope: TASK-001-FE-01-05-LIVE.md, 4 November 2026. Implementation is local development only. Runtime database and browser acceptance are still pending; this document does not certify deployment readiness.

Go owns identity, sessions, MFA, authorisation, validation and PostgreSQL access. Browser requests use `/api/v1` on the website origin. Next forwards only Origin, Content-Type, X-CSRF-Token and a single canonical `dalka_session` cookie to fixed loopback hostname and configured port (default `http://127.0.0.1:8080`). It returns only that cookie name. Client role/identity headers and cookies for other localhost applications are discarded. Private/public API responses currently all use `Cache-Control: no-store`.

## Configuration and types

Website origin is exactly `DALKA_WEB_ORIGIN`, default `http://127.0.0.1:3000`, including port. Local API binds only `127.0.0.1` with `DALKA_API_PORT` (default 8080); canonical integer ports 1-65535 are accepted. Port 8080 is occupied on the current machine, so the handoff uses 8081 without modifying that existing service. Both Go and Next require the same explicit port. HTTP loopback is the only supported mode in this increment; nonloopback/prod configuration is refused rather than weakening Secure-cookie/TLS requirements. API reads the existing strict provisioning `.env` from the repository root and an owner-private raw 32-byte key at the absolute `DALKA_KEY_FILE` path. No second dotenv format/parser is introduced.

JSON writes require `application/json`, a single object, no unknown/duplicate keys or trailing JSON, and at most 65,536 bytes. IDs are server-generated 32-character lowercase hexadecimal values. Timestamps are RFC3339 UTC values, displayed in Africa/Mogadishu. Company versions are positive integers. All query values are parameterised; unknown/repeated filter keys, invalid enum/list values or unbounded page sizes fail validation.

Errors: `{ "error": { "code": "stable_code", "message": "safe message" } }`. Codes include `validation_failed` (422), `unsupported_media_type` (415), `request_too_large` (413), `origin_rejected`/`csrf_rejected`/`forbidden` (403), `invalid_credentials` (401), `not_found` (404), `conflict` (409), `rate_limited` (429), and `service_unavailable` (503). No internal database or credential details are returned. Credential failures commit persistent attempt counters; internal transaction failures roll back.

## Sessions and authentication

1. `GET /session` returns `{state, csrfToken}` and establishes/reuses an anonymous host-only HttpOnly SameSite=Lax cookie. Anonymous state lasts five minutes and has no role or account. CSRF tokens are independent random 32-byte values represented as hex; only session-token hashes are stored. Responses are not cached.
2. Every write, including initial login, must include the matching `X-CSRF-Token`, session cookie and exact configured `Origin`. There is no login CSRF exemption or permissive CORS. Anonymous session issuance is capped at 30/minute per network peer; the API also caps concurrent requests at 16. At loopback the Next proxy is one peer, so this is intentionally a shared local limit, not a production client-IP scheme.
3. `POST /auth/password` takes `{email,password}`. Correct credentials rotate the anonymous cookie/token into a five-minute `pending` session, returning `enrollmentRequired`. A password alone grants no protected access. Generic failure does not disclose account existence; account limits are five failed attempts per 15 minutes, with a separate peer limit of 30 password attempts per 15 minutes.
4. `POST /auth/totp/enrollment` with `{}` returns `{secret,uri}` only for a password-verified pending account without an enrolled authenticator. It reuses that pending session's encrypted secret until confirmation and never overwrites an enrolled secret.
5. `POST /auth/totp/confirm` takes `{code}`. TOTP is six-digit RFC6238 SHA1, period 30 seconds, at most one step of clock tolerance, with persistent one-use counter enforcement. Each pending session permits five attempts. Success rotates into `full`, returns role, and at enrollment returns ten one-use recovery codes once. Full sessions have eight-hour absolute and 30-minute idle limits. Accounts are locked before sessions, including recovery/reset, so revocation shares a consistent lock order.
6. `POST /auth/recovery` takes `{code}` in a recently password-verified pending session. Recovery codes have 128 random bits; only hashes are stored. It consumes a code, revokes prior sessions/codes, removes the old authenticator and requires fresh enrollment. It does not grant full access. Account and peer limits persist across process restarts.
7. `POST /auth/logout` takes `{}` and revokes/clears a live session. A persisted expired session requires its matching CSRF token before deletion; a missing/revoked cookie may be expired without a privileged mutation under exact Origin. The frontend refreshes stale sessions for login, enrollment and logout instead of trapping the user in an expired challenge.

`GET /session` returns role only after full MFA. Every protected request rechecks active account/role; company write permission is never inferred from UI navigation. Sessions, secret enrollment, recovery codes and CSRF values stay out of logs and browser storage. TOTP secrets use AES-256-GCM with unique nonces and account/version associated data. Passwords use the approved PBKDF2-SHA256 work factor of 600,000 with random per-password salts. The key file is protected separately and never generated or read by the agent during setup.

## Public endpoints

- `GET /health`: minimal liveness, no environment or credentials.
- `GET /public/lists`: `{items:[{id,kind,label}]}`, canonical read-only category/location rows.
- `GET /public/jobs`: filters `q`, `locationId`, `categoryId`, `employerType`, `jobType`, `closingSoon`, `sort`, `page`, `pageSize`. Pages default to 1/20; maximum size 50. Results `{items,total,page,pageSize}`. Keywords require all words across title/employer; closingSoon means next 168 hours. Sort `newest` uses postedAt/id descending; `closing` uses closesAt ascending/id descending.
- `GET /public/jobs/{slug}`: one published job with company/list projection and validated destination. Unknown/draft/archived/expired is 404. Exact deadline equality is expired; the Go request snapshot is authoritative. Plaintext descriptions are escaped by React, never interpreted as HTML.

Job fields: id, slug, title, description, employer, employerType, locationId/location, categoryId/category, jobType, arrangement, applicationMethod, destination, postedAt, closesAt. Invalid destinations are withheld. Company websites require HTTPS and reject IP/private-host conventions/userinfo, email accepts one literal mailbox without headers, WhatsApp uses a canonical HTTPS wa.me telephone path. No server-side fetching of destinations. On-site recruitment still has no intake endpoint, and external clicks never represent accepted applications.

The local site remains noindex and emits no JobPosting data. Google requires crawlable, accurate eligible postings; no public origin/launch or complete production eligibility has been approved. [Official Google requirements](https://developers.google.com/search/docs/appearance/structured-data/job-posting) were reviewed; local implementation does not claim SEO/launch acceptance.

## Company endpoints

All company endpoints require a current full-MFA super-admin session. Recruiters/company admins, pending/revoked/expired sessions and altered client role headers cannot authorise them.

- `GET /admin/companies?q=&page=1&pageSize=20`: case-insensitive literal name search, ordered by lower(name)/id.
- `POST /admin/companies`: `{name,employerType}`, returning persisted company with 201.
- `PATCH /admin/companies/{id}`: `{name,employerType,version}`, returning incremented persisted version. Stale version or case-insensitive duplicate name returns 409; missing ID 404.
- `GET /admin/companies/{id}?page=1&pageSize=20`: `{company,jobs:{items,total,page,pageSize}}`; job associations include only id/title/status for super-admin inspection, no applicant data.

Company: `{id,name,employerType,version,createdAt,updatedAt}`. Name is trimmed, 2–160 Unicode characters, without control line breaks; types are Private company, NGO, Government. Company names do not establish verification or recruitment authority. Deletion, merging, memberships, job authoring and list editing are outside this increment.
