import Image from "next/image";
import Link from "next/link";
import { EventStatus } from "@prisma/client";
import { formatCebuDate } from "@/lib/format";
import { eventPhoto } from "@/lib/event-photo";
import { prisma } from "@/lib/prisma";
import { MobileNav } from "@/components/mobile-nav";
import { AttendeeHeader } from "@/components/attendee-header";
import { BrandLogo } from "@/components/brand-logo";

export const dynamic = "force-dynamic";

export default async function EventsPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const query = ((await searchParams).q ?? "").trim().slice(0, 100);
  const events = await prisma.event.findMany({
    where: { status: EventStatus.PUBLISHED, startsAt: { gt: new Date() }, ...(query ? { OR: [{ title: { contains: query, mode: "insensitive" as const } }, { venue: { contains: query, mode: "insensitive" as const } }] } : {}) },
    orderBy: { startsAt: "asc" },
    select: { id: true, title: true, description: true, venue: true, startsAt: true, endsAt: true, capacity: true,
      _count: { select: { registrations: { where: { status: { in: ["CONFIRMED", "CHECKED_IN"] } } } } } },
  });
  return (
    <main className="site-shell attendee-home">
      <AttendeeHeader current="home" />
      <section className="intro" id="events"><p className="eyebrow">CEBU COMMUNITY EVENTS</p><h1>Good things happen<br className="desktop-break" /> when we <span>show up.</span></h1><p className="intro-copy">Find a gathering worth your time. Save your spot in a few simple steps.</p></section>
      <section className="events-section" aria-labelledby="events-heading">
        <div className="section-heading"><div><p className="eyebrow muted">UP NEXT</p><h2 id="events-heading">Events</h2></div><form className="event-search" role="search" method="get" action="/"><label className="sr-only" htmlFor="event-search">Search events by title or place</label><input id="event-search" type="search" name="q" placeholder="Search events" defaultValue={query} maxLength={100} /><button type="submit" aria-label="Search events"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 5 5" /></svg></button></form></div>
        {events.length === 0 ? <div className="empty-state"><h3>{query ? "No matching events" : "No upcoming events yet"}</h3><p>{query ? "Try another event name or place." : "Check back soon."}</p>{query && <Link className="lookup-back" href="/">Clear search</Link>}</div> :
          <div className="event-grid">{events.map((event) => {
            const spots = Math.max(0, event.capacity - event._count.registrations);
            return <Link className="event-card" key={event.id} href={`/events/${event.id}`} aria-label={`${event.title}. ${spots === 0 ? "Fully booked" : `${spots} spots left`}. View event details`}>
              <div className="event-art"><Image src={eventPhoto(event.id)} alt="" fill sizes="(max-width: 760px) 46vw, (max-width: 1100px) 45vw, 360px" /></div>
              <div className="event-content"><p className="event-date">{formatCebuDate(event.startsAt)}</p><h3>{event.title}</h3><p className="event-description">{event.description}</p><p className="venue">{event.venue}</p><div className="event-footer"><span className={`availability ${spots === 0 ? "full" : ""}`}>{spots === 0 ? "Fully booked" : `${spots} spots left`}</span></div></div>
            </Link>;
          })}</div>}
      </section>
      <footer className="footer"><Link className="brand footer-brand" href="/"><BrandLogo />EntryFlow</Link><span>CEBU · PH</span></footer>
      <MobileNav role="attendee" current="home" />
    </main>
  );
}
