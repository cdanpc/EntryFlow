"use client";

import { NavigationIcon } from "@/components/navigation-icon";

export function EventBrowseControls({ query }: { query: string }) {
  return <form className="event-browse-controls" role="search" method="get" action="/">
    <div className="event-search"><label className="sr-only" htmlFor="event-search">Search events by title or place</label><input id="event-search" type="search" name="q" placeholder="Search events" defaultValue={query} maxLength={100} /><button type="submit" aria-label="Search events"><NavigationIcon name="search" /></button></div>
  </form>;
}
