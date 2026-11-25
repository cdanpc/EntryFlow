import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";

export function AttendeeHeader({ current }: { current: "home" | "tickets" }) {
  return <header className="topbar attendee-header">
    <Link className="brand" href="/" aria-label="EntryFlow home"><BrandLogo />EntryFlow</Link>
    <nav aria-label="Main navigation">
      <Link className={`nav-link ${current === "home" ? "active" : ""}`} href="/" aria-current={current === "home" ? "page" : undefined}>Browse events</Link>
      <Link className={`nav-link ${current === "tickets" ? "active" : ""}`} href="/tickets" aria-current={current === "tickets" ? "page" : undefined}>Find my ticket</Link>
    </nav>
    <Link className="staff-link" href="/staff/sign-in">Sign in</Link>
  </header>;
}
