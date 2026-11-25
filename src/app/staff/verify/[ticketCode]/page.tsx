import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { formatCebuDateRange } from "@/lib/format";
import { TicketVerifyForm } from "@/components/ticket-verify-form";

export const dynamic = "force-dynamic";

export default async function StaffVerifyPage({ params }: { params: Promise<{ ticketCode: string }> }) {
  const { ticketCode } = await params;
  if (!/^[A-Za-z0-9_-]{32,64}$/.test(ticketCode)) notFound();
  const next = `/staff/verify/${ticketCode}`;
  const session = await auth();
  if (!session?.user?.staffId) redirect(`/staff/sign-in?next=${encodeURIComponent(next)}`);

  const ticket = await prisma.registration.findUnique({
    where: { ticketCode },
    select: { fullName: true, manualCode: true, status: true, eventId: true, event: { select: { title: true, venue: true, startsAt: true, endsAt: true } } },
  });
  if (!ticket) notFound();

  return (
    <main className="detail-shell">
      <header className="detail-topbar"><Link href="/staff" className="back-link">← <span>Check-in desk</span></Link><Link className="brand" href="/"><span className="brand-mark" aria-hidden="true">E</span>entryflow</Link><span className="topbar-spacer" /></header>
      <section className="lookup-panel staff-verify-panel">
        <p className="eyebrow">STAFF VERIFICATION</p>
        <h1>Verify ticket</h1>
        <p className="lookup-intro">Review this ticket before recording entry.</p>
        <dl className="verify-details"><div><dt>Attendee</dt><dd>{ticket.fullName}</dd></div><div><dt>Event</dt><dd>{ticket.event.title}</dd></div><div><dt>Date and time</dt><dd>{formatCebuDateRange(ticket.event.startsAt, ticket.event.endsAt)}</dd></div><div><dt>Venue</dt><dd>{ticket.event.venue}</dd></div><div><dt>Manual code</dt><dd><code>{ticket.manualCode}</code></dd></div><div><dt>Status</dt><dd>{ticket.status === "CHECKED_IN" ? "Already checked in" : ticket.status === "CONFIRMED" ? "Confirmed" : ticket.status}</dd></div></dl>
        <TicketVerifyForm eventId={ticket.eventId} ticketCode={ticketCode} />
      </section>
    </main>
  );
}
