import type { CheckInState } from "@/app/staff/actions";

export function CheckInResult({ state }: { state: CheckInState }) {
  if (state.kind === "idle") return null;
  return <div className={`checkin-result result-${state.kind}`} role="status" aria-live="polite"><strong>{state.message}</strong>{state.attendee && <span>{state.attendee}</span>}{state.time && <span>{state.time}</span>}</div>;
}
