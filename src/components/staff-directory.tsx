import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getStaffAttendees } from "@/lib/staff-attendees";
import { StaffHeader } from "@/components/staff-header";
import { StaffAttendees } from "@/components/staff-attendees";
export type StaffDirectoryParams = { eventId?: string; q?: string; status?: string; page?: string };
export async function StaffDirectory({ params, activity = false }: { params: StaffDirectoryParams; activity?: boolean }) {
  const session = await auth();
  if (!session?.user?.staffId) redirect("/staff/sign-in");
  const events = await prisma.event.findMany({ where: { status: { in: ["PUBLISHED", "CLOSED"] } }, select: { id: true, title: true, startsAt: true }, orderBy: { startsAt: "desc" }, take: 50 });
  const selected = events.find((event) => event.id === params.eventId) ?? events[0];
  const organizer = session.user.role === "ORGANIZER";
  const query = (params.q ?? "").slice(0, 100);
  const status = ["awaiting", "checked"].includes(params.status ?? "") ? params.status! : "";
  const data = selected ? await getStaffAttendees(selected.id, query, status, Number(params.page ?? 1), organizer, activity) : null;
  return <main className="staff-shell staff-directory"><StaffHeader role={session.user.role} eventId={selected?.id} /><div className="staff-content"><StaffAttendees key={`${selected?.id}:${query}:${status}`} events={events.map(({ id, title, startsAt }) => ({ id, title, startsAt: startsAt.toISOString() }))} eventId={selected?.id ?? ""} initial={data} initialQuery={query} initialStatus={status} organizer={organizer} activity={activity} /></div></main>;
}
