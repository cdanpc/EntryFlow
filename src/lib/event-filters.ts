export const eventSortOptions = [{ value: "date-asc", label: "Date: soonest" }, { value: "date-desc", label: "Date: latest" }, { value: "name-asc", label: "Name: A–Z" }, { value: "name-desc", label: "Name: Z–A" }, { value: "spots-asc", label: "Slots: low to high" }, { value: "spots-desc", label: "Slots: high to low" }] as const;
export function parseEventFilters(sort: unknown) {
  return {
    sort: eventSortOptions.find((option) => option.value === sort)?.value ?? "date-asc",
  };
}
export type EventFilters = ReturnType<typeof parseEventFilters>;

type BrowseEvent = { id: string; title: string; startsAt: Date; capacity: number; _count: { registrations: number } };
const remaining = (event: BrowseEvent) => Math.max(0, event.capacity - event._count.registrations);

export function sortEvents<T extends BrowseEvent>(events: readonly T[], filters: EventFilters): T[] {
  return [...events].sort((a, b) => {
    const date = a.startsAt.getTime() - b.startsAt.getTime();
    const name = a.title.localeCompare(b.title, "en", { sensitivity: "base" });
    const slots = remaining(a) - remaining(b);
    const primary = filters.sort === "date-desc" ? -date : filters.sort === "name-asc" ? name : filters.sort === "name-desc" ? -name : filters.sort === "spots-asc" ? slots : filters.sort === "spots-desc" ? -slots : date;
    return primary || date || name || a.id.localeCompare(b.id);
  });
}
