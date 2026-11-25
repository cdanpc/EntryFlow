"use server";

import { redirect } from "next/navigation";
import { auth } from "@/auth";
import type { CheckInState } from "@/app/staff/actions";
import { prisma } from "@/lib/prisma";
import { consumeRateLimit } from "@/lib/rate-limit";

/** Manual entry follows the same protected review step as camera scanning. */
export async function findStaffTicket(eventId: string, _state: CheckInState, formData: FormData): Promise<CheckInState> {
  const session = await auth();
  if (!session?.user?.staffId) redirect("/staff/sign-in");
  const manualCode = String(formData.get("manualCode") ?? "").trim().toUpperCase();
  let ticketCode: string;
  try {
    if (!(await consumeRateLimit("checkIn", `staff:${session.user.staffId}`, 120))) return { kind: "error", message: "Too many attempts. Wait a moment, then try again." };
    if (!/^[0-9A-HJKMNP-TV-Z]{6}$/.test(manualCode)) return { kind: "invalid", message: "Enter the six-character ticket code." };
    const ticket = await prisma.registration.findFirst({
      where: { manualCode, ...(eventId ? { eventId } : {}), event: { status: { in: ["PUBLISHED", "CLOSED"] } } },
      select: { ticketCode: true },
    });
    if (!ticket) return { kind: "invalid", message: "Ticket not found. Check the code and selected event." };
    ticketCode = ticket.ticketCode;
  } catch (error) {
    console.error("EntryFlow staff ticket lookup failed", { errorType: error instanceof Error ? error.name : "UnknownError" });
    return { kind: "error", message: "Ticket lookup is unavailable. Try again." };
  }
  redirect(`/staff/verify/${ticketCode}${eventId ? `?eventId=${encodeURIComponent(eventId)}` : ""}`);
}
