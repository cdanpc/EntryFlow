"use client";

import { useActionState } from "react";
import { findTicket, type TicketLookupState } from "@/app/tickets/actions";

export function TicketLookupForm() {
  const [state, formAction, pending] = useActionState(findTicket, { message: "" } satisfies TicketLookupState);
  return (
    <form action={formAction} className="registration-form" noValidate>
      {state.message && <p className="form-alert" role="alert">{state.message}</p>}
      <div className="field"><label htmlFor="ticketCode">Ticket code</label><input id="ticketCode" name="ticketCode" autoComplete="off" required maxLength={64} /></div>
      <div className="field"><label htmlFor="contact">Email or mobile number</label><input id="contact" name="contact" autoComplete="email" required maxLength={254} /><span className="field-hint">Use the email or mobile number from registration.</span></div>
      <button className="submit-button" type="submit" disabled={pending}>{pending ? "Finding ticket…" : "Find my ticket"}<span aria-hidden="true">→</span></button>
    </form>
  );
}
