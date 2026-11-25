import Link from "next/link";
import { TicketLookupForm } from "@/components/ticket-lookup-form";
import { MobileNav } from "@/components/mobile-nav";

export default function FindTicketPage() {
  return (
    <main className="detail-shell">
      <header className="detail-topbar"><Link className="brand" href="/"><span className="brand-mark" aria-hidden="true">E</span>EntryFlow</Link></header>
      <section className="lookup-panel">
        <h1>Find your ticket</h1><p className="lookup-intro">Enter your ticket code and registration email or mobile number.</p>
        <TicketLookupForm />
      </section>
      <MobileNav role="attendee" current="search" />
    </main>
  );
}
