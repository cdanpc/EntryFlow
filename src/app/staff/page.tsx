import Link from "next/link";
import { redirect } from "next/navigation";
import { EventStatus, RegistrationStatus } from "@prisma/client";
import { auth, signOut } from "@/auth";
import { CheckInForm } from "@/components/check-in-form";
import { manilaDateKey, manilaDayBounds } from "@/lib/manila-time";
import { formatCebuDateRange } from "@/lib/format";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function StaffDashboard({ searchParams }: { searchParams: Promise<{ eventId?: string; q?: string; page?: string }> }) {
  const session = await auth();
  if (!session?.user?.staffId) redirect("/staff/sign-in");
  const params = await searchParams;
  const { start: todayStart } = manilaDayBounds();
  const events = await prisma.event.findMany({
    where: { status: { in: [EventStatus.PUBLISHED, EventStatus.CLOSED] }, endsAt: { gte: todayStart } },
    select: { id: true, title: true, startsAt: true, endsAt: true, capacity: true, _count: { select: { registrations: { where: { status: { in: [RegistrationStatus.CONFIRMED, RegistrationStatus.CHECKED_IN] } } } } } },
    orderBy: { startsAt: "asc" }, take: 50,
  });
  const selected = events.find((event) => event.id === params.eventId) ?? events[0];
  const canCheckIn = selected ? manilaDateKey(selected.startsAt) === manilaDateKey(new Date()) : false;
  const search = (params.q ?? "").trim().slice(0, 100);
  const canManageAttendees = session.user.role === "ORGANIZER";
  const pageSize = 50;
  const requestedPage = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1);
  const attendeeWhere = selected ? { eventId: selected.id, ...(search ? { OR: [{ fullName: { contains: search, mode: "insensitive" as const } }, { manualCode: { contains: search, mode: "insensitive" as const } }] } : {}) } : undefined;
  const [attendeeTotal, checkedIn, waitlisted] = selected ? await Promise.all([
    canManageAttendees ? prisma.registration.count({ where: attendeeWhere }) : Promise.resolve(0),
    prisma.registration.count({ where: { eventId: selected.id, status: RegistrationStatus.CHECKED_IN } }),
    prisma.registration.count({ where: { eventId: selected.id, status: RegistrationStatus.WAITLISTED } }),
  ]) : [0, 0, 0];
  const totalPages = Math.max(1, Math.ceil(attendeeTotal / pageSize));
  const currentPage = Math.min(requestedPage, totalPages);
  const registrations = selected && canManageAttendees ? await prisma.registration.findMany({
    where: attendeeWhere,
    select: { id: true, fullName: true, email: true, mobile: true, manualCode: true, status: true, registeredAt: true, checkedInAt: true },
    orderBy: { registeredAt: "desc" }, take: pageSize, skip: (currentPage - 1) * pageSize,
  }) : [];

  async function logout() {
    "use server";
    await signOut({ redirectTo: "/staff/sign-in" });
  }

  return (
    <main className="staff-shell">
      <header className="staff-header"><Link className="brand" href="/"><span className="brand-mark" aria-hidden="true">E</span>entryflow <span className="staff-word">STAFF</span></Link><div className="staff-user"><span>{session.user.name ?? session.user.email}</span><form action={logout}><button type="submit" className="signout-button">Sign out</button></form></div></header>
      <section className="staff-content">
        <div className="staff-title"><div><p className="eyebrow">EVENT OPERATIONS</p><h1>Check-in &amp; attendees</h1></div><span className="role-pill">{session.user.role === "ORGANIZER" ? "Organizer" : "Door Staff"}</span></div>
        <section className="staff-panel"><div className="panel-heading"><p className="eyebrow muted">SELECT EVENT</p><h2>Check-in desk</h2><p>Scan an attendee QR ticket with your camera, or enter the ticket code manually.</p></div>
          {events.length === 0 ? <p className="staff-empty">No events are available for staff operations.</p> : <><form className="event-picker" method="get"><label htmlFor="eventId">Event</label><select id="eventId" name="eventId" defaultValue={selected?.id}>{events.map((event) => <option value={event.id} key={event.id}>{event.title} · {formatCebuDateRange(event.startsAt, event.endsAt)}</option>)}</select><button type="submit">Select</button></form>{selected && <>{!canCheckIn && <p className="checkin-date-notice">This event is scheduled for {new Intl.DateTimeFormat("en-PH", { timeZone: "Asia/Manila", dateStyle: "long" }).format(selected.startsAt)}. You can scan a ticket now, but check-in opens on the event date.</p>}<CheckInForm eventId={selected.id} enabled={canCheckIn} /><div className="staff-stats"><div><span>Registered</span><strong>{selected._count.registrations} / {selected.capacity}</strong></div><div><span>Checked in</span><strong>{checkedIn} / {selected._count.registrations}</strong></div><div><span>Waitlisted</span><strong>{waitlisted}</strong></div></div></>}</>}
        </section>
        {selected && canManageAttendees && <section className="attendee-panel"><div className="attendee-heading"><div><p className="eyebrow muted">ATTENDEE LIST</p><h2>{selected.title}</h2></div><span>{attendeeTotal} {attendeeTotal === 1 ? "attendee" : "attendees"}</span></div><form className="search-form" method="get"><input type="hidden" name="eventId" value={selected.id} /><label className="sr-only" htmlFor="q">Search by name or ticket code</label><input id="q" name="q" placeholder="Search name or ticket code" defaultValue={search} /><button type="submit">Search</button></form>
          <div className="attendee-table-wrap"><table className="attendee-table"><thead><tr><th>Attendee</th><th>Contact</th><th>Ticket code</th><th>Registered</th><th>Status</th></tr></thead><tbody>{registrations.map((record) => <tr key={record.id}><td data-label="Attendee">{record.fullName}</td><td data-label="Contact"><span>{record.email}</span><span>{record.mobile}</span></td><td data-label="Ticket code"><code>{record.manualCode}</code></td><td data-label="Registered">{new Intl.DateTimeFormat("en-PH", { timeZone: "Asia/Manila", dateStyle: "medium", timeStyle: "short" }).format(record.registeredAt)}</td><td data-label="Status"><span className={`table-status table-${record.status.toLowerCase()}`}>{record.status === "CHECKED_IN" ? "Checked in" : record.status === "CONFIRMED" ? "Confirmed" : record.status}</span></td></tr>)}{registrations.length === 0 && <tr><td colSpan={5} className="no-attendees">No registrations match this search.</td></tr>}</tbody></table></div>
          <div className="pagination"><span>Page {currentPage} of {totalPages}</span><div>{currentPage > 1 && <Link href={`/staff?eventId=${selected.id}&q=${encodeURIComponent(search)}&page=${currentPage - 1}`}>Previous</Link>}{currentPage < totalPages && <Link href={`/staff?eventId=${selected.id}&q=${encodeURIComponent(search)}&page=${currentPage + 1}`}>Next</Link>}</div></div>
        </section>}
      </section>
    </main>
  );
}
