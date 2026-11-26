import { Suspense } from "react";
import Link from "next/link";
import { MobileNav } from "@/components/mobile-nav";
import { AttendeeHeader } from "@/components/attendee-header";
import { BrandLogo } from "@/components/brand-logo";
import { EventBrowseControls } from "@/components/event-browse-controls";
import { parseEventFilters } from "@/lib/event-filters";
import { EventResults } from "@/components/event-results";
import { EventCardSkeletons } from "@/components/loading-indicator";

export const dynamic = "force-dynamic";

export default async function EventsPage({ searchParams }: { searchParams: Promise<{ q?: string; sort?: string }> }) {
  const params = await searchParams;
  const query = (typeof params.q === "string" ? params.q : "").trim().slice(0, 100);
  const filters = parseEventFilters(params.sort);
  return (
    <main className="site-shell attendee-home">
      <AttendeeHeader current="home" />
      <section className="intro" id="events"><p className="eyebrow">CEBU COMMUNITY EVENTS</p><h1>Good things happen<br className="desktop-break" /> when we <span>show up.</span></h1><p className="intro-copy">Find a gathering worth your time. Save your spot in a few simple steps.</p></section>
      <section className="events-section" aria-labelledby="events-heading">
        <EventBrowseControls key={`${query}:${filters.sort}`} query={query} filters={filters} />
        <Suspense key={`${query}:${filters.sort}`} fallback={<EventCardSkeletons />}><EventResults query={query} filters={filters} /></Suspense>
      </section>
      <footer className="footer"><Link className="brand footer-brand" href="/"><BrandLogo />EntryFlow</Link><span>CEBU · PH</span></footer>
      <MobileNav role="attendee" current="home" />
    </main>
  );
}
