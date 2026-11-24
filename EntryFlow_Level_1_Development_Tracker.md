# EntryFlow Level 1 Development Tracker

Use this file to track implementation work against the agreed Level 1 phases. Check an item only after the work is implemented and verified. Record test results honestly as **Pass**, **Fail**, or **Not Run**.

## Status key

- [ ] Not started or still in progress
- [x] Completed and verified

For each issue or change, add a short description, date, related phase, and current status. Keep implementation notes factual; distinguish completed work from planned work.

## Project overview

- **Project:** EntryFlow — Event Registration and QR Check-in Management System
- **Target:** Complete and verify all Level 1 requirements before starting Level 2
- **Current phase:** Phase 7 — Level 1 verification and handoff (code checks pass; database verification pending)
- **Last updated:** 2026-11-24
- **Overall status:** In progress; code checks pass, database-backed acceptance checks are pending

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

- [ ] Define Level 1 `events`, `registrations`, and `staff_users` schema.
- [ ] Define relationships, constraints, and indexes.
- [ ] Add database migrations.
- [ ] Add repeatable seed data for at least two events, including one full event.
- [ ] Add a demo staff account with a securely hashed password.
- [ ] Establish shared server-side validation and error handling.
- [ ] Establish structured logging that avoids sensitive information.
- [ ] Establish design tokens for colors, typography, spacing, borders, and states.
- [ ] Organize API handlers, business logic, and database access into clear layers.

### Exit gate

- [ ] A fresh local setup can migrate and seed the database.
- [ ] Data integrity and server-side validation rules are documented.
- [ ] Secrets are managed outside source control.

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
- Added a shared Prisma client and initial design tokens. Clean npm install and Prisma Client generation succeeded. A local `.env` has since been configured; migration, seed, and database connection have not been run or verified.

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

- [ ] Generate a unique, unpredictable ticket code after successful registration.
- [ ] Display attendee name and event details on the ticket page.
- [ ] Generate a QR code containing the ticket code.
- [ ] Build ticket lookup using ticket code plus matching email or mobile.
- [ ] Return a generic not-found response for invalid lookup combinations.
- [ ] Ensure failed lookups do not reveal personal or ticket information.
- [ ] Apply appropriate rate limits to ticket lookup.

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
| — | — | — | — | — |

### Development notes

- Implemented ticket lookup requiring a ticket code plus matching email or mobile, with a generic mismatch response. Added a QR ticket page with attendee/event details and print styles.
- The ticket URL contains the unguessable ticket code and is sensitive. Rate limiting is still needed before public deployment.

## Phase 5 — Staff sign-in and manual check-in

### Development notes

- Added Auth.js Credentials sign-in using bcrypt verification and an eight-hour encrypted JWT session. Staff dashboard access is checked server-side.
- Added manual ticket-code check-in. It verifies event selection, confirmed status, and the Asia/Manila event date, then uses a conditional atomic update so only one concurrent scan is the first check-in; subsequent scans return the original timestamp.
- Added basic response security headers. Login and check-in rate limiting remains outstanding.
- Staff sign-in and check-in have not been run against a configured database.

## Phase 6 — Attendee list and attendance totals

### Development notes

- Added an Organizer-only attendee list with name/code search, 50-row pagination, contact details, ticket status, and registration time. Door Staff sees check-in but not attendee contact records.
- Added registered/capacity, checked-in, and waitlisted counters. These queries have not been verified against seeded data.

## Phase 5 — Staff sign-in and manual check-in

### Work items

- [ ] Build the staff sign-in screen.
- [ ] Hash staff passwords with an established password-hashing library.
- [ ] Implement secure staff sessions and cookies.
- [ ] Protect staff pages and sensitive API operations on the server.
- [ ] Document demo staff credentials safely for local development.
- [ ] Build the event selector for staff.
- [ ] Build manual ticket-code entry with keyboard-scanner support.
- [ ] Allow check-in only for an eligible confirmed ticket for the selected event on event day in Asia/Manila.
- [ ] Make check-in an atomic status transition.
- [ ] Save the original check-in timestamp and staff member.
- [ ] Return clear `Checked in`, `Already checked in` (with original time), or `Invalid ticket` results.
- [ ] Apply appropriate rate limits to sign-in and check-in.

### Exit gate

- [ ] Logged-out users cannot access protected staff operations.
- [ ] Valid check-in records the first check-in exactly once.
- [ ] Repeated scans report the original check-in time.
- [ ] Invalid or ineligible tickets cannot check in.
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

- [ ] Show attendee name, email, mobile, ticket code, registration time, and check-in status.
- [ ] Add search by attendee name or ticket code.
- [ ] Show registered/capacity totals.
- [ ] Show checked-in/registered totals.
- [ ] Restrict attendee information to authorized staff.
- [ ] Ensure totals reflect authoritative database records.
- [ ] Ensure the mobile layout remains usable without horizontal scrolling.

### Exit gate

- [ ] Authorized staff can find attendee records.
- [ ] Search and displayed details are correct.
- [ ] Attendance totals match underlying records.
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
- [ ] Check registration and ticket screens on mobile at 360px.
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
| L1-01 Register on phone viewport | Ticket page appears with QR | Not Run | — |
| L1-02 Scan QR with phone QR app | Decoded content equals ticket code | Not Run | — |
| L1-03 Refresh and retrieve | Correct code and email return ticket | Not Run | — |
| L1-04 Wrong code/contact combination | Ticket not found; no personal information | Not Run | — |
| L1-05 Same email on same event | Second active registration rejected | Not Run | — |
| L1-06 Invalid email and 10-digit phone | Field-level validation errors | Not Run | — |
| L1-07 Seeded full event | Full shown; registration unavailable | Not Run | — |
| L1-08 Staff URL while logged out | Server redirects or blocks access | Not Run | — |
| L1-09 Valid check-in | Checked in plus attendee name | Not Run | — |
| L1-10 Same code scanned again | Already checked in plus original time | Not Run | — |
| L1-11 Made-up/other-event code and attendee totals | Invalid ticket; list and counts correct | Not Run | — |

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
| — | — | None recorded | — | — | — | — |

### Needs improvement

| ID | Phase | Area | Improvement needed | Priority | Status | Notes |
|---|---|---|---|---|---|---|
| I-001 | 3–5 | Abuse protection | Add shared rate limits for ticket lookup, staff sign-in, and check-in before public deployment. | High | Open | Select a shared store suitable for the deployment target. |
| I-002 | All | Verification | Verify PostgreSQL connectivity, apply migration, seed data, and execute database-backed Level 1 acceptance checks. | High | Open | Prisma Client generation, typecheck, lint, 3 unit tests, and production build pass. Local `.env` configured; database connection not tested. |

### Revised

| Date | Phase | Item revised | Previous behavior / decision | Revised behavior / decision | Reason |
|---|---|---|---|---|---|
| — | — | — | — | — | — |

## Development notes

| Date | Phase | Work completed / decision | References / evidence |
|---|---|---|---|
| 2026-11-24 | Phases 1–6 | Created the Next.js/Prisma foundation, attendee registration and ticket flow, staff sign-in, manual check-in, and Organizer attendee list. Clean install and Prisma Client generation passed. Typecheck, lint, all 3 unit tests, and production build passed. PostgreSQL migration, seed, and database-backed acceptance checks remain pending. | Source files in workspace; command outputs in development session |
| 2026-11-24 | Phase 7 | Added the supplied PostgreSQL connection to the ignored local `.env` and generated a local Auth.js secret. Prisma config now loads `.env` for CLI commands. No database connection or migration was run. | `.env` is gitignored; source/config changes need push |
