"use client";
export default function StaffError({ reset }: { reset: () => void }) { return <main className="staff-content"><h1>Unable to load staff page</h1><p>Please try again.</p><button className="submit-button" onClick={reset}>Retry</button></main>; }
