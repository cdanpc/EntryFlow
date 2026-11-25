import { Prisma, RegistrationStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export function attendeeWhere(eventId: string, query: string, status: string, organizer: boolean): Prisma.RegistrationWhereInput {
  return {
    eventId,
    status: status === "checked" ? RegistrationStatus.CHECKED_IN : status === "awaiting" ? RegistrationStatus.CONFIRMED : organizer ? undefined : { in: [RegistrationStatus.CONFIRMED, RegistrationStatus.CHECKED_IN] },
    ...(query.trim() ? { OR: [{ fullName: { contains: query.trim().slice(0, 100), mode: "insensitive" } }, { manualCode: { contains: query.trim().slice(0, 100), mode: "insensitive" } }] } : {}),
  };
}

export async function getStaffAttendees(eventId: string, query: string, status: string, page: number, organizer: boolean, activity = false) {
  const where = attendeeWhere(eventId, query, activity ? "checked" : status, organizer);
  const total = await prisma.registration.count({ where });
  const pages = Math.max(1, Math.ceil(total / 50));
  const currentPage = Math.min(Math.max(1, Number.isFinite(page) ? Math.floor(page) : 1), pages);
  const rows = await prisma.registration.findMany({
    where,
    select: { id: true, fullName: true, manualCode: true, status: true, registeredAt: true, checkedInAt: true, ...(organizer ? { email: true, mobile: true } : {}) },
    orderBy: activity ? [{ checkedInAt: "desc" }, { id: "desc" }] : [{ registeredAt: "desc" }, { id: "desc" }],
    take: 50, skip: (currentPage - 1) * 50,
  });
  const [registered, checkedIn, waitlisted] = await Promise.all([
    prisma.registration.count({ where: { eventId, status: { in: [RegistrationStatus.CONFIRMED, RegistrationStatus.CHECKED_IN] } } }),
    prisma.registration.count({ where: { eventId, status: RegistrationStatus.CHECKED_IN } }),
    prisma.registration.count({ where: { eventId, status: RegistrationStatus.WAITLISTED } }),
  ]);
  return { rows: rows.map((row) => ({ ...row, registeredAt: row.registeredAt.toISOString(), checkedInAt: row.checkedInAt?.toISOString() ?? null })), total, pages, page: currentPage, registered, checkedIn, waitlisted };
}

export type StaffAttendeeData = Awaited<ReturnType<typeof getStaffAttendees>>;
