import Link from "next/link";
import { TicketLookupForm } from "@/components/ticket-lookup-form";

export default function FindTicketPage() {
  return (
    <main className="detail-shell">
      <header className="detail-topbar"><Link href="/" className="back-link">← <span>Browse events</span></Link><Link className="brand" href="/"><span className="brand-mark" aria-hidden="true">E</span>entryflow</Link><span className="topbar-spacer" /></header>
      <section className="lookup-panel">
        <p className="eyebrow">TICKET LOOKUP</p><h1>Find your ticket.</h1><p className="lookup-intro">Enter the ticket code and the email or mobile number used when you registered.</p>
        <TicketLookupForm />
      </section>
    </main>
  );
}
