import Link from "next/link";
import { signOut } from "@/auth";

export function StaffHeader({ role }: { role: "ORGANIZER" | "DOOR_STAFF" }) {
  async function logout() {
    "use server";
    await signOut({ redirectTo: "/staff/sign-in" });
  }

  return <header className="staff-header">
    <Link className="brand" href="/staff" aria-label="EntryFlow staff home"><span className="brand-mark" aria-hidden="true">E</span>EntryFlow</Link>
    <details className="staff-account">
      <summary>{role === "ORGANIZER" ? "Organizer" : "Staff"}<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg></summary>
      <div className="staff-account-menu"><form action={logout}><button type="submit">Sign out</button></form></div>
    </details>
  </header>;
}
