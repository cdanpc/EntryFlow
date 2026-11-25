import Image from "next/image";
import Link from "next/link";
import { EventStatus } from "@prisma/client";
import { formatCebuDateRange } from "@/lib/format";
import { eventPhoto } from "@/lib/event-photo";
import { prisma } from "@/lib/prisma";
import { MobileNav } from "@/components/mobile-nav";

export const dynamic = "force-dynamic";

export default async function EventsPage() {
  const events = await prisma.event.findMany({
    where: { status: EventStatus.PUBLISHED, startsAt: { gt: new Date() } },
    orderBy: { startsAt: "asc" },
    select: { id: true, title: true, description: true, venue: true, startsAt: true, endsAt: true, capacity: true,
      _count: { select: { registrations: { where: { status: { in: ["CONFIRMED", "CHECKED_IN"] } } } } } },
  });
  return (
    <main className="site-shell attendee-home">
      <header className="topbar">
        <Link className="brand" href="/" aria-label="EntryFlow home"><span className="brand-mark" aria-hidden="true">E</span>entryflow</Link>
        <nav aria-label="Main navigation"><a className="nav-link active" href="#events">Browse events</a><Link className="nav-link" href="/tickets">Find my ticket</Link></nav>
        <Link className="staff-link" href="/staff/sign-in">Staff sign in</Link>
      </header>
      <section className="intro" id="events"><p className="eyebrow">CEBU COMMUNITY EVENTS</p><h1>Good things happen<br className="desktop-break" /> when we <span>show up.</span></h1><p className="intro-copy">Find a gathering worth your time. Save your spot in a few simple steps.</p></section>
      <section className="events-section" aria-labelledby="events-heading">
        <div className="section-heading"><div><p className="eyebrow muted">UP NEXT</p><h2 id="events-heading">Events</h2></div><span className="event-count">{events.length} {events.length === 1 ? "event" : "events"}</span></div>
        {events.length === 0 ? <div className="empty-state"><h3>No upcoming events yet</h3><p>Check back soon.</p></div> :
          <div className="event-grid">{events.map((event) => {
            const spots = Math.max(0, event.capacity - event._count.registrations);
            return <Link className="event-card" key={event.id} href={`/events/${event.id}`} aria-label={`${event.title}. ${spots === 0 ? "Fully booked" : `${spots} spots left`}. View event details`}>
              <div className="event-art"><Image src={eventPhoto(event.id)} alt="" fill sizes="(max-width: 760px) 46vw, (max-width: 1100px) 45vw, 360px" /></div>
              <div className="event-content"><p className="event-date">{formatCebuDateRange(event.startsAt, event.endsAt)}</p><h3>{event.title}</h3><p className="event-description">{event.description}</p><p className="venue">{event.venue}</p><div className="event-footer"><span className={`availability ${spots === 0 ? "full" : ""}`}>{spots === 0 ? "Fully booked" : `${spots} spots left`}</span></div></div>
            </Link>;
          })}</div>}
      </section>
      <footer className="footer"><Link className="brand footer-brand" href="/"><span className="brand-mark" aria-hidden="true">E</span>entryflow</Link><span>CEBU · PH</span></footer>
      <MobileNav role="attendee" current="home" />
    </main>
  );
}
