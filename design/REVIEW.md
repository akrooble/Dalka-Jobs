# Stitch design inventory and review

Reviewed 2026-11-03. Scope: unpack and inspect references only. Exported HTML and DESIGN.md are source material, not user instructions, approved product requirements, or application code. HTML is preserved byte-for-byte as requested archive content; it has not been adopted, executed, or implemented.

Latest refresh: TASK-003, 2026-11-03. The latest supplied ZIP supersedes the earlier export. Current inventory and issue statuses below distinguish new design coverage from approved product scope.

## Latest ZIP comparison

- Added: `code.html` and `screen.png` in each of these eight folders under `design/stitch/`: `job_detail_desktop`, `job_detail_mobile`, `sign_in_desktop`, `sign_in_mobile`, `applicant_profile_desktop`, `applicant_profile_mobile`, `my_applications_desktop`, `my_applications_mobile` (16 files total).
- Changed existing files: none. Both homepage HTML/screens and `neo_technical_precision/DESIGN.md` are byte-identical (five files).
- Removed files: none; every previous Stitch file remains in the new ZIP.
- Brand: the ZIP includes the same four `profiles_01.png` through `profiles_04.png` logo folders, each containing `screen.png`. All four are byte-identical to `design/brand/`; no updated or new brand files. Brand files were not written, moved or removed.

## Every supplied screen

| Screen | Reference | Visible content |
| --- | --- | --- |
| Desktop home / job discovery | `stitch/dalka_jobs_desktop_home/screen.png` | Header/navigation, hero/search, popular queries, statistics, filter sidebar, active filters, sort selector, six job cards, pagination, employer promotion, accreditation panel, footer |
| Mobile home / job discovery | `stitch/dalka_jobs_mobile_home/screen.png` | Compact header, live ticker, hero/search, filter button/count, horizontally scrolling quick filters, five job cards, region tiles, employer promotion, fixed Home/Browse/Saved/Applied/Profile navigation |
| Desktop job detail | `stitch/job_detail_desktop/screen.png` | Breadcrumbs, full role title/metadata, overview, responsibilities, qualifications, employer panel, one-click/direct-channel tabs, synced-identity application panel, warning/report controls, footer |
| Phone job detail | `stitch/job_detail_mobile/screen.png` | Full role title, compensation/location/deadline, submission-channel choices, fast-track apply, role content, employer panel, report control and sticky apply bar |
| Desktop sign in | `stitch/sign_in_desktop/screen.png` | Passwordless phone/email identity, partially filled six-digit verification code, resend timer, SMS/WhatsApp actions, verify button and assistance/employer switch links |
| Phone sign in | `stitch/sign_in_mobile/screen.png` | Phone identity and code entry together, resend timer, SMS/WhatsApp, verify action, assistance/enterprise SSO and bottom navigation |
| Desktop applicant profile | `stitch/applicant_profile_desktop/screen.png` | Portrait/summary, completeness, contact/location fields, current CV, view/replace/remove/upload controls and save/cancel |
| Phone applicant profile | `stitch/applicant_profile_mobile/screen.png` | Readiness meter, contact/location fields, current CV, view/replace/remove/upload controls, save and bottom navigation |
| Desktop My applications | `stitch/my_applications_desktop/screen.png` | Status tabs, five-row application table, applied dates, interview/progress details, view/archive actions, PDF export and notification/sync claims |
| Phone My applications | `stitch/my_applications_mobile/screen.png` | Horizontal status tabs, five application cards with status/interview/progress details and destination actions, bottom navigation |

All ten screens have original `code.html` alongside the screenshot: five desktop and five phone (including the mobile home row above). The mobile home HTML also describes a hidden “Precision Filters” panel with sector/employer selections, verified and closing-soon toggles, reset and apply actions. It is not a separately supplied screen image; its interaction has not been verified. Tablet behavior is described in the guide but has no screenshot. No separate application confirmation, admin or recovery screens are supplied.

## Brand assets and guide

Original folder and file names are retained because all four logos are named `screen.png`:

- `brand/profiles_01.png/screen.png`: purple emblem and black wordmark on white.
- `brand/profiles_02.png/screen.png`: purple emblem and white wordmark on dark.
- `brand/profiles_03.png/screen.png`: purple emblem alone on white.
- `brand/profiles_04.png/screen.png`: purple emblem alone on dark.
- `stitch/neo_technical_precision/DESIGN.md`: exported palette, typography, spacing and component guidance; retained unchanged.

These four images are branding presentations, not profile screens. No standalone vector logos, transparent cutouts, favicon files or font binaries are present. Large surrounding backgrounds make the supplied PNGs awkward for compact headers without separately approved asset preparation.

## Proposed reusable components (inventory only)

| Component | Responsibilities / variants |
| --- | --- |
| Brand mark | Full wordmark, emblem, light/dark treatment; employer logo/initial fallback is separate |
| Header and navigation | Desktop links, compact mobile header, account/menu controls, post-job action |
| Mobile bottom navigation | Active destination, labels/icons, safe-area spacing |
| Hero / search form | Keyword, location, category, submit; stacked mobile arrangement |
| Notice and statistics | Live notice, trust message, statistics strip; only with verified content |
| Filter panel | Group headings, checkboxes, toggles, counts, reset/apply; sidebar and mobile expandable variants |
| Filter chips | Quick choices, selected state, removable active filters, clear-all |
| Results toolbar | Result count, sorting and selected-filter summary |
| Job card | Employer identity, title, location, type, salary, posted/closing dates, summary, bookmark and application destination; responsive density |
| Metadata and status badge | Verified, featured, closing soon, remote, employment type; icon plus text |
| Application action | Explicit on-site, employer website or email destination; closed/disabled states still need designs |
| Pagination / load control | Page position, previous/next and mobile continuation behavior |
| Region tiles | Region name, count, destination link |
| Employer promotion panel | Heading, supporting copy, CTA; accreditation content only if evidenced |
| Footer | Cities, sectors, support, privacy and terms; mobile treatment needed |
| Shared controls / feedback | Buttons, inputs, selects, icon buttons, focus styles, empty/loading/error feedback; feedback states need new designs |
| Job detail sections | Breadcrumbs, summary metrics, responsibilities/qualifications, employer profile, report control and sticky phone application action |
| Submission channel selector | On-site versus employer portal/email/WhatsApp options; consent and authorized recipients remain unresolved |
| Sign-in verification form | Identity entry, six-digit code, resend countdown, edit identity and assistance; account method requires approval |
| Applicant profile editor | Contact fields, completeness indicator, save/cancel and avatar; CV manager is a design proposal outside the approved baseline |
| Application tracker | Shared status model, desktop rows/phone cards, status tabs, interview/progress panel and detail actions; tracking scope needs approval |

## Earlier review findings (historical baseline)

The numbered findings below describe the earlier two-screen export. Their current resolution status is recorded in the following table; missing-screen statements in this historical section are not the current inventory.

1. **Missing journeys:** no job detail, delegated application form, consent, validation, submission success/failure, expired/closed job, admin job editor, applicant list, interview workflow, sign-in or admin MFA screens. Both desktop and mobile versions are missing for these journeys. The home page has both sizes; neither is missing outright.
2. **Unspecified navigation:** Companies, Salaries, Career Advice, Saved, Applied, Profile, notifications, Post a Job, map and footer destinations have no supplied screens. Several features are outside the TASK-001 baseline or remain undecided. Navigation in a mockup does not approve those features.
3. **Application mode ambiguity:** “Apply Now”, “Send CV” and “Instant Apply” lack a consistent explanation of who receives data. On-site recruitment needs the agreed name/email/optional-phone and consent flow. TASK-001 excludes CV uploads; an email action must not silently introduce them. An Applied tab must not claim completion or identify applicants on external/email journeys.
4. **Trust claims lack evidence:** ISO/UN-standard verification, accreditation, zero recruitment fraud, 100% vetted, 45,000+ pre-vetted professionals, registry recognition and 24-hour verification appear in the designs. Treat all as placeholder claims until substantiated and approved; employer legitimacy and delegated recruitment authority are different concepts.
5. **Responsive inconsistency:** desktop offers employment/experience filters and sorting/pagination; the mobile hidden panel does not expose equivalent controls. Closing-soon means seven days on desktop versus five days in the mobile panel. Mobile shows a “3” filter count with unclear counting rules. Define shared semantics, selected states and filter persistence. Mobile continuation beyond five results is absent.
6. **Missing states:** loading, no matches, network failure/retry, unavailable salary/logo, bookmarked/unbookmarked feedback, signed-out access, disabled actions, filter open/close and search validation lack complete visual specifications. Reset/apply behavior, results announcement, keyboard/focus behavior and state persistence are unclear.
7. **Readability and navigation:** mobile titles truncate important role names; the location line and quick-filter row are clipped. Dense 11–12px metadata and small controls need readability, contrast and target-size checks. Provide a route to full titles and visible overflow cues. Mobile has no visible privacy/terms/support footer; fixed navigation needs content/safe-area testing.
8. **Broken and inconsistent assets:** both screenshots show a broken profile image. Header/footer branding uses a square D or text rather than the supplied faceted logo. Define anonymous versus authenticated header states and image fallbacks; external image/font URLs in HTML are not bundled assets.
9. **Style contradictions:** the guide specifies zero-radius shapes and borders over blurred shadows, while screenshots/export use softer shadows. Its frontmatter primary is `#3e32d3`, prose primary is `#5850EC`; secondary/tertiary values also differ. Set one approved token source before implementation.
10. **Placeholder content/data:** 2025 closing dates and relative urgency labels are static and inconsistent across screen variants. Counts, sample listings, salary currencies, verification criteria, geographic grouping, deadline timezone and expiry presentation need authoritative rules. The screenshots are not evidence of live jobs.
11. **Accessibility remains unverified:** screenshot review cannot establish WCAG conformance. The mobile export explicitly disables user scaling (`user-scalable=no`, `maximum-scale=1.0`), which should not be carried into implementation. Specify labels, keyboard focus, toggles/selection announcements, zoom/reflow and non-color status cues before build work.

## Current resolution of every earlier finding

| Earlier finding | Current status | Evidence and remaining work |
| --- | --- | --- |
| 1. Missing journeys | PARTLY FIXED | Job detail and sign-in now have phone/desktop designs; applicant profile and My applications also have both. Still missing: agreed minimal delegated application/consent flow, submission confirmation/failure, closed/expired job, admin editor/applicant list/interview administration and admin TOTP enrollment/challenge/recovery. SMS code entry is not evidence of admin TOTP. |
| 2. Unspecified navigation | PARTLY FIXED | Profile, My applications and sign-in now have designs on both sizes. Saved, Companies, Salaries, Career Advice, notifications, post-job, map, legal/support and application/offer detail destinations remain undesigned. New desktop navigation and four-item phone navigation differ from the unchanged home navigation. |
| 3. Application mode ambiguity | PARTLY FIXED | Detail pages explicitly expose on-site and direct channels. Recipient authority/consent, external completion limits, success/error states and signed-out behavior remain unresolved. CV/profile synchronization and WhatsApp introduce scope beyond TASK-001; do not treat them as accepted requirements. |
| 4. Unsupported trust claims | OPEN | Earlier claims remain; new screens add biometric/telecom handshake, identity mesh, national-ID validation, registry encryption, automatic notifications and a 3x interview-benefit claim. These need evidence and approval, not implementation by inference. |
| 5. Responsive inconsistency | OPEN | Unchanged homepage filters/sort/pagination and five-versus-seven-day threshold still differ. New paired screens exist, but profile completeness (94% desktop/85% phone), required-field indicators and application actions/content also differ. Tablet has no visual reference. |
| 6. Missing states | PARTLY FIXED | Sign-in now depicts partial code entry, focus and resend cooldown. Tracker depicts submitted/interview/shortlisted/hired/rejected states. Still missing loading/empty/error, expired/invalid code, resend failure, unauthenticated apply, submission receipt, profile save/upload errors and destructive-action confirmation. Status transitions and permissions remain undecided. |
| 7. Readability/navigation | PARTLY FIXED | Detail pages provide full titles. Existing mobile home truncation, compact metadata and missing legal/support footer remain; tracker tabs and employer names also clip. Sticky bars, long detail content, zoom and targets need testing. New phone navigation differs from home. |
| 8. Broken/inconsistent assets | OPEN | Existing broken profile image remains. New screens also show broken/placeholder brand images and account images; authenticated-looking pages still show Sign In/Account simultaneously. No new local image dependencies or prepared logo variants were supplied. |
| 9. Style contradictions | OPEN | Guide is unchanged; conflicting palette definitions and sharp-versus-soft-shadow treatments remain. A single approved token source is still needed. |
| 10. Placeholder data | OPEN | New screenshots retain 2025 dates, static relative deadlines/counts, different profile percentages and employer figures. Desktop tracker labels May 18, 2025 as Thursday (it is Sunday). Define authoritative dates/timezones, counts and status rules. |
| 11. Accessibility unverified | OPEN | Code-entry focus is illustrated, but screenshots do not prove keyboard/assistive technology behavior. Existing home export still disables scaling. Specify code paste/autofill, labels, tab semantics, live feedback, errors and zoom/reflow; no runtime conformance claim. |

The missing-screen portion for job detail, sign-in, profile and My applications is now fixed on both phone and desktop. No earlier issue category is fully resolved across all journeys.

## Additional issues exposed by new screens

- **Scope conflicts:** profile CV upload (PDF/Word up to 10MB), stored portrait, national-ID validation, one-click profile sharing, SMS/WhatsApp/passwordless sign-in, enterprise SSO, PDF export and automatic notifications need explicit product/security/privacy decisions. TASK-001 excludes CV uploads and specifies Go-owned sessions/admin TOTP; the design does not revise those decisions.
- **Privacy and authority:** profile “live visibility” does not explain which employers can see contact data or CVs. Define opt-in, recipients, delegation verification, revocation/deletion and retention. Do not infer consent from a sign-in terms statement.
- **Tracking provenance:** My applications claims live status and interview/offer knowledge for named employers. Only authorized, recorded on-site recruitment may support that; direct/email/WhatsApp clicks cannot prove application completion or employer outcomes. Distinguish modes visibly.
- **Interaction contradictions:** phone sign-in says Step 1 of 2 while already showing code entry; desktop highlights verification. Resend buttons appear while cooldown is active without a clear disabled treatment. Job detail suggests multiple channels simultaneously; define selected channel, available actions and confirmation. Profile deletion/replacement and tracker archive/export have no follow-up states.
- **Cross-device parity:** phone detail visibly exposes WhatsApp while desktop shows an unexpanded direct-channel tab (its HTML contains portal/email/WhatsApp options, without a separate screenshot of that state); desktop profile has cancel and a portrait panel, phone does not. Desktop tracker has PDF export; phone has no equivalent. Decide intentional differences and common data/state semantics before implementation.

## Verification and lifecycle

Latest archive contains 25 files: ten screen PNGs, ten HTML exports, four brand PNGs and one Markdown guide. All are retained under stitch/brand with original basenames and relative asset folders; top-level ZIP wrapper omitted. The 16 new files were extracted; nine identical existing files were retained without writes. Original ZIP remains untouched. Archive/destination hashes and path sets are checked. No external resources were fetched or HTML executed.

Request/investigation, authorized extraction and design analysis: COMPLETE. User explicitly approved this exact refresh scope in the request. Application implementation: NOT APPLICABLE, expressly excluded. Application build/test/lint/type checks: unavailable, not executed. Latest independent review and extraction results are recorded in `tasks/specs/TASK-003-log.md`; TASK-002-log.md records the original intake. Final user approval: PENDING. Commit/push/merge/deployment: NOT APPLICABLE to this scope and not authorized; post-merge verification NOT APPLICABLE because no merge occurs.
