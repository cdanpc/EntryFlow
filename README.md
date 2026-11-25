# EntryFlow

Event Registration and QR Check-in Management System for the CubeTech intern activity.

## Supabase connections on Vercel

Use Supabase transaction pooling for serverless application traffic: port `6543` with `pgbouncer=true&connection_limit=1` in the URL query parameters. Append using `&` if the URL already has a query string. Keep credentials private in environment settings.

The application runtime adapts legacy `*.pooler.supabase.com:5432` session URLs to transaction pooling and defaults each Prisma instance to one connection. Explicit connection limits and other URL options are preserved. Local, direct, and unrelated database URLs are unchanged. Prisma CLI and migrations continue using the original environment configuration; only the application client applies this adaptation. Each process reuses its Prisma client.

This addresses `EMAXCONNSESSION` / session-mode max-client errors when serverless instances exhaust the small session pool. A production deployment of the fix is required for existing Vercel functions to use it. See [Supabase's Prisma connection guidance](https://supabase.com/docs/guides/database/prisma).

## Staff attendee workspace

Staff land on Attendees. Choose an event, then search by partial name or ticket code. Matching is case-insensitive and updates after a 300 ms pause. All, Awaiting, and Checked in filters combine with search. Clear resets the query; paging shows 50 results at a time. Organizer All also includes waitlisted and cancelled registrations.

The dock links to Attendees, Scan, and Activity; only the current page is highlighted. Selected events travel in navigation URLs, with a tab-local fallback. Activity shows the event's latest check-ins, rather than a personal staff audit log. The former `/staff/search` URL redirects to Attendees.

On mobile and tablet, directory rows show a page-aware number, attendee name, and status. Tapping a row opens the protected attendee details. Summary counters, contact details, codes, and timestamps are omitted from these compact lists; full details remain on the detail screen, with contacts restricted to Organizers. Desktop keeps its table and summary. Page navigation and directory requests use a centered three-dot circular loader, with a static indicator when reduced motion is requested.

The search endpoint authenticates staff, scopes queries to a published/closed event, and returns `private, no-store` responses. Door Staff receive names, manual codes, statuses, and operational timestamps; only Organizers receive contacts. QR secrets are excluded. Loading, no-match, session-expiry, and retry states are included. No schema migration is required. Device/camera and responsive visual review remain pending.

> **Assessment status:** Level 1 implementation is in progress. The tracker records 9 of 11 acceptance checks as passed. The phone QR-reader payload comparison and six-character ticket lookup still need to be recorded.

> **Latest change:** The user reports that built-in camera scanning and manual check-in work. The Level 1 document checks still require separate evidence for QR payload decoding and refreshed ticket retrieval.

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
- PostgreSQL/Prisma data model, migration, and demo seed data for two events, one full event, and Organizer and Door Staff accounts.
- Duplicate active registration prevention and a transaction that locks the event while checking capacity.
- A six-character, database-unique manual ticket code plus a separate cryptographically random ticket secret. The QR opens the ticket URL containing that secret. Ticket lookup requires the manual code and matching email or mobile; staff check-in accepts the short code, QR secret, or ticket URL.
- Auth.js Credentials staff sign-in using bcrypt password hashes, an encrypted session, a server-enforced 30-minute idle timeout, and an eight-hour absolute limit.
- Staff camera QR scanning and editable six-character manual-code check-in for a selected event on its date in Asia/Manila, with atomic first check-in and repeat-scan result. Camera scans submit the private QR token without showing it in the manual field. An active staff session scanning with a normal phone camera goes directly to protected ticket review and explicitly checks in; an expired session sees the attendee page with a staff sign-in link.
- Organizer attendee list with search and pagination; Door Staff does not receive attendee contact details.
- PostgreSQL-backed, cross-instance rate limits for ticket lookup, staff sign-in, and check-in. Rate-limit subjects are HMAC-hashed before storage.
- Basic security response headers and no-store caching for staff and ticket pages.
- Unit tests for registration input validation (3 tests passing).

## Level 1 acceptance checklist

Mark a check as passed only after executing it and recording evidence. Implementation alone does not count as a pass.

| ID | Acceptance check | Result | Evidence / notes |
|---|---|---|---|
| L1-01 | Register at phone viewport; ticket page displays QR | Pass | At a 360px emulated phone viewport, registration completed and the confirmed ticket QR fit without horizontal page overflow. |
| L1-02 | Scan QR with any phone QR app; decoded content contains the ticket URL and private token | Not Run | The QR now opens a ticket URL for ordinary phone cameras. Retest the new QR and confirm staff scanning still works; the planning document's exact-code wording differs from this URL behavior. |
| L1-03 | Refresh and retrieve ticket with six-character code and email | Not Run | Previous lookup verification used the former long code; recheck the new manual-code flow. |
| L1-04 | Wrong code/contact combination returns not found without personal information | Pass | Correct test ticket code with a mismatched contact returned only “Ticket not found. Check the details and try again.” |
| L1-05 | Same email cannot register twice for one event | Pass | Repeating the same test registration was rejected with “This email already has an active registration for the event.” |
| L1-06 | Invalid email and 10-digit mobile show field-level errors | Pass | Submitting an invalid email and 10-digit mobile returned separate email and mobile field errors. |
| L1-07 | Seeded full event is shown as full and registration is unavailable | Pass | Production page showed Fully booked; event details showed Registration is full without the form |
| L1-08 | Staff URL while logged out is redirected or blocked server-side | Pass | Unauthenticated `/staff` returned HTTP 307 to staff sign-in |
| L1-09 | Valid check-in reports Checked in and attendee name | Pass | Organizer signed in; same-day test attendee returned “Checked in” with the expected attendee name and time. |
| L1-10 | Repeated scan reports Already checked in with original time | Pass | Repeated the same ticket scan; UI returned “Already checked in” and the original check-in time. |
| L1-11 | Made-up/other-event ticket is invalid; attendee list and totals are correct | Pass | Made-up ticket returned “Invalid ticket”; attendee list showed one checked-in record and totals were 1/10 registered, 1/1 checked in, 0 waitlisted. |

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
2. Copy `.env.example` to `.env` and set a working database URL, a long random `AUTH_SECRET`, `DEMO_ORGANIZER_PASSWORD`, and `DEMO_DOOR_STAFF_PASSWORD`.

   PowerShell:

   ```powershell
   Copy-Item .env.example .env
   ```

3. Install packages and generate the Prisma client:

   ```powershell
   npm.cmd ci
   npm.cmd run db:generate
   ```

4. Apply the committed migrations and seed demo data:

   ```powershell
   npm.cmd exec -- prisma migrate deploy
   npm.cmd run db:seed
   ```

The `postinstall` and `build` scripts regenerate Prisma Client from `prisma/schema.prisma`, so deployments include the current database fields before typechecking and production build.

5. Start the development server:

   ```powershell
   npm.cmd run dev
   ```

6. Open the local URL printed by Next.js. The demo usernames are `organizer` (Organizer role) and `staff` (Door Staff role). Their passwords come from `DEMO_ORGANIZER_PASSWORD` and `DEMO_DOOR_STAFF_PASSWORD`. The seed stores only bcrypt hashes. Use demo passwords only for assessment and replace them before real use.

For an existing database, seed only the two accounts without changing demo events:

```powershell
npm.cmd run db:seed:staff
```

Pushing code to GitHub does not run this command on Vercel. Set the two password variables in the environment that runs the seed, and run the command once against the database configured for the Vercel deployment.

For a temporary same-day check-in event, run `npm.cmd run db:seed:today-demo` against the deployment database. Register a new attendee for that event before 23:59 Asia/Manila, then select the event in the Door Staff dashboard and scan its ticket QR. The event is date-specific; rerun the command on another day if needed.

The ticket QR uses `APP_URL` when configured, otherwise the Vercel deployment URL or the local request host. Set `APP_URL` to the site's canonical HTTPS origin if using a custom domain. An ordinary phone camera opens the ticket page; the protected staff scanner reads its token for check-in.

## Checks

Run these after installing dependencies and configuring PostgreSQL:

```powershell
npm.cmd run typecheck
npm.cmd run lint
npm.cmd test
npm.cmd run build
```

Verified in the current workspace:

- `npm.cmd run db:generate` — passed.
- `npm.cmd run typecheck` — passed.
- `npm.cmd run lint` — passed with no warnings.
- `npm.cmd test` — passed (1 test file, 3 tests).
- `npm.cmd run build` — passed.
- `npm.cmd exec -- prisma migrate status` — passed; database schema is up to date.
- `npm.cmd exec -- prisma migrate deploy` — passed; initial migration applied.
- `npm.cmd exec -- prisma migrate deploy` — passed; PostgreSQL rate-limit bucket migration applied.
- `npm.cmd run db:generate` — passed after adding the manual ticket code field.
- `npm.cmd exec -- prisma migrate deploy` — passed; manual codes were backfilled and the unique constraint applied.
- Latest short-code revision — `npm.cmd run typecheck` and `npm.cmd run build` passed after fixing the Vercel-reported ticket lookup scope error. Unit and acceptance tests for short-code behavior remain pending.
- `npm.cmd run db:seed:staff` — passed; Organizer and Door Staff accounts seeded in the configured database.
- Local production smoke check — event list, event details, ticket lookup, staff sign-in, and Auth.js session returned HTTP 200; unauthenticated staff dashboard returned HTTP 307.
- Local production browser acceptance checks — successful registration displayed a confirmed ticket and QR; matching email retrieved it; a mismatched contact showed a generic not-found message; duplicate registration was rejected. The disposable registration was deleted and its absence confirmed.
- Local production browser checks — refreshing a ticket URL retained the confirmed ticket and QR; invalid email and 10-digit mobile returned field-specific messages. The temporary registration was removed and its absence confirmed.
- Local production browser check at a 360px emulated viewport — registration completed, and the ticket page displayed the QR without horizontal page overflow. The temporary attendee record was removed and its absence confirmed.
- PostgreSQL rate-limit smoke check — two requests were allowed and the third was denied for a temporary test subject; its bucket was removed.
- Local production staff acceptance checks — Organizer sign-in succeeded; valid check-in, repeated scan, made-up code rejection, attendee list, and totals matched the temporary fixture. The attendee and same-day event were removed, the browser was signed out, and the demo credential was not saved in the browser.

Database connection and initial setup are verified. The remaining Level 1 acceptance checks are the phone QR-reader payload comparison and refreshed lookup with the six-character code. Registration/check-in concurrency and Organizer-versus-Door-Staff data visibility still need direct verification. Tablet layouts and real-device keyboard/camera behavior also need broader QA.

## Data model

- `events`: published events, venue, schedule, capacity, and status.
- `registrations`: attendee details, normalized email, a unique six-character manual code, a separate unique QR secret, status, and check-in fields.
- `staff_users`: username, bcrypt password hash, and role.

The database migration enforces valid event schedules and positive capacity. A partial unique index prevents more than one active registration for the same normalized email and event. Registration checks current capacity within a transaction while locking the event row.

## Known limitations and remaining work

- Run the remaining Level 1 acceptance checks and record actual evidence.
- Configure the deployment proxy to overwrite and provide a trusted `x-real-ip` header (or trusted `x-forwarded-for`) so address-based rate limits use the actual client address; verify the chosen host's behavior before public launch.
- Built-in camera scanning is implemented but is a Level 3 feature in the project plan. Waitlists, event management, cancellation, CSV, email, and the remaining Level 3 features are not implemented.
- The QR ticket URL contains the unguessable ticket code and must be treated as sensitive.
- The six-character manual code is not the QR bearer secret. Public ticket retrieval also requires the registered email or mobile; staff check-in requires an authenticated staff session and selected event.
- Current limits: ticket lookup 60 per address per 15 minutes; staff sign-in 30 per address and 10 per username per 15 minutes; check-in 120 per staff member per minute.
- No deployment URL exists yet. Publish only after verification, then add the HTTPS URL here.
- Level 2 and Level 3 have not been started.

## Project files

- [`EntryFlow_Project_Documentation_v1.docx`](EntryFlow_Project_Documentation_v1.docx): project requirements, business rules, and acceptance matrix.
- [`EntryFlow_Master_Development_Standards.txt`](EntryFlow_Master_Development_Standards.txt): engineering and UI standards.
- [`EntryFlow_Level_1_Development_Tracker.md`](EntryFlow_Level_1_Development_Tracker.md): phase checklist, bugs, improvements, revisions, and test evidence.
