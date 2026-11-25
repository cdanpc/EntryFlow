import { manilaDayBounds } from "@/lib/manila-time";

export const eventDateOptions = [{ value: "all", label: "All upcoming" }, { value: "today", label: "Today" }, { value: "week", label: "Next 7 days" }, { value: "month", label: "Next 30 days" }] as const;
export const eventSortOptions = [{ value: "date-asc", label: "Date: soonest" }, { value: "date-desc", label: "Date: latest" }, { value: "name-asc", label: "Name: A–Z" }, { value: "name-desc", label: "Name: Z–A" }, { value: "spots-asc", label: "Slots: low to high" }, { value: "spots-desc", label: "Slots: high to low" }] as const;
export const eventSlotOptions = [{ value: "any", label: "Any slots" }, { value: "0-100", label: "0–100 slots remaining" }] as const;

export function parseEventFilters(date: unknown, sort: unknown, slots: unknown) {
  return {
    date: eventDateOptions.find((option) => option.value === date)?.value ?? "all",
    sort: eventSortOptions.find((option) => option.value === sort)?.value ?? "date-asc",
    slots: eventSlotOptions.find((option) => option.value === slots)?.value ?? "any",
  };
}
export type EventFilters = ReturnType<typeof parseEventFilters>;

export function eventStartBounds(filter: EventFilters["date"], now = new Date()): { gt: Date; lt?: Date } {
  if (filter === "all") return { gt: now };
  const { start } = manilaDayBounds(now);
  const days = filter === "today" ? 1 : filter === "week" ? 7 : 30;
  return { gt: now, lt: new Date(start.getTime() + days * 24 * 60 * 60 * 1000) };
}

type BrowseEvent = { id: string; title: string; startsAt: Date; capacity: number; _count: { registrations: number } };
const remaining = (event: BrowseEvent) => Math.max(0, event.capacity - event._count.registrations);

export function filterAndSortEvents<T extends BrowseEvent>(events: readonly T[], filters: EventFilters): T[] {
  return events.filter((event) => filters.slots === "any" || remaining(event) <= 100).sort((a, b) => {
    const date = a.startsAt.getTime() - b.startsAt.getTime();
    const name = a.title.localeCompare(b.title, "en", { sensitivity: "base" });
    const slots = remaining(a) - remaining(b);
    const primary = filters.sort === "date-desc" ? -date : filters.sort === "name-asc" ? name : filters.sort === "name-desc" ? -name : filters.sort === "spots-asc" ? slots : filters.sort === "spots-desc" ? -slots : date;
    return primary || date || name || a.id.localeCompare(b.id);
  });
}
