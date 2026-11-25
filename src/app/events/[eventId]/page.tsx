import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { EventStatus, RegistrationStatus } from "@prisma/client";
import { RegistrationForm } from "@/components/registration-form";
import { formatCebuDateRange } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { eventPhoto } from "@/lib/event-photo";
import { MobileNav } from "@/components/mobile-nav";
import { AttendeeHeader } from "@/components/attendee-header";

export const dynamic = "force-dynamic";

export default async function EventDetailsPage({ params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = await params;
  const event = await prisma.event.findFirst({
    where: { id: eventId, status: EventStatus.PUBLISHED, startsAt: { gt: new Date() } },
    select: {
      id: true, title: true, description: true, venue: true, startsAt: true, endsAt: true, capacity: true,
      _count: { select: { registrations: { where: { status: { in: [RegistrationStatus.CONFIRMED, RegistrationStatus.CHECKED_IN] } } } } },
    },
  });
  if (!event) notFound();

  const spotsLeft = Math.max(0, event.capacity - event._count.registrations);
  return (
    <main className="site-shell attendee-event-details">
      <AttendeeHeader current="home" />
      <div className="detail-layout">
        <section className="detail-main">
          <Link className="event-detail-back" href="/"><span aria-hidden="true">&lt;</span> Back to events</Link>
          <div className="detail-art"><Image src={eventPhoto(event.id)} alt="Event gathering" fill sizes="(max-width: 760px) 100vw, 680px" /></div>
          <p className="eyebrow detail-eyebrow">EVENT DETAILS</p>
          <h1 className="detail-title">{event.title}</h1>
          <p className="detail-date">{formatCebuDateRange(event.startsAt, event.endsAt)}</p>
          <h2>About this event</h2>
          <p className="detail-description">{event.description}</p>
          <h2>Where</h2>
          <p className="detail-description">{event.venue}</p>
        </section>
        <aside className="registration-panel" aria-labelledby="registration-heading">
          <div className="panel-heading"><p className="eyebrow muted">SAVE YOUR SPOT</p><h2 id="registration-heading">Register for free</h2></div>
          <div className={`spots-callout ${spotsLeft === 0 ? "spots-full" : ""}`}><span>{spotsLeft === 0 ? "This event is fully booked" : `${spotsLeft} ${spotsLeft === 1 ? "spot" : "spots"} remaining`}</span></div>
          {spotsLeft > 0 ? <RegistrationForm eventId={event.id} /> : <div className="full-message"><strong>Registration is full</strong><span>There are no spots left for this event.</span></div>}
          <p className="privacy-note">Your details are used to issue and retrieve your event ticket.</p>
        </aside>
      </div>
      <MobileNav role="attendee" current="home" revealOnScroll />
    </main>
  );
}
