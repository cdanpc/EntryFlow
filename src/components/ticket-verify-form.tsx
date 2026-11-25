"use client";

import { useActionState } from "react";
import { checkInTicket, type CheckInState } from "@/app/staff/actions";
import { CheckInResult } from "@/components/check-in-result";

export function TicketVerifyForm({ eventId, ticketCode }: { eventId: string; ticketCode: string }) {
  const action = checkInTicket.bind(null, eventId);
  const [state, formAction, pending] = useActionState(action, { kind: "idle", message: "" } satisfies CheckInState);

  return (
    <form action={formAction} className="checkin-form" aria-busy={pending}>
      <input type="hidden" name="ticketCode" value={ticketCode} />
      <button className="submit-button" type="submit" disabled={pending}>{pending ? "Checking ticket…" : "Check In"}</button>
      <CheckInResult state={state} />
    </form>
  );
}
