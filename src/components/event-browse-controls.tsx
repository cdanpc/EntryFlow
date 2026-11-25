"use client";

import { eventDateOptions, eventSortOptions, type EventDateFilter, type EventSort } from "@/lib/event-browse";
import { NavigationIcon } from "@/components/navigation-icon";

export function EventBrowseControls({ query, date, sort }: { query: string; date: EventDateFilter; sort: EventSort }) {
  return <form className="event-browse-controls" role="search" method="get" action="/">
    <div className="event-search"><label className="sr-only" htmlFor="event-search">Search events by title or place</label><input id="event-search" type="search" name="q" placeholder="Search events" defaultValue={query} maxLength={100} /><button type="submit" aria-label="Search events"><NavigationIcon name="search" /></button></div>
    <div className="event-browse-filters">
      <div><label htmlFor="event-date-filter">Date</label><select id="event-date-filter" name="date" defaultValue={date} onChange={(event) => event.currentTarget.form?.requestSubmit()}>{eventDateOptions.map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}</select></div>
      <div><label htmlFor="event-sort">Sort by</label><select id="event-sort" name="sort" defaultValue={sort} onChange={(event) => event.currentTarget.form?.requestSubmit()}>{eventSortOptions.map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}</select></div>
    </div>
  </form>;
}
