# Independent Stitch alignment review — 8 November 2026

Independent read-only reviewer: `frontend_audit`, separate from implementation. Reviewed the approved task specification, all ten original Stitch HTML/screenshot pairs, public/applicant source, CSS cascade/breakpoints, sample model, fonts/licenses and actual untracked files. No reviewer mutation or backend/database command.

Initial audit: CHANGES REQUIRED; the prior hero, generic applicant shell, cards and records substantially diverged from references. The implemented composition now represents all five screen pairs while retaining explicit sample boundaries and the original live entry points.

| ID | Severity | Source | Finding | Resolution |
| --- | --- | --- | --- | --- |
| SA-R1 | MAJOR | `web/lib/frontend-demo.ts`, `renameManagedLabel` | New profile location became invalid after admin location rename | Profile selection cascades with the managed location. Regression covers matching/unrelated/category changes and original fixture preservation. RESOLVED. |
| SA-R2 | MAJOR | `web/app/stitch.css`, overview tracker | Desktop record column minimum widths exceeded the narrower overview column | Overview always uses compact one-column records with labels and wrapping tools. Source correction independently verified. RESOLVED in source; rendered acceptance pending. |
| SA-R3 | MINOR | `web/components/job-browser.tsx`, `web/components/ui/dialog.tsx` | Mobile filter confirmation focused background results before native dialog closed | Optional native `onClosed` callback transfers requested focus after modal close; cancel/Escape retain default opener restoration. Independently verified. RESOLVED in source; keyboard acceptance pending. |
| SA-R4 | MINOR | `web/components/frontend/applicant-profile.tsx` | Replace focused an attach button while it was still disabled before React commit | Focus ref/effect waits for `cv=false` render and enabled attach control. Independently verified. RESOLVED in source; keyboard acceptance pending. |

Reviewer rechecked all four corrections plus revised detail columns/breadcrumb. No additional material source finding identified; no new security or API-contract issue found in the reviewed frontend scope. Independent final unit run PASS 47/47, exit 0; root `git diff --check` PASS. Root implementation checks include final lint/build/typecheck, both HTTP suites and served local fonts/CSS; reviewer did not independently repeat those commands.

Live authentication/authorization, real tenant isolation, private files, database integrity, backend concurrency and production finance are unchanged and not certified by this sample frontend review. Uploaded designs' unsupported trust/identity/statistics claims and excluded product features were not introduced.

Required visual/keyboard evidence remains unavailable: Chrome extension and built-in Browser both return `The browser access host is unavailable`, even after owner installation/Manage selection and browser selection in chat. Native capture reported minimized Chrome. No safety barrier bypass or alternative hidden browser automation was attempted. Responsive 375/768/1440 appearance, hydrated journeys, dialog focus, zoom and print remain unverified. Owner acceptance and release are pending.

BLOCKED
