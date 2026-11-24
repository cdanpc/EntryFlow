"use client";

import { useActionState } from "react";
import { registerForEvent, type RegistrationActionState } from "@/app/events/actions";

const initialState: RegistrationActionState = { errors: {}, message: "" };

export function RegistrationForm({ eventId }: { eventId: string }) {
  const action = registerForEvent.bind(null, eventId);
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="registration-form" noValidate>
      {state.message && <p className="form-alert" role="alert">{state.message}</p>}
      <div className="field">
        <label htmlFor="fullName">Full name</label>
        <input id="fullName" name="fullName" autoComplete="name" maxLength={120} required aria-invalid={Boolean(state.errors.fullName)} aria-describedby={state.errors.fullName ? "fullName-error" : undefined} />
        {state.errors.fullName && <span className="field-error" id="fullName-error">{state.errors.fullName}</span>}
      </div>
      <div className="field">
        <label htmlFor="email">Email address</label>
        <input id="email" name="email" type="email" autoComplete="email" maxLength={254} required aria-invalid={Boolean(state.errors.email)} aria-describedby={state.errors.email ? "email-error" : undefined} />
        {state.errors.email && <span className="field-error" id="email-error">{state.errors.email}</span>}
      </div>
      <div className="field">
        <label htmlFor="mobile">Mobile number</label>
        <input id="mobile" name="mobile" type="tel" inputMode="numeric" autoComplete="tel-national" placeholder="09XX XXX XXXX" maxLength={11} required aria-invalid={Boolean(state.errors.mobile)} aria-describedby={state.errors.mobile ? "mobile-error" : undefined} />
        {state.errors.mobile && <span className="field-error" id="mobile-error">{state.errors.mobile}</span>}
      </div>
      <button className="submit-button" type="submit" disabled={pending}>
        {pending ? "Saving your spot…" : "Register for this event"}
      </button>
      <p className="form-footnote">A QR ticket will be issued after registration.</p>
    </form>
  );
}
