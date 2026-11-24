import Link from "next/link";
import { EventStatus } from "@prisma/client";
import { formatCebuDateRange } from "@/lib/format";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function EventsPage() {
  const events = await prisma.event.findMany({
    where: { status: EventStatus.PUBLISHED, startsAt: { gt: new Date() } },
    orderBy: { startsAt: "asc" },
    select: {
      id: true,
      title: true,
      description: true,
      venue: true,
      startsAt: true,
      endsAt: true,
      capacity: true,
      _count: { select: { registrations: { where: { status: { in: ["CONFIRMED", "CHECKED_IN"] } } } } },
    },
  });

  return (
    <main className="site-shell">
      <header className="topbar">
        <Link className="brand" href="/" aria-label="EntryFlow home"><span className="brand-mark" aria-hidden="true">E</span>entryflow</Link>
        <nav aria-label="Main navigation"><a className="nav-link active" href="#events">Browse events</a><Link className="nav-link" href="/tickets">Find my ticket</Link></nav>
        <Link className="staff-link" href="/staff/sign-in">Staff sign in <span aria-hidden="true">↗</span></Link>
      </header>

      <section className="intro" id="events">
        <p className="eyebrow"><span className="live-dot" /> CEBU COMMUNITY EVENTS</p>
        <h1>Good things happen<br className="desktop-break" /> when we <span>show up.</span></h1>
        <p className="intro-copy">Find a gathering worth your time. Save your spot in a few simple steps.</p>
      </section>

      <section className="events-section" aria-labelledby="events-heading">
        <div className="section-heading"><div><p className="eyebrow muted">UP NEXT</p><h2 id="events-heading">Find your next event</h2></div><span className="event-count">{events.length} {events.length === 1 ? "event" : "events"}</span></div>
        {events.length === 0 ? (
          <div className="empty-state"><span className="empty-icon" aria-hidden="true">○</span><h3>No upcoming events yet</h3><p>Check back soon for the next community gathering.</p></div>
        ) : (
          <div className="event-grid">
            {events.map((event, index) => {
              const registered = event._count.registrations;
              const spots = Math.max(0, event.capacity - registered);
              const full = spots === 0;
              return (
                <article className="event-card" key={event.id}>
                  <div className={`event-art art-${index % 3}`} aria-hidden="true"><span className="art-orbit orbit-one" /><span className="art-orbit orbit-two" /><span className="art-coordinate">{String(index + 1).padStart(2, "0")} / CEB</span><span className="art-symbol">{index % 2 === 0 ? "e" : "↗"}</span></div>
                  <div className="event-content">
                    <p className="event-date">{formatCebuDateRange(event.startsAt, event.endsAt)}</p>
                    <h3>{event.title}</h3>
                    <p className="event-description">{event.description}</p>
                    <p className="venue"><span className="pin-icon" aria-hidden="true">⌖</span>{event.venue}</p>
                    <div className="event-footer"><span className={`availability ${full ? "full" : ""}`}>{full ? "Fully booked" : `${spots} spots left`}</span><Link className={`button ${full ? "button-disabled" : ""}`} aria-disabled={full} tabIndex={full ? -1 : undefined} href={full ? "#events" : `/events/${event.id}`}>{full ? "Fully booked" : "View event"}</Link></div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <footer className="footer"><Link className="brand footer-brand" href="/"><span className="brand-mark" aria-hidden="true">E</span>entryflow</Link><span>Made for showing up.</span><span>CEBU · PH</span></footer>
    </main>
  );
}
