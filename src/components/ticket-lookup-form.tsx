"use client";

import { useActionState } from "react";
import { findTicket, type TicketLookupState } from "@/app/tickets/actions";
import { ButtonSpinner } from "@/components/loading-indicator";

export function TicketLookupForm() {
  const [state, formAction, pending] = useActionState(findTicket, { message: "" } satisfies TicketLookupState);

  return (
    <form action={formAction} className="registration-form" noValidate aria-busy={pending}>
      {state.message && <p className="form-alert" role="alert">{state.message}</p>}
      <div className="field">
        <label htmlFor="ticketCode">Ticket code</label>
        <input id="ticketCode" name="ticketCode" autoComplete="off" placeholder="e.g. ABC123" required maxLength={64} />
      </div>
      <div className="field">
        <label htmlFor="contact">Email or mobile number</label>
        <input id="contact" name="contact" autoComplete="email" placeholder="alex@example.com or 09XX XXX XXXX" required maxLength={254} />
      </div>
      <button className="submit-button" type="submit" disabled={pending}>
        {pending && <ButtonSpinner />}
        {pending ? "Finding ticket…" : "Find my ticket"}
      </button>
    </form>
  );
}
