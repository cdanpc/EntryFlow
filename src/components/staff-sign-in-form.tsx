"use client";

import { useActionState } from "react";
import { signInStaff } from "@/app/staff/sign-in/actions";

export function StaffSignInForm() {
  const [state, action, pending] = useActionState(signInStaff, { message: "" });

  return (
    <form action={action} className="registration-form">
      {state.message && <p className="form-alert" role="alert">{state.message}</p>}
      <div className="field">
        <label htmlFor="username">Username</label>
        <input id="username" name="username" autoComplete="username" placeholder="e.g. organizer" required maxLength={80} />
      </div>
      <div className="field">
        <label htmlFor="password">Password</label>
        <input id="password" name="password" type="password" autoComplete="current-password" placeholder="••••••••" required maxLength={256} />
      </div>
      <button className="submit-button" type="submit" disabled={pending}>
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
