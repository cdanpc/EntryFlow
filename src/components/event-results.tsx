import Image from "next/image";
import Link from "next/link";
import { EventStatus } from "@prisma/client";
import { formatCebuDate } from "@/lib/format";
import { eventPhoto } from "@/lib/event-photo";
import { prisma } from "@/lib/prisma";
import { sortEvents, type EventFilters } from "@/lib/event-filters";

export async function EventResults({ query, filters }: { query: string; filters: EventFilters }) {
  const results = await prisma.event.findMany({
    where: { status: EventStatus.PUBLISHED, startsAt: { gt: new Date() }, ...(query ? { OR: [{ title: { contains: query, mode: "insensitive" as const } }, { venue: { contains: query, mode: "insensitive" as const } }] } : {}) },
    orderBy: { startsAt: "asc" },
    select: { id: true, title: true, description: true, venue: true, startsAt: true, endsAt: true, capacity: true,
      _count: { select: { registrations: { where: { status: { in: ["CONFIRMED", "CHECKED_IN"] } } } } } },
  });
  const events = sortEvents(results, filters);
  if (!events.length) return <div className="empty-state"><h3>{query ? "No matching events" : "No upcoming events yet"}</h3><p>{query ? "Try another event name or place." : "Check back soon."}</p>{query && <Link className="lookup-back" href="/">Clear search</Link>}</div>;
  return <div className="event-grid">{events.map((event) => {
    const spots = Math.max(0, event.capacity - event._count.registrations);
    return <Link className="event-card" key={event.id} href={`/events/${event.id}`} aria-label={`${event.title}. ${spots === 0 ? "Fully booked" : `${spots} spots left`}. View event details`}>
      <div className="event-art"><Image src={eventPhoto(event.id)} alt="" fill sizes="(max-width: 760px) 46vw, (max-width: 1100px) 45vw, 360px" /></div>
      <div className="event-content"><p className="event-date">{formatCebuDate(event.startsAt)}</p><h3>{event.title}</h3><p className="event-description">{event.description}</p><p className="venue">{event.venue}</p><div className="event-footer"><span className={`availability ${spots === 0 ? "full" : ""}`}>{spots === 0 ? "Fully booked" : `${spots} spots left`}</span></div></div>
    </Link>;
  })}</div>;
}
