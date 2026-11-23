# Frontend screen and permission design

This inventory is the design for the fictional /prototype workspace, approved by the owner's 4 November 2026 prototype choice. It does not define production API contracts or settle unresolved product policies. The public website and shared controls are reused, with the existing #5850EC brand and system fonts.

## Early management and applicant journey

The /prototype index links into public, applicant and privileged design areas without creating or selecting a signed-in role. Every page retains a fictional-data notice and links back to the public website. Mobile navigation is a native expandable list; desktop uses a sidebar. Tables scroll inside their region. Headings, labels, error targets and focus styles reuse the FE-02 foundation.

| Area / screens | Design / projection | Important states and gates |
| --- | --- | --- |
| Public / service states | Reuse six existing job detail pages and filters; show service loading/empty/error/expired illustrations | B1/B2 API/cache/CSRF/session contracts unresolved; no new network client or live SEO |
| Access / privileged sign-in | Password, MFA enrollment/challenge, recovery and expiry read-only walkthrough for all three privileged roles | No credential fields enabled, session or destination unlocked; bootstrap/recovery policy pending |
| Admin / companies, jobs, job-editor, lists | Minimal early super-only authoring layout; sample search and local editor preview; four method-specific panels and full field inventory | Create/save/publish/archive/list edits disabled; reference deletion, authority and exact deadline remain backend/policy gates |
| Applicant / sign-in | Email-code request/challenge/resend/rate-limit/expiry walkthrough | No enabled email/code input or delivery; phone production off; no password flow |
| Applicant / profile | Fictional identity, private CV summary and separate deletion timelines | No file picker/download/deletion; CV required timing unresolved; exact 5,242,880-byte PDF/.docx rule described |
| Applicant / apply | Eligible on-site review layout with contact/CV snapshot and consent placeholder | No accepted consent text or successful submission; expired/duplicate/forbidden states; external clicks never show completion |
| Applicant / applications, application-detail, notifications | Own synthetic records; five known stages; interview and read-state illustration | No withdrawal or invented stage-transition policy; notification dismiss is local only |

The early views are designed first. Their prototype implementation precedes the remaining panels below. Live early entry still requires a working public API slice and secure MFA, not these examples.

## Remaining panel design (FE-12)

| Area / screens | Design / projection | Important states and gates |
| --- | --- | --- |
| Admin / overview | Counts derived from the visible fictional dataset; links into authoring, recruitment and invoices | No invented analytics or mixed-currency total |
| Admin / users, assignments | Synthetic role/MFA rows and recruiter-to-job assignments | Super-only mutations disabled; invites/multiple memberships/recovery not decided |
| Admin / trust, reports, content | Separate company checklist/authority blocks, report queue, warning and draft content panels | Verification does not establish recruitment authority; report submission and policy publishing disabled |
| Admin / recruitment, candidate, sharing | Sample candidate stages, private note illustration and explicit share/revoke design | Unknown transitions/note sharing/revocation disabled; no actual CV/contact download |
| Recruiter / jobs, candidates, interview, notes | Only fictional assigned jobs; stage/interview/private-note layouts | No job authoring/billing; reschedule/cancel and note rules pending |
| Company / jobs, candidates, rejected, progress | One synthetic company; main list only Shortlisted/Interview Scheduled/Hired; aggregate progress | Submitted hidden; contact/CV/private notes absent. Rejected data withheld until projection policy decided; no inherited sharing |
| Finance / invoices, invoice-editor, invoice-detail, prices, payments, summary | Single-currency sample invoices, separate payment rows, draft editor and locked Sent detail; billed/paid/unpaid by currency | Example DJ-2026-0001 is not allocated. Save/payments/PDF/send disabled; no applicant data, online payment or automatic tax; arithmetic is illustrative exact cents only |
| Admin / settings, activity | General settings and ID/time-only audit example | No security bypass toggles; production phone remains off; no copied note/CV/contact contents |

Tables have search, explicit empty results and previous/next controls. Editors accept fictional sample values only in component memory; Preview validates the sample and never claims a saved record. Sensitive operations are disabled and refer to the relevant service/policy prerequisite. State selector examples show loading/empty/error/forbidden/session-expired views without changing any access.

## Roadmap coverage and acceptance

FE-01 public source and FE-02 primitives are reused. FE-03 has public/service-state design only; typed production requests, sessions and live public integration remain BLOCKED. FE-04–11 and FE-13–19 have the screen inventory above; FE-12 is this design matrix. FE-20 provides combined prototype route/source regressions only. Full live acceptance and browser/keyboard/responsive/performance checks are separate gates, never implied by rendered HTML or unit tests.

No real credentials, CVs, candidate data, financial operations or persistent storage belong in these public routes. Real application intake remains gated by authority/privacy services. APIs must eventually enforce own/assigned/company access even when the UI projects the correct fictional rows.
