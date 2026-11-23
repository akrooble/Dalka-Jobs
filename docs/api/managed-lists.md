# Managed categories and locations — FE-07

Local source implementation, 10 November 2026. Extends [first-five identity/transport rules](first-five.md) and [job authoring](job-authoring.md). Requires owner-applied schema **3**. Real migration/database/recovery and browser acceptance remain unverified; no production release or applicant intake is authorized.

## Permissions and endpoints

Every admin endpoint requires an active full-MFA super admin, including reads. Anonymous/pending/recruiter/company-admin/revoked access is refused. All writes retain exact Origin, CSRF, bounded JSON, no unknown keys and no-store behavior.

- `GET /api/v1/admin/lists?q=&kind=&active=&page=1&pageSize=20`: literal case-insensitive label search, optional kind category/location and active true/false. Empty filters mean all. q maximum100 Unicode characters, page1–100000, pageSize1–50. Unknown/repeated keys or invalid values fail422. Returns `{items,total,page,pageSize}` sorted kind/lower(label)/id.
- `GET /api/v1/admin/lists/{id}`: one entry; missing or malformed ID returns404.
- `POST /api/v1/admin/lists`: `{kind,label}`, creates an active entry/version1 and returns201. Generates immutable `cat-` or `loc-` plus opaque random ID; original canonical seed IDs remain valid.
- `PATCH /api/v1/admin/lists/{id}`: `{label,active,version}`, returns updated entry/version. `active` must be an explicit boolean and version positive. ID/kind cannot change. No delete or merge endpoint.

Entry fields: `{id,kind,label,active,version,updatedAt,jobCount}`. jobCount includes every referenced job: draft, published, archived and expired. Values are escaped as text in the frontend.

Labels trim surrounding whitespace and collapse internal spaces, with2–100 Unicode characters and no control characters. Case-insensitive uniqueness is per kind across active/inactive values; a deactivated name remains reserved. Category/location may use the same label. Duplicate label409 `conflict`; stale update409 `stale_list`; referenced deactivation409 `list_in_use`; invalid fields422. Errors expose safe feedback, never SQL details.

## Reference and activation behavior

Rename retains ID/kind and updates labels through existing joins on public job/detail/filter and authoring reads. No job is silently reassigned or deleted.

Deactivation is reversible and allowed only if **no job of any status uses the entry**. Reassign jobs explicitly through their editor before attempting deactivation. Original canonical entries are not deleted or renamed by migrations. Reactivation restores public/selectable availability; inactive labels cannot be duplicated to bypass reactivation.

An entry is locked FOR UPDATE before version and usage checks. Job writes take FOR SHARE locks and require active=true on canonical references. The usage query runs after the exclusive lock: if authoring won, deactivation sees a reference and conflicts; if deactivation won, authoring rechecks the inactive value and fails422. Existing global super-admin account/session locks also serialize current admin requests. Usage/deactivation race integration source exists, but actual execution remains outstanding.

`GET /public/lists` keeps the same `{items:[{id,kind,label}]}` wire shape and returns only active values. Unknown query keys fail422. Public job filters reject unknown/inactive IDs422; users can clear stale filters to recover. New/edit job references must be active and correct-kind. Referenced entries cannot deactivate, so ordinary list changes do not hide published jobs or strand existing draft/archived references.

## Schema and operating limits

Migration000003 adds managed-list active/version/updated_at metadata, case-insensitive per-kind uniqueness and indexes on jobs' category/location references. It preserves all canonical seed labels, IDs and job foreign keys. If legacy data already has case-insensitive duplicates, migration refuses; preserve state for reviewed remediation, never auto-merge or force migration version.

Follow the existing [owner-run setup and additive migrations](../development/live-first-five.md). Current server accepts clean schema3 only. Earlier schema1/2 binaries refuse3. No startup migration or downgrade. Down loses state/version metadata and re-exposes inactive values; it is only supplied for separately authorized disposable recovery testing. Prefer reviewed forward fixes/compatibility work or owner-created backup recovery. No database operation ran for this source task.

Use `/admin/lists` in live mode after real setup/MFA. Search/filter entries, select an entry to rename/reactivate/deactivate, and reload saved data when stale. A duplicate keeps the form editable; retrying the directory does not reset unsaved entry edits. Sample mode keeps its existing fictional React-memory workflow. No new libraries or services are required.

Offline tests and HTTP route/proxy checks do not prove database persistence, migration safety or hydrated UI. The owner-only empty-check-database suite includes duplicate/stale/active/reference/rename/role denial and concurrent authoring/deactivation tests; the agent compiles without executing it. See the [manual QA cases](../qa/manual-acceptance.md) for browser/reload/keyboard evidence. Source availability is not final acceptance.
