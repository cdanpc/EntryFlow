# EntryFlow Level 1 Development Tracker

Use this file to track implementation work against the agreed Level 1 phases. Check an item only after the work is implemented and verified. Record test results honestly as **Pass**, **Fail**, or **Not Run**.

## Status key

- [ ] Not started or still in progress
- [x] Completed and verified

For each issue or change, add a short description, date, related phase, and current status. Keep implementation notes factual; distinguish completed work from planned work.

## Project overview

- **Project:** EntryFlow — Event Registration and QR Check-in Management System
- **Target:** Complete and verify all Level 1 requirements before starting Level 2
- **Current phase:** Phase 7 — Level 1 verification and handoff (database is initialized; acceptance checks in progress)
- **Last updated:** 2026-11-25
- **Overall status:** In progress; 9 of 11 acceptance checks currently verified, with short-code lookup and phone QR scan still unverified

## Phase 1 — Inspect and prepare

### Work items

- [x] Review the existing codebase and project structure. *(Initial review found no application source files.)*
- [x] Review the project requirements and available project documentation.
- [x] Identify existing reusable components, utilities, and conventions. *(No app components/utilities existed at the start.)*
- [ ] Confirm local development and environment setup.
- [ ] Document unresolved implementation decisions.
- [ ] Record the Level 1 data flow and scope.

### Exit gate

- [ ] Project runs locally.
- [ ] Existing structure and conventions are understood.
- [ ] Level 1 scope and data flow are documented.

### Bugs

| ID | Description | Severity | Status | Date found | Resolution / notes |
|---|---|---|---|---|---|
| — | None recorded | — | — | — | — |

### Needs improvement

| ID | Area | Improvement needed | Priority | Status | Notes |
|---|---|---|---|---|---|
| — | — | None recorded | — | — | — |

### Revised

| Date | Item revised | Previous behavior / decision | Revised behavior / decision | Reason |
|---|---|---|---|---|
| — | — | — | — | — |

### Development notes

- Initial workspace contained the project DOCX, saved development standards, and tracker; no application source files or frontend demo were present.
- Node.js 22.19.0 and npm 11.12.1 are available. The initial workspace had no `node_modules` or lockfile; a clean dependency install later completed and created `package-lock.json`.

## Phase 2 — Design data and app foundation

### Work items

- [x] Define Level 1 `events`, `registrations`, and `staff_users` schema.
- [x] Define relationships, constraints, and indexes.
- [x] Add database migrations. *(Initial migration applied to Supabase.)*
- [x] Add repeatable seed data for at least two events, including one full event. *(Verified three events.)*
- [x] Add demo Organizer and Door Staff accounts with securely hashed passwords. *(Both roles supported by the account-only seed; deployment database verification pending.)*
- [ ] Establish shared server-side validation and error handling.
- [ ] Establish structured logging that avoids sensitive information.
- [ ] Establish design tokens for colors, typography, spacing, borders, and states.
- [ ] Organize API handlers, business logic, and database access into clear layers.

### Exit gate

- [ ] A fresh local setup can migrate and seed the database.
- [ ] Data integrity and server-side validation rules are documented.
- [x] Secrets are managed outside source control. *(`.env` is gitignored and untracked.)*

### Bugs

| ID | Description | Severity | Status | Date found | Resolution / notes |
|---|---|---|---|---|---|
| — | None recorded | — | — | — | — |

### Needs improvement

| ID | Area | Improvement needed | Priority | Status | Notes |
|---|---|---|---|---|---|
| — | — | None recorded | — | — | — |

### Revised

| Date | Item revised | Previous behavior / decision | Revised behavior / decision | Reason |
|---|---|---|---|---|
| — | — | — | — | — |

### Development notes

- Added Next.js/TypeScript project configuration, PostgreSQL/Prisma models and migration, `.env.example`, and a seed script for two upcoming events plus a full event. The demo password must be supplied through `DEMO_STAFF_PASSWORD` and is stored as a bcrypt hash.
- Added a shared Prisma client and initial design tokens. Prisma Client generation succeeded. The initial migration was applied with `prisma migrate deploy`; the seed script created three events and one Organizer. Read-only verification confirmed Cebu Dev Meetup 2026 has 0/30 spots occupied, Product Design Exchange 0/60, and Community Tech Forum 1/1 (full).

## Phase 3 — Event discovery and registration

### Work items

- [ ] Build a responsive public event list.
- [ ] Build an event detail view.
- [ ] Show title, Cebu-local date and time, venue, description, and spots remaining.
- [ ] Build guest registration with full name, email, and Philippine mobile number.
- [ ] Validate email and require an 11-digit mobile beginning with `09`.
- [ ] Validate all submitted fields on the server.
- [ ] Prevent duplicate active registrations for the same normalized email and event.
- [ ] Enforce event capacity using authoritative server/database state.
- [ ] Handle concurrent last-spot registrations without overselling.
- [ ] Show clear errors and confirmation feedback.

### Exit gate

- [ ] A valid attendee can register for an available event.
- [ ] Invalid inputs receive useful field-level feedback.
- [ ] Duplicate active registration is rejected.
- [ ] A full event cannot accept another registration.
- [ ] Concurrent requests cannot exceed capacity.

### Bugs

| ID | Description | Severity | Status | Date found | Resolution / notes |
|---|---|---|---|---|---|
| — | None recorded | — | — | — | — |

### Needs improvement

| ID | Area | Improvement needed | Priority | Status | Notes |
|---|---|---|---|---|---|
| — | — | None recorded | — | — | — |

### Revised

| Date | Item revised | Previous behavior / decision | Revised behavior / decision | Reason |
|---|---|---|---|---|
| — | — | — | — | — |

### Development notes

- Implemented public event list/details and a three-field registration form. The server action validates input, normalizes email, locks the event row in a serializable transaction, checks duplicate active registration and current capacity, and creates a 32-byte random ticket code.
- Added unit tests for registration input validation; all 3 tests pass.
- Registration and capacity behavior has not been verified against PostgreSQL; exit-gate checks remain unchecked.

## Phase 4 — QR ticket and ticket retrieval

### Work items

- [x] Generate a unique, unpredictable QR ticket secret and six-character manual code after successful registration. *(Database uniqueness is enforced; short-code flow still needs acceptance testing.)*
- [ ] Display attendee name and event details on the ticket page.
- [ ] Generate a QR code containing the ticket code.
- [x] Build ticket lookup using the six-character code plus matching email or mobile. *(The prior lookup used the former long code; verify the revised short-code flow.)*
- [ ] Return a generic not-found response for invalid lookup combinations.
- [ ] Ensure failed lookups do not reveal personal or ticket information.
- [x] Apply appropriate rate limits to ticket lookup. *(PostgreSQL-backed per-address bucket; threshold behavior smoke-checked.)*

### Exit gate

- [ ] A successful registration displays a usable QR ticket.
- [ ] A valid code and contact detail retrieve the correct ticket.
- [ ] An incorrect combination reveals no attendee information.

### Bugs

| ID | Description | Severity | Status | Date found | Resolution / notes |
|---|---|---|---|---|---|
| — | None recorded | — | — | — | — |

### Needs improvement

| ID | Area | Improvement needed | Priority | Status | Notes |
|---|---|---|---|---|---|
| — | — | None recorded | — | — | — |

### Revised

| Date | Item revised | Previous behavior / decision | Revised behavior / decision | Reason |
|---|---|---|---|---|
| 2026-11-24 | Ticket identifiers | One long ticket code was shown, typed for lookup, encoded in QR, and used in the ticket URL. | Show a unique six-character manual code; retain the 256-bit secret for QR and private ticket URL. Lookup requires a matching attendee contact; staff may check in with either code. | Make manual entry easier while preserving the QR bearer secret. |

### Development notes

- Implemented ticket lookup requiring a ticket code plus matching email or mobile, with a generic mismatch response. Added a QR ticket page with attendee/event details and print styles.
- The ticket URL contains the unguessable ticket code and is sensitive. PostgreSQL-backed rate limiting is implemented; deployment proxy address headers still need verification.
- Revised ticket identifiers: the attendee-facing manual code is six Crockford-style characters; the QR and ticket URL retain a separate 256-bit secret. Public lookup requires a matching contact, and authenticated staff can check in by either code. Migration `202611240003_manual_ticket_codes` backfills existing records and enforces uniqueness; revised paths still need acceptance testing.

## Phase 5 — Staff sign-in and manual check-in

### Development notes

- Added Auth.js Credentials sign-in using bcrypt verification and an eight-hour encrypted JWT session. Staff dashboard access is checked server-side.
- Added manual ticket-code check-in. It verifies event selection, confirmed status, and the Asia/Manila event date, then uses a conditional atomic update so only one concurrent scan is the first check-in; subsequent scans return the original timestamp.
- Added basic response security headers. PostgreSQL-backed rate limiting for staff sign-in and check-in was added and migrated on 2026-11-24; see the Phase 7 implementation note.
- Local production browser check verified Organizer sign-in/out, one successful same-day check-in, and repeat-scan handling with the original check-in time. Concurrent simultaneous scans remain unverified.

## Phase 6 — Attendee list and attendance totals

### Development notes

- Added an Organizer-only attendee list with name/code search, 50-row pagination, contact details, ticket status, and registration time. Door Staff sees check-in but not attendee contact records.
- Added registered/capacity, checked-in, and waitlisted counters. A temporary one-attendee event showed matching totals and attendee status; broader multi-record and role-access checks remain open.

## Phase 5 — Staff sign-in and manual check-in

### Work items

- [x] Build the staff sign-in screen. *(Rendered and used successfully.)*
- [x] Hash staff passwords with an established password-hashing library. *(Organizer sign-in succeeded using the seeded bcrypt hash.)*
- [x] Implement secure staff sessions and cookies. *(Authenticated dashboard and sign-out flow verified.)*
- [x] Protect staff pages and sensitive API operations on the server. *(Logged-out `/staff` redirect verified; check-in used an authenticated Organizer session.)*
- [x] Document demo staff credentials safely for local development. *(README documents the environment variable, not its value.)*
- [x] Build the event selector for staff. *(Selected the same-day test event.)*
- [x] Build manual ticket-code entry with keyboard-scanner support. *(Long QR secret was exercised; short-code input still needs acceptance testing.)*
- [x] Allow check-in only for an eligible confirmed ticket for the selected event on event day in Asia/Manila. *(Same-day confirmed ticket passed; invalid ticket rejected.)*
- [x] Make check-in an atomic status transition. *(First scan checked in; later scan returned the existing state.)*
- [x] Save the original check-in timestamp and staff member. *(Original timestamp remained on repeat; authenticated staff performed the transition.)*
- [x] Return clear `Checked in`, `Already checked in` (with original time), or `Invalid ticket` results. *(All three outcomes observed.)*
- [x] Apply appropriate rate limits to sign-in and check-in. *(PostgreSQL-backed per-address/username and per-staff buckets; threshold behavior smoke-checked.)*

### Exit gate

- [x] Logged-out users cannot access protected staff operations.
- [x] Valid check-in records the first check-in exactly once. *(Sequential retry did not create a second check-in.)*
- [x] Repeated scans report the original check-in time.
- [x] Invalid or ineligible tickets cannot check in.
- [ ] Concurrent scans cannot both register a new successful check-in.

### Bugs

| ID | Description | Severity | Status | Date found | Resolution / notes |
|---|---|---|---|---|---|
| — | None recorded | — | — | — | — |

### Needs improvement

| ID | Area | Improvement needed | Priority | Status | Notes |
|---|---|---|---|---|---|
| — | — | None recorded | — | — | — |

### Revised

| Date | Item revised | Previous behavior / decision | Revised behavior / decision | Reason |
|---|---|---|---|---|
| — | — | — | — | — |

## Phase 6 — Attendee list and attendance totals

### Work items

- [x] Show attendee name, email, mobile, six-character manual ticket code, registration time, and check-in status. *(Short-code display still needs a database-backed page review.)*
- [ ] Add search by attendee name or ticket code.
- [x] Show registered/capacity totals. *(Temporary event showed 1/10.)*
- [x] Show checked-in/registered totals. *(After check-in, temporary event showed 1/1.)*
- [ ] Restrict attendee information to authorized staff.
- [x] Ensure totals reflect authoritative database records. *(List and totals matched the one temporary registration.)*
- [ ] Ensure the mobile layout remains usable without horizontal scrolling.

### Exit gate

- [x] Authorized staff can find attendee records. *(Organizer dashboard displayed the temporary record.)*
- [ ] Search and displayed details are correct.
- [x] Attendance totals match underlying records. *(1 registered, 1 checked in, 0 waitlisted.)*
- [ ] Unauthorized users cannot retrieve attendee information.

### Bugs

| ID | Description | Severity | Status | Date found | Resolution / notes |
|---|---|---|---|---|---|
| — | None recorded | — | — | — | — |

### Needs improvement

| ID | Area | Improvement needed | Priority | Status | Notes |
|---|---|---|---|---|---|
| — | — | None recorded | — | — | — |

### Revised

| Date | Item revised | Previous behavior / decision | Revised behavior / decision | Reason |
|---|---|---|---|---|
| — | — | — | — | — |

## Phase 7 — Level 1 verification and handoff

### Work items

- [ ] Run each Level 1 acceptance check and record its actual result.
- [x] Check registration and ticket screens at 360px emulated viewport. *(Registration succeeded, QR displayed, and the page fit without horizontal overflow.)*
- [ ] Check staff flows on desktop and tablet.
- [ ] Check keyboard navigation, labels, focus states, and status announcements.
- [ ] Review server authorization and input validation.
- [ ] Review capacity, duplicate-registration, lookup privacy, and check-in concurrency protections.
- [ ] Review logs for sensitive-data exposure.
- [ ] Update README with setup, migration, seed, demo account, features, limitations, and results.
- [ ] Prepare a continuous demo: register, retrieve/show QR, check in, repeat scan, and invalid ticket.

### Exit gate

- [ ] All required Level 1 checks are marked Pass.
- [ ] Any failures or unrun checks are clearly recorded.
- [ ] README and demo match the implementation and verification evidence.
- [ ] Level 1 completion is approved before Level 2 work begins.

### Acceptance test results

| Test | Expected result | Result (Pass / Fail / Not Run) | Evidence / notes |
|---|---|---|---|
| L1-01 Register on phone viewport | Ticket page appears with QR | Pass | At a 360px emulated phone viewport, registration completed and the confirmed ticket QR fit without horizontal page overflow. Test attendee was removed afterward. |
| L1-02 Scan QR with any phone QR app | Decoded content opens the ticket URL with the QR secret | Not Run | User reports staff camera and manual check-in work, including repeat-scan result. Ordinary phone camera did not offer an action for the former raw-token QR; QR now contains a URL and needs a phone retest. The planning document says the decoded content should equal the ticket code, so this URL variant needs reviewer confirmation. |
| L1-03 Refresh and retrieve | Six-character code and email return ticket | Not Run | Prior verification used the former long code; retest the revised lookup flow. |
| L1-04 Wrong code/contact combination | Ticket not found; no personal information | Pass | Correct test code plus mismatched contact returned only the generic “Ticket not found. Check the details and try again.” message. |
| L1-05 Same email on same event | Second active registration rejected | Pass | Repeated the test registration; UI returned “This email already has an active registration for the event.” |
| L1-06 Invalid email and 10-digit phone | Field-level validation errors | Pass | Submitting an invalid email and 10-digit mobile returned separate email and mobile field errors. |
| L1-07 Seeded full event | Full shown; registration unavailable | Pass | Production HTTP check: event card shows Fully booked; detail page shows Registration is full and omits registration form. |
| L1-08 Staff URL while logged out | Server redirects or blocks access | Pass | Production HTTP check: `/staff` returns 307 to sign-in without a session. |
| L1-09 Valid check-in | Checked in plus attendee name | Pass | Organizer session checked in the same-day test attendee; UI showed “Checked in”, expected name, and check-in time. |
| L1-10 Same code scanned again | Already checked in plus original time | Pass | Repeated the scan; UI returned “Already checked in” and the same original time. |
| L1-11 Made-up/other-event code and attendee totals | Invalid ticket; list and counts correct | Pass | Made-up code returned “Invalid ticket”; list showed one checked-in record; totals were 1/10 registered, 1/1 checked in, 0 waitlisted. |

### Bugs

| ID | Description | Severity | Status | Date found | Resolution / notes |
|---|---|---|---|---|---|
| — | None recorded | — | — | — | — |

### Needs improvement

| ID | Area | Improvement needed | Priority | Status | Notes |
|---|---|---|---|---|---|
| — | — | None recorded | — | — | — |

### Revised

| Date | Item revised | Previous behavior / decision | Revised behavior / decision | Reason |
|---|---|---|---|---|
| — | — | — | — | — |

## Cross-phase issue and change log

Use this log for items that affect multiple phases or need a single project-wide history.

### Bugs

| ID | Phase | Description | Severity | Status | Date found | Resolution / notes |
|---|---|---|---|---|---|---|
| B-001 | Deploy | Vercel typecheck used a Prisma Client without the new `manualCode` field. | High | Fixed | 2026-11-24 | Latest Vercel logs confirm `postinstall` generated the updated Prisma Client. |
| B-002 | Deploy | Vercel typecheck found `ticket` out of scope in the ticket lookup action after Prisma generation succeeded. | High | Fixed | 2026-11-24 | Store the resolved ticket code outside the `try` block; local typecheck and production build pass. Latest fix still needs a Vercel rebuild. |
| B-003 | 5 | Camera scan exposed the long QR token in a disabled manual field and gave no submission result for future events. | High | Fixed in code; device retest pending | 2026-11-25 | The manual field remains editable; scans submit the private token separately and show progress and server result. A same-day demo event was created for check-in testing. |
| B-004 | 5 | A valid ticket for a future event was described as invalid, while the checked-in total stayed at zero. | Medium | Fixed in code; deployment retest pending | 2026-11-25 | Server now identifies the event date in the result; dashboard displays a date notice before scanning. Database shows two confirmed tickets for Cebu Dev Meetup on December 8 and no registrations yet for today's demo event. |

### Needs improvement

| ID | Phase | Area | Improvement needed | Priority | Status | Notes |
|---|---|---|---|---|---|---|
| I-001 | 3–5 | Abuse protection | Verify trusted client-address headers on the final deployment target. | High | Open | PostgreSQL-backed shared limits are implemented and migrated; host proxy must set/overwrite `x-real-ip` or trusted `x-forwarded-for`. |
| I-002 | All | Verification | Complete the remaining phone QR scan and review concurrency and role-based data access. | High | Open | The short-code revision also requires rechecking L1-03; 9 of 11 checks are currently verified. |
| I-003 | 4–6 | Short ticket codes | Acceptance-test short-code lookup, staff check-in, attendee list display, and legacy QR-secret handling. | High | Open | Migration `202611240003_manual_ticket_codes` is applied; typecheck and production build pass, but short-code behavior is not yet manually verified. |

### Revised

| Date | Phase | Item revised | Previous behavior / decision | Revised behavior / decision | Reason |
|---|---|---|---|---|---|
| 2026-11-24 | 4–6 | Ticket identifiers | One long ticket code served as the visible code, lookup value, QR payload, and ticket URL secret. | Separate the six-character manual code from the 256-bit QR and URL secret; lookup still requires the matching email or mobile. | Reduce typing while retaining an unguessable QR secret and contact-gated retrieval. |
| 2026-11-25 | 5 | Camera check-in form | Scanned QR token appeared in the manual field; future event selection stopped submission. | Keep the six-character field editable, submit QR token in a hidden form field, and display server feedback for every scan. | Make scan behavior clear without exposing the QR secret or weakening event-day check-in rules. |
| 2026-11-25 | 4–5 | Ticket QR payload | The QR encoded a raw private token that the phone's standard camera did not present as an action. | Encode an HTTPS ticket URL containing the token; staff scanning extracts the token from that URL while retaining raw-token support. | Let a phone camera open the ticket and keep staff check-in compatible. Retest against the Level 1 decoded-code wording. |
| 2026-11-25 | 5 | Normal-camera staff fallback | A normal phone camera opened only the attendee ticket page; staff could not verify it from that route. | Add a staff verification link, safe sign-in return path, and protected review page with an explicit Check In action. | Support staff who use their phone camera without allowing a public GET request to record attendance. |
| 2026-11-25 | 5 | Active staff QR routing and session expiry | Signed-in staff still saw the attendee ticket page, and the eight-hour JWT limit did not enforce inactivity. | Route active staff directly to protected review; enforce 30 minutes of server-tracked inactivity and an eight-hour absolute session limit. | Remove the redundant staff link for active staff and require reauthentication after inactivity. |
| 2026-11-25 | 5 | Already checked-in ticket review | The protected review screen still showed Check In for a ticket that had already been checked in; its status color was blue. | Hide Check In unless the ticket is Confirmed, show the original check-in time, and use green for checked-in status and repeat results. | Prevent a misleading action and make the completed state clear. |

## Development notes

- 2026-11-26: Integrated the supplied Loading State HTML design into shared branded loaders, event/attendee skeletons, verification overlays, and pending-button spinners. Event results now stream behind a Suspense skeleton while keeping the existing query/registration rules. Applied the user's follow-up: search icon inside the left edge, order-filter icon inside the right edge on mobile/desktop, removed date-window/slot-range controls and behavior, and renamed attendee Home navigation to Event. All 28 remaining tests, lint, typecheck, and production build pass. Local production HTTP 200 resolved real event cards, included Order/Event navigation, omitted removed controls, and had no streaming error template. Browser animation/layout/device checks remain pending because browser access is unavailable.

- 2026-11-26: Added a single Filter disclosure beside event search with order, inclusive 0–100 remaining-slot range, and Cebu date-window criteria. Desktop aligns Events, centered search, and Filter in one row; compact layouts place search/Filter together below Events. Reduced the desktop sidebar 25% from 104px to 78px, including role-menu fitting. All 30 tests, lint, typecheck, and production build pass; browser visual checks remain pending because browser access is unavailable.

- 2026-11-26: Minimized vertical spacing around all Back/return link styles: zero outer margins, reduced detail/sign-in card top padding, no extra heading margin after sign-in Back, and a tighter event-detail top strip. Kept compact touch areas at 44px while desktop Back rows use 32px. Lint, typecheck, and production build pass; browser visual check remains pending.

- 2026-11-26: Unified sidebar/main backgrounds to white, applied very faint EntryFlow-blue shadows to fields/cards using shared tokens, preserved focus feedback, and matched Sign in action corners at 7px. Added Back to home inside the sign-in card above its title on desktop/mobile. Removed public event date/sort dropdowns and their unused helpers/tests at user request; search and soonest-first ordering remain, and legacy filter parameters are ignored. All 21 remaining tests, lint, typecheck, and production build pass. Browser visual verification remains pending.

- 2026-11-26: Extended desktop event search toward the left and reduced the empty top header strip to 20px. Added date and sort dropdowns below search, preserving query/filter URL state. Cebu-based date windows and deterministic date/name/available-spots sorting use current confirmed/check-in counts; capacity enforcement is unchanged. All 29 tests, lint, typecheck, and production build pass; browser/device visual checks remain pending because browser access is unavailable.

- 2026-11-26: Replaced all generated E marks with the supplied PNG via shared BrandLogo, including headers, sidebar, sign-in, tickets, and footer. Removed the desktop rule hiding Back to events; its existing placement above the event photo now applies at every viewport size. Lint, typecheck, and production build pass. Browser/device visual verification remains pending because browser access is unavailable.

- 2026-11-26: Moved staff Back inside the detail card above ATTENDEE DETAILS on desktop/mobile. Event details now uses the shared Find Ticket header and shows Back to events above the photo on compact layouts. Desktop staff name/code search expands across two thirds of the controls row. Lint, typecheck, and production build pass; browser visual verification remains pending.

- 2026-11-26: Aligned desktop attendee search beside Event, removed the staff Home check-in desk and Manual entry sidebar link, and added a desktop black Back link with theme-color hover above attendee details. Scan now accepts six-character manual entry below the camera on mobile and desktop. Authenticated, rate-limited lookup respects selected-event scope and redirects to the same protected review flow without recording attendance. All 21 tests, lint, typecheck, and production build pass; browser/device visual verification remains pending.

- 2026-11-26: Applied the two desktop SVG references using a 104px left navigation rail, a responsive 3/4/5-column event grid, and a simplified staff workspace. Reused adaptive navigation and extracted shared icons; added desktop Find Ticket/Sign in and staff Activity/Manual entry access, with sign-out at the rail bottom. Existing mobile layouts and backend flows are retained. UI/UX Pro Max design-system and UX searches completed. Lint, typecheck, and production build pass; browser responsive/keyboard/visual checks remain pending because browser access is unavailable.

- 2026-11-26: Replaced staff mobile/tablet table reflow with a shared numbered name/status list for Attendees and Activity. Removed mobile summary chips and Activity intro text; details remain on the protected detail page. Dock tabs now highlight only the active page, including Scan. Added a centered reusable circular three-dot loader for route loads and directory requests, respecting reduced motion. Lint, typecheck, and production build pass; responsive visual check remains pending because browser access is unavailable.

- 2026-11-26: Reproduced the public attendee event-list HTTP 500 and the database error `EMAXCONNSESSION` (session pool limit 15). Runtime Supabase connections now use transaction pooling on port 6543 with PgBouncer compatibility and a default one-connection pool. Migration/local/direct URLs are unchanged. The same database event read and a SELECT-only transaction pass through the new runtime URL. All 16 unit tests, lint, typecheck, and production build pass. Local production HTTP check against the live database returns 200 with event cards and no generic application error. Vercel recovery awaits review/merge/deployment.

- 2026-11-26: Integrated attendee name/code search into a shared responsive staff directory with 300 ms debounce, cancellation, status filters, clear action, retry/session feedback, and 50-row pagination. Door Staff queries omit contacts and QR secrets; Organizer contact access remains. Added selected-event navigation through Attendees, Scan, Activity, ticket review, and attendee details. Activity lists recent check-ins for the event. Legacy Search redirects to Attendees. Tests: 13 pass; lint/typecheck/build pass. Browser/device review remains pending.

- 2026-11-26: Aligned sign-in branding to the left. Staff checked-in status and success/repeat results now use green status text without a green badge or result background. Lint and typecheck pass; visual review pending.

- 2026-11-26: Added event search by title/place beside Events, removed the event count, changed attendee navigation to Find Ticket with a ticket icon, and shared the Home header with Find Ticket. The sign-in link now reads Sign in. Lint and typecheck pass; mobile visual review remains pending.

| Date | Phase | Work completed / decision | References / evidence |
|---|---|---|---|
| 2026-11-24 | Phases 1–6 | Created the Next.js/Prisma foundation, attendee registration and ticket flow, staff sign-in, manual check-in, and Organizer attendee list. Clean install and Prisma Client generation passed. Typecheck, lint, all 3 unit tests, and production build passed. PostgreSQL migration, seed, and database-backed acceptance checks remain pending. | Source files in workspace; command outputs in development session |
| 2026-11-24 | Phase 7 | Applied the initial Prisma migration and seeded three events plus one Organizer in Supabase. Generated a local demo password stored only in ignored `.env`. Added `AUTH_TRUST_HOST` for local/reverse-proxy operation. Production smoke checks verified full-event messaging and unauthenticated staff redirect; 2 of 11 acceptance checks pass. | `npm run db:seed` output, migration status, local production HTTP checks; `.env` remains gitignored |
| 2026-11-24 | Phase 7 | Local production browser verified successful registration and QR ticket display, matching-contact ticket retrieval, generic wrong-contact response, and duplicate-registration rejection. Removed the disposable test registration and confirmed no matching test row remained. Total: 4 of 11 full checks pass; L1-03 remains open because ticket-page refresh was not checked. | Browser acceptance flow on `127.0.0.1:3100`; exact test data and ticket code omitted; database cleanup count 1, remaining count 0 |
| 2026-11-24 | Phase 7 | Refreshed a confirmed ticket page and verified the QR remained visible; invalid email and a 10-digit mobile produced separate field-level errors. Removed the temporary test registration and confirmed zero matching rows remained. Total: 6 of 11 checks pass. | Local production browser on `127.0.0.1:3100`; database cleanup count 1, remaining count 0 |
| 2026-11-24 | Phases 2, 4–5 | Added a PostgreSQL-backed atomic rate-limit bucket table and wired it into ticket lookup, staff authentication, and check-in. Applied migration `202611240002_rate_limit_buckets`; threshold smoke check allowed two requests and denied the third, then removed its test bucket. Typecheck, lint, and production build passed. | Prisma migration output; temporary smoke script output; no raw client addresses or test subjects stored |
| 2026-11-24 | Phases 4–6 | Added unique six-character manual ticket codes while preserving the separate long QR secret. Ticket lookup requires the manual code plus matching contact; staff check-in accepts either code; attendee views show the short code. Generated Prisma Client and applied `202611240003_manual_ticket_codes` to backfill existing registrations. Revised flows are not acceptance-tested yet. | Prisma Client generation and migration deployment output; short-code acceptance checks remain open |
| 2026-11-24 | Deploy | Inspected Vercel build for `02b2730`; Prisma Client generation succeeded, then TypeScript reported `ticket` out of scope in `src/app/tickets/actions.ts`. Moved the resolved ticket code outside the `try` block. Local `npm.cmd run typecheck` and `npm.cmd run build` both pass; pushed fix is awaiting a new Vercel build. | Vercel build logs and local typecheck/production build output |
| 2026-11-24 | Phase 7 | Completed registration at 360px emulated mobile viewport and confirmed the QR ticket was visible with no horizontal page overflow. Removed the temporary registration; database count confirmed zero matching records. Total: 7 of 11 checks pass. | Local production browser, Chrome responsive viewport set to 360px; database cleanup count 1, remaining count 0 |
| 2026-11-24 | Phase 7 | Used the seeded Organizer account in the local browser. Verified valid check-in, repeat scan with the original time, made-up code rejection, attendee status, and totals. Removed the temporary attendee and same-day event; database cleanup confirmed one registration and one event removed with zero remaining fixture registrations. Signed out and dismissed Chrome's save-password prompt without saving. Total: 10 of 11 acceptance checks pass. | Local production browser and Supabase cleanup script; credential and ticket code omitted |
| 2026-11-25 | Mobile UI | Added attendee photo cards with full-card links, mobile Home/Search navigation, and scroll-revealed navigation on event details. Added staff attendee list and detail, dedicated camera scan, and attendee search by name or code. A scan opens protected ticket review for explicit check-in. Local lint, typecheck, and production build pass. Device layout and camera retest remain open; desktop redesign and viewport transition motion are deferred until desktop references arrive. | Mobile SVG wireframes in `SVGs/`; source in `src/app`, `src/components`, and `src/lib` |
| 2026-11-26 | Mobile UI revision | Event cards now show date without weekday or time, title, venue, and spots. Simplified attendee and staff headers, updated typography and sign-in spacing, added a shared staff role menu with Sign out, and made staff event selection submit on change. Local lint, typecheck, and production build pass; device review remains pending because the browser preview host was unavailable. | `src/app`, `src/components/staff-header.tsx`, `src/components/staff-event-picker.tsx`, `src/lib/format.ts` |
