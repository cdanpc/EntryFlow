# EntryFlow

Event Registration and QR Check-in Management System for the CubeTech intern activity.

> **Assessment status:** Level 1 implementation in progress. The application code has not yet been run against an installed dependency set and PostgreSQL database, so no acceptance checks are marked as passed. No public deployment is available yet.

## Assessment details

- **Required level:** Level 1
- **Level reached:** In progress; not yet verified
- **Deadline:** December 2, 2026
- **Submission:** Share the accessible Git repository, this README, and a deployed link with `admin@sales-cubetech.cloud`.
- **Repository:** [github.com/cdanpc/EntryFlow](https://github.com/cdanpc/EntryFlow)
- **Deployment:** Not deployed yet

## Implemented so far

The following features have source code, but are **not acceptance-tested** yet:

- Responsive public event list and event details, with Cebu-local date/time display and availability counts.
- Guest registration form with server-side name, email, and Philippine mobile validation.
- PostgreSQL/Prisma data model, migration, and demo seed data for two events and one full event.
- Duplicate active registration prevention and a transaction that locks the event while checking capacity.
- Cryptographically random ticket codes, QR ticket view, and ticket lookup by code plus matching email or mobile.
- Auth.js Credentials staff sign-in using bcrypt password hashes and an eight-hour encrypted session.
- Staff check-in for a selected event on its date in Asia/Manila, with atomic first check-in and repeat-scan result.
- Organizer attendee list with search and pagination; Door Staff does not receive attendee contact details.
- Basic security response headers and no-store caching for staff and ticket pages.
- Unit tests for registration input validation (written, not run).

## Level 1 acceptance checklist

Status is **Not Run** until the check is executed and evidence is recorded. Implementation alone does not count as a pass.

| ID | Acceptance check | Result | Evidence / notes |
|---|---|---|---|
| L1-01 | Register at phone viewport; ticket page displays QR | Not Run | Dependencies and database not set up |
| L1-02 | Scan QR with a phone QR reader; decoded content equals ticket code | Not Run | — |
| L1-03 | Refresh and retrieve ticket with correct code and email | Not Run | — |
| L1-04 | Wrong code/contact combination returns not found without personal information | Not Run | — |
| L1-05 | Same email cannot register twice for one event | Not Run | — |
| L1-06 | Invalid email and 10-digit mobile show field-level errors | Not Run | — |
| L1-07 | Seeded full event is shown as full and registration is unavailable | Not Run | — |
| L1-08 | Staff URL while logged out is redirected or blocked server-side | Not Run | — |
| L1-09 | Valid check-in reports Checked in and attendee name | Not Run | — |
| L1-10 | Repeated scan reports Already checked in with original time | Not Run | — |
| L1-11 | Made-up/other-event ticket is invalid; attendee list and totals are correct | Not Run | — |

**Do not describe Level 1 as complete until every required check passes and genuine evidence is recorded.** Track implementation, bugs, improvements, and revisions in [`EntryFlow_Level_1_Development_Tracker.md`](EntryFlow_Level_1_Development_Tracker.md).

## Technology

- Next.js App Router, React, TypeScript
- PostgreSQL and Prisma
- Auth.js Credentials and bcryptjs
- Zod validation
- QRCode generation
- Vitest unit tests

The project plan recommends Next.js + TypeScript, PostgreSQL, Prisma, Auth.js Credentials, Zod, QR generation, Vitest, and HTTPS hosting. Verify package compatibility during setup; these were proposed project choices, not technologies mandated by the assessment.

## Requirements

- Node.js 20 or newer
- npm
- PostgreSQL

## Local setup

1. Create a PostgreSQL database named `entryflow` (or choose another database and update the connection string).
2. Copy `.env.example` to `.env` and set a working database URL, a long random `AUTH_SECRET`, and a local-only `DEMO_STAFF_PASSWORD` of at least 12 characters.

   PowerShell:

   ```powershell
   Copy-Item .env.example .env
   ```

3. Install packages and generate the Prisma client:

   ```powershell
   npm.cmd install
   npm.cmd run db:generate
   ```

4. Apply the migration and seed local demo data:

   ```powershell
   npm.cmd run db:migrate
   npm.cmd run db:seed
   ```

5. Start the development server:

   ```powershell
   npm.cmd run dev
   ```

6. Open the local URL printed by Next.js. The seeded staff username is `organizer`; its password is the value configured as `DEMO_STAFF_PASSWORD`. The seed stores only a bcrypt hash. Do not use this demo password in production.

## Checks

Run these after installing dependencies and configuring PostgreSQL:

```powershell
npm.cmd run typecheck
npm.cmd run lint
npm.cmd test
npm.cmd run build
```

The current workspace has not completed dependency installation. Typecheck and test commands were attempted and could not start because `tsc` and `vitest` were unavailable. Migration, seed, and build are also unverified.

## Data model

- `events`: published events, venue, schedule, capacity, and status.
- `registrations`: attendee details, normalized email, unique ticket code, status, and check-in fields.
- `staff_users`: username, bcrypt password hash, and role.

The database migration enforces valid event schedules and positive capacity. A partial unique index prevents more than one active registration for the same normalized email and event. Registration checks current capacity within a transaction while locking the event row.

## Known limitations and remaining work

- Install dependencies, create/configure PostgreSQL, generate Prisma Client, apply migrations, and seed data.
- Run typecheck, lint, unit tests, build, then all Level 1 acceptance checks; record actual evidence.
- Add shared rate limiting for staff login, ticket lookup, and check-in before public deployment.
- Confirm camera behavior is out of Level 1 scope; camera scanning, waitlists, event management, cancellation, CSV, email, and Level 3 features are not implemented.
- The QR ticket URL contains the unguessable ticket code and must be treated as sensitive.
- No deployment URL exists yet. Publish only after verification, then add the HTTPS URL here.
- Level 2 and Level 3 have not been started.

## Project files

- [`EntryFlow_Project_Documentation_v1.docx`](EntryFlow_Project_Documentation_v1.docx): project requirements, business rules, and acceptance matrix.
- [`EntryFlow_Master_Development_Standards.txt`](EntryFlow_Master_Development_Standards.txt): engineering and UI standards.
- [`EntryFlow_Level_1_Development_Tracker.md`](EntryFlow_Level_1_Development_Tracker.md): phase checklist, bugs, improvements, revisions, and test evidence.
