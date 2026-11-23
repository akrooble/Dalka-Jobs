# Live job authoring contract — FE-06

Local source implementation, 10 November 2026. Real database/migration/recovery and browser acceptance remain unverified. Extends [first-five contracts](first-five.md), retaining the same session/Origin/CSRF/no-store/error/JSON rules. No public launch or applicant intake is authorized.

## Access and endpoints

All endpoints require an active full-MFA super admin; role headers never grant authority. Recruiter/company-admin/anonymous/pending/revoked sessions cannot read drafts, preview records or write jobs.

- `GET /api/v1/admin/jobs?q=&status=&companyId=&page=1&pageSize=20` searches literal title/company text, filters status/company and returns `{items,total,page,pageSize}`. Maximum page size 50, maximum page 100000, q at most 160 Unicode characters, status draft/published/archived. Unknown/repeated keys fail 422. Summary items: id, slug, title, employer, status, version, closesAt; ordered updatedAt/id descending.
- `POST /api/v1/admin/jobs` creates **draft only**, returns 201 with the saved detail.
- `GET /api/v1/admin/jobs/{id}` returns saved detail for protected preview/edit; unknown/malformed ID returns 404. No public preview token or unpublished public URL.
- `PATCH /api/v1/admin/jobs/{id}` replaces all editable fields with a positive `version` and target status; missing record 404, stale version 409. Company association is immutable after creation. No delete endpoint.

## Write object

```json
{
  "companyId": "32-character-lowercase-hex-id",
  "title": "Programme officer",
  "description": "Plain-text role description",
  "locationId": "loc-mogadishu",
  "categoryId": "cat-ngo",
  "jobType": "Full-time",
  "arrangement": "On-site",
  "applicationMethod": "Email",
  "destination": "jobs@example.invalid",
  "closesAt": "2026-11-30T17:00:00+03:00",
  "status": "draft"
}
```

Use a real existing company ID in an owner-approved local run; the placeholder above is explanatory. POST omits version (or uses zero); PATCH adds current positive version. All listed fields are required except the empty destination for Dalka recruitment. Null/omitted text fields fail required-field validation. Salary is omitted by owner decision for this slice; range/currency rules remain future work.

Title is trimmed, 3–160 Unicode characters; description trimmed, 1–20,000; destination trimmed, at most 2,048. Control characters are rejected except description newline/tab. Company and list references must exist with the correct kind; reference locks and foreign keys preserve integrity. Job types: Full-time, Contract, Part-time. Arrangements: On-site, Hybrid, Remote.

closesAt is an RFC3339 instant with explicit offset and minute precision (seconds 00, no fraction), years 2000–9999. The editor always presents/reads Somalia time UTC+3, regardless of browser timezone. A published job must close strictly after the request snapshot; equality is expired. Past drafts/archives can still be edited and later extended before republication.

Four configurations: Company website (public DNS-style HTTPS URL, no IP/private suffix/userinfo/port/fragment), Email (one plain mailbox), WhatsApp (`https://wa.me/` plus 7–15 international digits, no query/fragment), Dalka recruitment (empty destination). The last may be saved only as draft/archived: publication is refused until separately approved authority/intake/privacy services exist. Website validation rejects browser-normalized shortened/octal/hex/integer IPv4 and trailing-dot private-host forms; it does not resolve DNS or fetch URLs. External clicks never establish application completion.

POST generates ID and stable `job-<id>` slug. First publication sets postedAt; later edit/archive/republication preserves it and the slug. Draft creation fills the existing non-null postedAt with creation time. Every successful edit increments version/updatedAt. Statuses may change through the same validated PATCH; there is no unpaid-invoice gate.

Detail includes existing public fields plus companyId/status/version/updatedAt. Descriptions are escaped text. Public payload shape stays unchanged and includes only published/unexpired jobs; expired detail remains 404 independently of archiving. Automatic background archival is still future work; this feature provides manual archival and reuses synchronous public expiry.

## Schema and verification limits

Owner applies migration 000002 after 000001 using the [existing setup guide](../development/live-first-five.md). It adds version, updated_at and nullable first_published_at; published/archived existing rows conservatively backfill first_published_at from preserved posted_at. Original schema/content/URLs remain. Subsequent [FE-07 managed lists](managed-lists.md) adds migration000003: the current server requires clean schema **3**, and job references must be active. No migration runs at startup.

Do not execute down/drop/reset to unblock a run. Prior schema-1 binary also refuses schema 2; fallback requires reviewed compatibility work/forward fix or owner-created backup recovery, not an automatic downgrade. The down file loses the three new metadata columns and is only for separately authorized disposable recovery testing. Runtime migration/recovery verification remains outstanding.

Offline validation and synthetic HTTP tests do not prove persistence. The owner-only existing integration suite now includes job draft/publish/archive, role/MFA/CSRF denial, correct-kind references, fixed company, concurrent stale edits, stable URL/postedAt and public visibility. It still requires an empty migrated `dalka_jobs_check` database and explicit opt-in. The agent compiled it without execution; do not treat that as a database pass. Follow manual acceptance for actual browser/reload/conflict/keyboard evidence.
