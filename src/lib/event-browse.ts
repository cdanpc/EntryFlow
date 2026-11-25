import { manilaDayBounds } from "@/lib/manila-time";

export const eventDateOptions = [
  { value: "all", label: "All upcoming" },
  { value: "today", label: "Today" },
  { value: "week", label: "Next 7 days" },
  { value: "month", label: "Next 30 days" },
] as const;
export const eventSortOptions = [
  { value: "date-asc", label: "Date: soonest" },
  { value: "date-desc", label: "Date: latest" },
  { value: "name-asc", label: "Name: A–Z" },
  { value: "name-desc", label: "Name: Z–A" },
  { value: "spots-desc", label: "Spots: highest" },
  { value: "spots-asc", label: "Spots: lowest" },
] as const;
export type EventDateFilter = typeof eventDateOptions[number]["value"];
export type EventSort = typeof eventSortOptions[number]["value"];

export function parseEventFilters(date: unknown, sort: unknown): { date: EventDateFilter; sort: EventSort } {
  return {
    date: eventDateOptions.find((option) => option.value === date)?.value ?? "all",
    sort: eventSortOptions.find((option) => option.value === sort)?.value ?? "date-asc",
  };
}

export function eventStartBounds(filter: EventDateFilter, now = new Date()): { gt: Date; lt?: Date } {
  if (filter === "all") return { gt: now };
  const { start } = manilaDayBounds(now);
  const days = filter === "today" ? 1 : filter === "week" ? 7 : 30;
  return { gt: now, lt: new Date(start.getTime() + days * 24 * 60 * 60 * 1000) };
}

type BrowseEvent = { id: string; title: string; startsAt: Date; capacity: number; _count: { registrations: number } };
const spots = (event: BrowseEvent) => Math.max(0, event.capacity - event._count.registrations);

export function sortEvents<T extends BrowseEvent>(events: readonly T[], sort: EventSort): T[] {
  return [...events].sort((a, b) => {
    const date = a.startsAt.getTime() - b.startsAt.getTime();
    const name = a.title.localeCompare(b.title, "en", { sensitivity: "base" });
    const available = spots(a) - spots(b);
    const primary = sort === "date-desc" ? -date : sort === "name-asc" ? name : sort === "name-desc" ? -name : sort === "spots-asc" ? available : sort === "spots-desc" ? -available : date;
    return primary || date || name || a.id.localeCompare(b.id);
  });
}
