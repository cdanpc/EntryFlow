import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import QRCode from "qrcode";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatCebuDateRange } from "@/lib/format";

export const metadata: Metadata = { robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function TicketPage({ params }: { params: Promise<{ ticketCode: string }> }) {
  const { ticketCode } = await params;
  if (!/^[A-Za-z0-9_-]{32,64}$/.test(ticketCode)) notFound();

  const ticket = await prisma.registration.findUnique({
    where: { ticketCode },
    select: { ticketCode: true, fullName: true, status: true, registeredAt: true, event: { select: { title: true, venue: true, startsAt: true, endsAt: true } } },
  });
  if (!ticket) notFound();

  const qrData = await QRCode.toDataURL(ticket.ticketCode, { errorCorrectionLevel: "M", margin: 1, width: 256, color: { dark: "#102B3D", light: "#FFFFFF" } });
  const statusLabel = ticket.status === "CHECKED_IN" ? "Already checked in" : ticket.status === "CONFIRMED" ? "Confirmed" : ticket.status === "CANCELLED" ? "Cancelled" : "Waitlisted";
  return (
    <main className="ticket-page">
      <header className="detail-topbar ticket-topbar"><Link href="/" className="back-link">← <span>Browse events</span></Link><Link className="brand" href="/"><span className="brand-mark" aria-hidden="true">E</span>entryflow</Link><span className="topbar-spacer" /></header>
      <article className="ticket-card">
        <div className="ticket-top"><p className="eyebrow">YOUR ENTRYFLOW TICKET</p><span className={`ticket-status status-${ticket.status.toLowerCase()}`}>{statusLabel}</span></div>
        <h1>{ticket.event.title}</h1>
        <p className="ticket-datetime">{formatCebuDateRange(ticket.event.startsAt, ticket.event.endsAt)}</p>
        <div className="ticket-divider" />
        <div className="ticket-body"><div className="ticket-attendee"><span className="eyebrow muted">ATTENDEE</span><strong>{ticket.fullName}</strong><span>{ticket.event.venue}</span></div><div className="ticket-qr"><Image src={qrData} width={192} height={192} alt={`QR ticket for ${ticket.event.title}`} unoptimized /><span>Show this QR code at the entrance</span></div></div>
        <div className="ticket-code"><span className="eyebrow muted">TICKET CODE</span><code>{ticket.ticketCode}</code></div>
        <p className="ticket-help">Keep this page available when you arrive. You can also find your ticket again with your ticket code and registration email or mobile.</p>
        <Link className="lookup-back" href="/tickets">Find another ticket</Link>
      </article>
    </main>
  );
}
