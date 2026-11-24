"use server";

import { randomBytes } from "node:crypto";
import { Prisma, EventStatus, RegistrationStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { registrationSchema } from "@/lib/registration";

export type RegistrationActionState = {
  message: string;
  errors: Partial<Record<"fullName" | "email" | "mobile", string>>;
};

export async function registerForEvent(eventId: string, _previousState: RegistrationActionState, formData: FormData): Promise<RegistrationActionState> {
  const parsed = registrationSchema.safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    mobile: formData.get("mobile"),
  });

  if (!parsed.success) {
    const errors: RegistrationActionState["errors"] = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0];
      if ((field === "fullName" || field === "email" || field === "mobile") && !errors[field]) errors[field] = issue.message;
    }
    return { message: "Review the highlighted fields and try again.", errors };
  }

  const attendee = parsed.data;
  const ticketCode = randomBytes(32).toString("base64url");

  try {
    await prisma.$transaction(async (tx) => {
      const locked = await tx.$queryRaw<{ id: string; status: string; startsAt: Date; endsAt: Date; capacity: number }[]>`
        SELECT "id", "status", "startsAt", "endsAt", "capacity" FROM "events" WHERE "id" = ${eventId} FOR UPDATE
      `;
      const event = locked[0];
      const now = new Date();
      if (!event || event.status !== EventStatus.PUBLISHED || event.startsAt <= now) {
        throw new Error("EVENT_UNAVAILABLE");
      }

      const existing = await tx.registration.findFirst({
        where: { eventId, normalizedEmail: attendee.email, status: { in: [RegistrationStatus.CONFIRMED, RegistrationStatus.CHECKED_IN] } },
        select: { id: true },
      });
      if (existing) throw new Error("DUPLICATE_REGISTRATION");

      const occupied = await tx.registration.count({ where: { eventId, status: { in: [RegistrationStatus.CONFIRMED, RegistrationStatus.CHECKED_IN] } } });
      if (occupied >= event.capacity) throw new Error("EVENT_FULL");

      await tx.registration.create({
        data: {
          eventId,
          fullName: attendee.fullName,
          email: attendee.email,
          normalizedEmail: attendee.email,
          mobile: attendee.mobile,
          ticketCode,
        },
      });
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
  } catch (error) {
    if (error instanceof Error && error.message === "DUPLICATE_REGISTRATION") return { message: "This email already has an active registration for the event.", errors: {} };
    if (error instanceof Error && error.message === "EVENT_FULL") return { message: "This event just filled up. Please choose another event.", errors: {} };
    if (error instanceof Error && error.message === "EVENT_UNAVAILABLE") return { message: "This event is no longer accepting registrations.", errors: {} };
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") return { message: "This email already has an active registration for the event.", errors: {} };
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2034") return { message: "Another registration was being processed. Please try again.", errors: {} };
    console.error("EntryFlow registration failed", { eventId, errorType: error instanceof Error ? error.name : "UnknownError" });
    return { message: "We could not complete registration. Please try again.", errors: {} };
  }

  revalidatePath("/");
  revalidatePath(`/events/${eventId}`);
  redirect(`/tickets/${ticketCode}`);
}
