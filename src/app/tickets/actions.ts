"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { consumeRateLimit, getRequestClientAddress } from "@/lib/rate-limit";

export type TicketLookupState = { message: string };

export async function findTicket(_state: TicketLookupState, formData: FormData): Promise<TicketLookupState> {
  try {
    const address = await getRequestClientAddress();
    if (!(await consumeRateLimit("ticketLookup", address, 60))) {
      return { message: "Ticket not found. Check the details and try again." };
    }
  } catch (error) {
    console.error("EntryFlow ticket lookup rate limit failed", { errorType: error instanceof Error ? error.name : "UnknownError" });
    return { message: "Ticket lookup is temporarily unavailable. Please try again." };
  }

  const ticketCode = String(formData.get("ticketCode") ?? "").trim();
  const contact = String(formData.get("contact") ?? "").trim();
  const email = contact.toLowerCase();

  if (!/^[A-Za-z0-9_-]{32,64}$/.test(ticketCode) || contact.length < 5 || contact.length > 254) {
    return { message: "Ticket not found. Check the details and try again." };
  }

  try {
    const ticket = await prisma.registration.findFirst({
      where: {
        ticketCode,
        OR: [{ normalizedEmail: email }, { mobile: contact }],
      },
      select: { ticketCode: true },
    });
    if (!ticket) return { message: "Ticket not found. Check the details and try again." };
  } catch (error) {
    console.error("EntryFlow ticket lookup failed", { errorType: error instanceof Error ? error.name : "UnknownError" });
    return { message: "Ticket not found. Check the details and try again." };
  }

  redirect(`/tickets/${ticketCode}`);
}
