import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { formatCebuDateRange } from "@/lib/format";
import { MobileNav } from "@/components/mobile-nav";
import { StaffHeader } from "@/components/staff-header";

export const dynamic = "force-dynamic";

export default async function StaffAttendeePage({ params }: { params: Promise<{ registrationId: string }> }) {
  const session = await auth();
  if (!session?.user?.staffId) redirect("/staff/sign-in");
  const { registrationId } = await params;
  const record = await prisma.registration.findUnique({ where: { id: registrationId }, select: { eventId: true, fullName: true, ...(session.user.role === "ORGANIZER" ? { email: true, mobile: true } : {}), manualCode: true, status: true, registeredAt: true, checkedInAt: true, event: { select: { title: true, startsAt: true, endsAt: true, venue: true } } } });
  if (!record) notFound();
  const time = (date: Date) => new Intl.DateTimeFormat("en-PH", { timeZone: "Asia/Manila", dateStyle: "medium", timeStyle: "short" }).format(date);
  return <main className="staff-shell"><StaffHeader role={session.user.role} eventId={record.eventId} /><section className="staff-detail-card"><p className="eyebrow">ATTENDEE DETAILS</p><h1>{record.fullName}</h1><span className={`ticket-status status-${record.status.toLowerCase()}`}>{record.status === "CHECKED_IN" ? "Checked in" : record.status === "CONFIRMED" ? "Awaiting check-in" : record.status}</span><dl className="verify-details"><div><dt>Event</dt><dd>{record.event.title}</dd></div><div><dt>When</dt><dd>{formatCebuDateRange(record.event.startsAt, record.event.endsAt)}</dd></div><div><dt>Venue</dt><dd>{record.event.venue}</dd></div><div><dt>Ticket code</dt><dd><code>{record.manualCode}</code></dd></div><div><dt>Registered</dt><dd>{time(record.registeredAt)}</dd></div>{record.checkedInAt && <div><dt>Checked in</dt><dd>{time(record.checkedInAt)}</dd></div>}{session.user.role === "ORGANIZER" && <><div><dt>Email</dt><dd>{record.email}</dd></div><div><dt>Mobile</dt><dd>{record.mobile}</dd></div></>}</dl></section><MobileNav role="staff" current="home" eventId={record.eventId} /></main>;
}
