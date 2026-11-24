"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { RegistrationStatus } from "@prisma/client";
import { auth } from "@/auth";
import { manilaDateKey } from "@/lib/manila-time";
import { prisma } from "@/lib/prisma";
import { consumeRateLimit } from "@/lib/rate-limit";

export type CheckInState = { kind: "idle" | "success" | "repeat" | "invalid" | "error"; message: string; attendee?: string; time?: string };

export async function checkInTicket(eventId: string, _state: CheckInState, formData: FormData): Promise<CheckInState> {
  const session = await auth();
  if (!session?.user?.staffId) redirect("/staff/sign-in");
  try {
    if (!(await consumeRateLimit("checkIn", `staff:${session.user.staffId}`, 120))) {
      return { kind: "error", message: "Too many check-in attempts. Wait a moment, then try again." };
    }
  } catch (error) {
    console.error("EntryFlow check-in rate limit failed", { errorType: error instanceof Error ? error.name : "UnknownError" });
    return { kind: "error", message: "Check-in is temporarily unavailable. Try again." };
  }

  const ticketCode = String(formData.get("ticketCode") ?? "").trim();
  if (!/^[A-Za-z0-9_-]{32,64}$/.test(ticketCode)) return { kind: "invalid", message: "Invalid ticket. Check the code and selected event." };

  try {
    const ticket = await prisma.registration.findFirst({
      where: { ticketCode, eventId },
      select: { id: true, fullName: true, status: true, checkedInAt: true, event: { select: { startsAt: true } } },
    });
    if (!ticket) return { kind: "invalid", message: "Invalid ticket. Check the code and selected event." };
    if (ticket.status === RegistrationStatus.CHECKED_IN && ticket.checkedInAt) {
      return { kind: "repeat", message: "Already checked in", attendee: ticket.fullName, time: new Intl.DateTimeFormat("en-PH", { timeZone: "Asia/Manila", dateStyle: "medium", timeStyle: "short" }).format(ticket.checkedInAt) };
    }
    if (ticket.status !== RegistrationStatus.CONFIRMED || manilaDateKey(ticket.event.startsAt) !== manilaDateKey(new Date())) {
      return { kind: "invalid", message: "Invalid ticket. Check-in is available for confirmed tickets on the event day." };
    }

    const checkedInAt = new Date();
    const changed = await prisma.registration.updateMany({
      where: { id: ticket.id, status: RegistrationStatus.CONFIRMED },
      data: { status: RegistrationStatus.CHECKED_IN, checkedInAt, checkedInBy: session.user.staffId },
    });
    if (changed.count === 1) {
      revalidatePath("/staff");
      return { kind: "success", message: "Checked in", attendee: ticket.fullName, time: new Intl.DateTimeFormat("en-PH", { timeZone: "Asia/Manila", dateStyle: "medium", timeStyle: "short" }).format(checkedInAt) };
    }

    const latest = await prisma.registration.findUnique({ where: { id: ticket.id }, select: { status: true, checkedInAt: true } });
    if (latest?.status === RegistrationStatus.CHECKED_IN && latest.checkedInAt) {
      return { kind: "repeat", message: "Already checked in", attendee: ticket.fullName, time: new Intl.DateTimeFormat("en-PH", { timeZone: "Asia/Manila", dateStyle: "medium", timeStyle: "short" }).format(latest.checkedInAt) };
    }
    return { kind: "invalid", message: "Invalid ticket. Check the code and selected event." };
  } catch (error) {
    console.error("EntryFlow check-in failed", { eventId, errorType: error instanceof Error ? error.name : "UnknownError" });
    return { kind: "error", message: "Check-in could not be completed. Try again." };
  }
}
