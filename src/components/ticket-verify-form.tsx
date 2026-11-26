"use client";

import { useActionState } from "react";
import { checkInTicket, type CheckInState } from "@/app/staff/actions";
import { CheckInResult } from "@/components/check-in-result";
import { ButtonSpinner, LoadingOverlay } from "@/components/loading-indicator";

export function TicketVerifyForm({ eventId, ticketCode }: { eventId: string; ticketCode: string }) {
  const action = checkInTicket.bind(null, eventId);
  const [state, formAction, pending] = useActionState(action, { kind: "idle", message: "" } satisfies CheckInState);

  return (
    <><form action={formAction} className="checkin-form" aria-busy={pending}>
      <input type="hidden" name="ticketCode" value={ticketCode} />
      {state.kind !== "success" && state.kind !== "repeat" && <button className="submit-button" type="submit" disabled={pending}>{pending && <ButtonSpinner />}{pending ? "Checking ticket…" : "Check In"}</button>}
      <CheckInResult state={state} />
    </form>{pending && <LoadingOverlay label="Checking in…" description="Verifying ticket status." />}</>
  );
}
