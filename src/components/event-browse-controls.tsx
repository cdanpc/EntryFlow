"use client";

import { NavigationIcon } from "@/components/navigation-icon";
import { useEffect, useRef } from "react";
import Link from "next/link";
import { eventSortOptions, type EventFilters } from "@/lib/event-filters";

export function EventBrowseControls({ query, filters }: { query: string; filters: EventFilters }) {
  const details = useRef<HTMLDetailsElement>(null);
  useEffect(() => {
    const outside = (event: PointerEvent) => { if (event.target instanceof Node && !details.current?.contains(event.target) && details.current) details.current.open = false; };
    const escape = (event: KeyboardEvent) => { if (event.key === "Escape" && details.current?.open) { details.current.open = false; details.current.querySelector("summary")?.focus(); } };
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape);
    return () => { document.removeEventListener("pointerdown", outside); document.removeEventListener("keydown", escape); };
  }, []);
  const active = filters.sort !== "date-asc";
  return <form className="event-browse-controls section-heading" role="search" aria-label="Search and filter events" method="get" action="/" onSubmit={() => { if (details.current) details.current.open = false; }}>
    <div className="event-browse-heading"><p className="eyebrow muted">UP NEXT</p><h2 id="events-heading">Events</h2></div>
    <div className="event-search"><button type="submit" aria-label="Search events"><NavigationIcon name="search" /></button><label className="sr-only" htmlFor="event-search">Search events by title or place</label><input id="event-search" type="search" name="q" placeholder="Search events" defaultValue={query} maxLength={100} />
    <details ref={details} className={`event-filter-menu ${active ? "event-filters-active" : ""}`}>
      <summary aria-label={active ? "Event order (applied)" : "Filter event order"} title="Filter"><NavigationIcon name="filter" /></summary>
      <div className="event-filter-panel">
        <label htmlFor="event-order">Order</label><select id="event-order" name="sort" defaultValue={filters.sort}>{eventSortOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select>
        <div className="event-filter-actions"><Link href={query ? `/?q=${encodeURIComponent(query)}` : "/"}>Reset</Link><button type="submit" className="submit-button">Apply</button></div>
      </div>
    </details>
    </div>
  </form>;
}
