import Link from "next/link";
import { redirect } from "next/navigation";
import { EventStatus, RegistrationStatus } from "@prisma/client";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { MobileNav } from "@/components/mobile-nav";
import { StaffHeader } from "@/components/staff-header";

export const dynamic = "force-dynamic";

export default async function StaffSearchPage({ searchParams }: { searchParams: Promise<{ eventId?: string; q?: string }> }) {
  const session = await auth();
  if (!session?.user?.staffId) redirect("/staff/sign-in");
  const params = await searchParams;
  const events = await prisma.event.findMany({ where: { status: { in: [EventStatus.PUBLISHED, EventStatus.CLOSED] } }, select: { id: true, title: true }, orderBy: { startsAt: "asc" }, take: 50 });
  const selected = events.find((event) => event.id === params.eventId) ?? events[0];
  const q = (params.q ?? "").trim().slice(0, 100);
  const results = selected && q ? await prisma.registration.findMany({ where: { eventId: selected.id, status: { in: [RegistrationStatus.CONFIRMED, RegistrationStatus.CHECKED_IN] }, OR: [{ fullName: { contains: q, mode: "insensitive" } }, { manualCode: { contains: q.toUpperCase() } }] }, select: { id: true, fullName: true, status: true, checkedInAt: true }, orderBy: { registeredAt: "desc" }, take: 30 }) : [];
  return <main className="staff-shell"><StaffHeader role={session.user.role} /><section className="staff-search-page"><h1>Find an attendee</h1><form method="get" className="staff-search-fields"><label htmlFor="searchEvent">Event</label><select id="searchEvent" name="eventId" defaultValue={selected?.id}>{events.map((event) => <option value={event.id} key={event.id}>{event.title}</option>)}</select><label htmlFor="attendeeQuery">Name or ticket code</label><div><input id="attendeeQuery" name="q" type="search" placeholder="Search attendee" defaultValue={q} maxLength={100} autoComplete="off" /><button type="submit">Search</button></div></form>{q ? <div className="mobile-attendee-list">{results.map((record) => <Link key={record.id} href={`/staff/attendees/${record.id}`}><span>{record.fullName}</span><span className={record.status === RegistrationStatus.CHECKED_IN ? "row-checked" : "row-awaiting"}>{record.status === RegistrationStatus.CHECKED_IN ? "✓ Checked in" : "○ Awaiting"}</span></Link>)}{results.length === 0 && <p className="staff-empty">No attendee found for this event.</p>}</div> : <p className="search-empty">Enter a name or the six-character ticket code.</p>}</section><MobileNav role="staff" current="search" /></main>;
}
