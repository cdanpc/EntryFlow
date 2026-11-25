import { AttendeeHeader } from "@/components/attendee-header";
import { TicketLookupForm } from "@/components/ticket-lookup-form";
import { MobileNav } from "@/components/mobile-nav";

export default function FindTicketPage() {
  return (
    <main className="site-shell attendee-ticket-search">
      <AttendeeHeader current="tickets" />
      <section className="lookup-panel">
        <h1>Find your ticket</h1><p className="lookup-intro">Enter your ticket code and registration email or mobile number.</p>
        <TicketLookupForm />
      </section>
      <MobileNav role="attendee" current="search" />
    </main>
  );
}
