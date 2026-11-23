# Dalka-Jobs

Latest work (23 November 2026): [local roadmap source and remaining gates](docs/development/local-roadmap-23-nov.md). Applicant synthetic sign-in/profile/deletion and partial team/assignment/scoped-job services are added locally. The current server requires owner-applied schema **6**. All twenty tasks are **not** complete; database/browser acceptance and remaining services/product decisions are outstanding.

See the [current task checklist and next build plan](docs/development/task-board.md) for green-checked local deliverables, remaining acceptance and the proposed next feature.

Dalka Jobs is a job board for Somalia, with public job discovery and planned applicant, recruitment and administration features. The product requirements and delivery order are in [TASK-001](tasks/specs/TASK-001.md).

Returning to development: read the [8 November project restart audit](docs/development/project-restart.md) for the current frontend, Stitch design corrections, remaining sample-only features and verification limits. The original uploaded designs remain under `design/stitch/`; final browser/design acceptance is still outstanding.

The local public website preview contains a responsive homepage, searchable/filterable fictional jobs, six job-detail pages, closed/404 states and About/Contact/draft policy pages. `/ui-preview` demonstrates shared controls. `/prototype` links 37 fictional screen designs for applicant, super-admin, recruiter, company and finance journeys. Applications, accounts and real listings are not connected yet. Example dates use a clearly labelled 3 November 2026 snapshot.

With the pinned Node 26.13.0 and npm 11.20.0 installed:

```powershell
Set-Location web
npm.cmd ci
npm.cmd run dev
```

Open the loopback URL printed by Next.js (normally http://127.0.0.1:3000). No database or credentials are needed for this preview. See [website development](docs/development/website.md) for verification commands and current limitations.

Live public discovery, team password/TOTP sign-in and super-admin company-management source is available through the [first-five local setup guide](docs/development/live-first-five.md). It requires the owner-run database setup/migrations, private key and bootstrap. Database/browser acceptance remains pending. Set `DALKA_WEBSITE_MODE=live` only for this configured mode; it never falls back to fictional listings.

FE-06 adds live super-admin job management at `/admin/jobs`: draft, protected saved preview, edit, publish and archive. FE-07 adds `/admin/lists` for categories/locations: create, rename and reversible deactivation of unused values, with reference/version protection. These originally required schema3; current source requires schema6 as described in the latest roadmap guide. See the [job authoring contract](docs/api/job-authoring.md) and [managed-list contract](docs/api/managed-lists.md). Database/browser acceptance remains pending; on-site recruitment publication is disabled and optional salary fields are deferred.

Separate [Windows development notes](docs/development/windows.md) describe toolchain pins and the prepared user-run PostgreSQL service setup. Database runtime verification remains separate from the website preview.
