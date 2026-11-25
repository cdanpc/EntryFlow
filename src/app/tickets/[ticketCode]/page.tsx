import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import QRCode from "qrcode";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatCebuDateRange } from "@/lib/format";
import { auth } from "@/auth";
import { MobileNav } from "@/components/mobile-nav";

export const metadata: Metadata = { robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function TicketPage({ params }: { params: Promise<{ ticketCode: string }> }) {
  const { ticketCode } = await params;
  if (!/^[A-Za-z0-9_-]{32,64}$/.test(ticketCode)) notFound();
  const staffSession = await auth();
  if (staffSession?.user?.staffId) redirect(`/staff/verify/${ticketCode}`);

  const ticket = await prisma.registration.findUnique({
    where: { ticketCode },
    select: { ticketCode: true, manualCode: true, fullName: true, status: true, registeredAt: true, event: { select: { title: true, venue: true, startsAt: true, endsAt: true } } },
  });
  if (!ticket) notFound();

  const vercelHost = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;
  const localHost = (await headers()).get("host") ?? "localhost:3000";
  const baseUrl = process.env.APP_URL || (vercelHost ? `https://${vercelHost}` : `http://${localHost}`);
  const ticketUrl = new URL(`/tickets/${ticket.ticketCode}`, baseUrl).toString();
  const qrData = await QRCode.toDataURL(ticketUrl, { errorCorrectionLevel: "M", margin: 2, width: 384, color: { dark: "#102B3D", light: "#FFFFFF" } });
  const statusLabel = ticket.status === "CHECKED_IN" ? "Already checked in" : ticket.status === "CONFIRMED" ? "Confirmed" : ticket.status === "CANCELLED" ? "Cancelled" : "Waitlisted";
  const verifyPath = `/staff/verify/${ticketCode}`;
  const staffHref = `/staff/sign-in?next=${encodeURIComponent(verifyPath)}`;
  return (
    <main className="ticket-page">
      <header className="detail-topbar ticket-topbar"><Link className="brand" href="/"><span className="brand-mark" aria-hidden="true">E</span>EntryFlow</Link></header>
      <article className="ticket-card">
        <div className="ticket-top"><p className="eyebrow">YOUR ENTRYFLOW TICKET</p><span className={`ticket-status status-${ticket.status.toLowerCase()}`}>{statusLabel}</span></div>
        <h1>{ticket.event.title}</h1>
        <p className="ticket-datetime">{formatCebuDateRange(ticket.event.startsAt, ticket.event.endsAt)}</p>
        <div className="ticket-divider" />
        <div className="ticket-body"><div className="ticket-attendee"><span className="eyebrow muted">ATTENDEE</span><strong>{ticket.fullName}</strong><span>{ticket.event.venue}</span></div><div className="ticket-qr"><Image src={qrData} width={224} height={224} alt={`QR ticket for ${ticket.event.title}`} unoptimized /><span>Show this QR code at the entrance</span></div></div>
        <div className="ticket-code"><span className="eyebrow muted">MANUAL TICKET CODE</span><code>{ticket.manualCode}</code></div>
        <p className="ticket-help">Show the QR code at the entrance, or give the six-character code to staff. You can also find your ticket again with this code and your registration email or mobile.</p>
        <Link className="lookup-back" href="/tickets">Find another ticket</Link>
        <div className="ticket-staff-link"><Link href={staffHref}>Staff: Sign in to verify</Link></div>
      </article>
      <MobileNav role="attendee" current="search" desktopOnly />
    </main>
  );
}
