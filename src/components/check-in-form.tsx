"use client";

import { useActionState } from "react";
import { checkInTicket, type CheckInState } from "@/app/staff/actions";

export function CheckInForm({ eventId, enabled }: { eventId: string; enabled: boolean }) {
  const action = checkInTicket.bind(null, eventId);
  const [state, formAction, pending] = useActionState(action, { kind: "idle", message: "" } satisfies CheckInState);
  return (
    <form action={formAction} className="checkin-form">
      <label htmlFor="ticketCode">Ticket code</label>
      <div className="checkin-entry"><input id="ticketCode" name="ticketCode" autoComplete="off" placeholder="Scan or enter ticket code" required disabled={!enabled || pending} /><button type="submit" disabled={!enabled || pending}>{pending ? "Checking…" : "Check in"}</button></div>
      {!enabled && <p className="field-hint">Check-in is available on the event date in Cebu.</p>}
      {state.kind !== "idle" && <div className={`checkin-result result-${state.kind}`} role="status" aria-live="polite"><strong>{state.message}</strong>{state.attendee && <span>{state.attendee}</span>}{state.time && <span>{state.time}</span>}</div>}
    </form>
  );
}
