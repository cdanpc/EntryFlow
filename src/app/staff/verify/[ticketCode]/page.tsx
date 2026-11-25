import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { formatCebuDateRange } from "@/lib/format";
import { TicketVerifyForm } from "@/components/ticket-verify-form";
import { StaffHeader } from "@/components/staff-header";
import { MobileNav } from "@/components/mobile-nav";

export const dynamic = "force-dynamic";

export default async function StaffVerifyPage({ params, searchParams }: { params: Promise<{ ticketCode: string }>; searchParams: Promise<{ eventId?: string }> }) {
  const { ticketCode } = await params;
  if (!/^[A-Za-z0-9_-]{32,64}$/.test(ticketCode)) notFound();
  const next = `/staff/verify/${ticketCode}`;
  const session = await auth();
  if (!session?.user?.staffId) redirect(`/staff/sign-in?next=${encodeURIComponent(next)}`);

  const ticket = await prisma.registration.findUnique({
    where: { ticketCode },
    select: { fullName: true, manualCode: true, status: true, checkedInAt: true, eventId: true, event: { select: { title: true, venue: true, startsAt: true, endsAt: true } } },
  });
  if (!ticket) notFound();
  const contextEventId = (await searchParams).eventId || ticket.eventId;

  return (
    <main className="detail-shell">
      <StaffHeader role={session.user.role} eventId={contextEventId} />
      <section className="lookup-panel staff-verify-panel">
        <p className="eyebrow">STAFF VERIFICATION</p>
        <h1>Verify ticket</h1>
        <p className="lookup-intro">Review this ticket before recording entry.</p>
        <dl className="verify-details"><div><dt>Attendee</dt><dd>{ticket.fullName}</dd></div><div><dt>Event</dt><dd>{ticket.event.title}</dd></div><div><dt>Date and time</dt><dd>{formatCebuDateRange(ticket.event.startsAt, ticket.event.endsAt)}</dd></div><div><dt>Venue</dt><dd>{ticket.event.venue}</dd></div><div><dt>Manual code</dt><dd><code>{ticket.manualCode}</code></dd></div><div><dt>Status</dt><dd><span className={`ticket-status status-${ticket.status.toLowerCase()}`}>{ticket.status === "CHECKED_IN" ? "Already checked in" : ticket.status === "CONFIRMED" ? "Confirmed" : ticket.status}</span></dd></div>{ticket.checkedInAt && <div><dt>Checked in at</dt><dd>{new Intl.DateTimeFormat("en-PH", { timeZone: "Asia/Manila", dateStyle: "medium", timeStyle: "short" }).format(ticket.checkedInAt)}</dd></div>}</dl>
        {ticket.status === "CONFIRMED" && <TicketVerifyForm eventId={ticket.eventId} ticketCode={ticketCode} />}
      </section>
      <MobileNav role="staff" current="scan" eventId={contextEventId} />
    </main>
  );
}
