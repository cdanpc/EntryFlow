"use client";

import { useActionState, useState } from "react";
import { signInStaff } from "@/app/staff/sign-in/actions";
import { ButtonSpinner } from "@/components/loading-indicator";

export function StaffSignInForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState(signInStaff, { message: "" });
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form action={action} className="registration-form" aria-busy={pending}>
      <input type="hidden" name="next" value={next} />
      {state.message && <p className="form-alert" role="alert">{state.message}</p>}
      <div className="field">
        <label htmlFor="username">Username</label>
        <input id="username" name="username" autoComplete="username" placeholder="e.g. organizer" required maxLength={80} />
      </div>
      <div className="field">
        <label htmlFor="password">Password</label>
        <div className="password-input-wrap">
          <input id="password" name="password" className="password-input" type={showPassword ? "text" : "password"} autoComplete="current-password" placeholder="••••••••" required maxLength={256} />
          <button
            className="password-toggle"
            type="button"
            aria-label={showPassword ? "Hide password" : "Show password"}
            aria-pressed={showPassword}
            onClick={() => setShowPassword((visible) => !visible)}
          >
            {showPassword ? (
              <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <path d="m3 3 18 18" />
                <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
                <path d="M9.9 5.2A11.2 11.2 0 0 1 12 5c5 0 8.5 4.5 9.5 7-.4 1-1.2 2.1-2.2 3.2" />
                <path d="M6.2 6.2C4.3 7.5 3 9.5 2.5 12c1 2.5 4.5 7 9.5 7 1.1 0 2.1-.2 3-.6" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <path d="M2.5 12s3.5-7 9.5-7 9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7Z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>
        </div>
      </div>
      <button className="submit-button" type="submit" disabled={pending}>
        {pending && <ButtonSpinner />}
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
