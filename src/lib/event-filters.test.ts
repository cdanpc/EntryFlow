import { describe, expect, it } from "vitest";
import { eventStartBounds, filterAndSortEvents, parseEventFilters, type EventFilters } from "@/lib/event-filters";

describe("compact event filters", () => {
  it("falls back safely for invalid/repeated parameters", () => {
    expect(parseEventFilters(["today"], "invalid", -1)).toEqual({ date: "all", sort: "date-asc", slots: "any" });
    expect(parseEventFilters("week", "name-asc", "0-100")).toEqual({ date: "week", sort: "name-asc", slots: "0-100" });
  });
  it("uses Cebu midnight boundaries without including past starts", () => {
    const now = new Date("2026-11-25T16:30:00Z");
    expect(eventStartBounds("all", now)).toEqual({ gt: now });
    expect(eventStartBounds("today", now)).toEqual({ gt: now, lt: new Date("2026-11-26T16:00:00Z") });
    expect(eventStartBounds("week", now).lt).toEqual(new Date("2026-12-02T16:00:00Z"));
    expect(eventStartBounds("month", now).lt).toEqual(new Date("2026-12-25T16:00:00Z"));
  });
  const events = [
    { id: "b", title: "beta", startsAt: new Date("2026-12-02"), capacity: 10, _count: { registrations: 0 } },
    { id: "a", title: "Alpha", startsAt: new Date("2026-12-03"), capacity: 5, _count: { registrations: 4 } },
    { id: "g", title: "gamma", startsAt: new Date("2026-12-01"), capacity: 0, _count: { registrations: 1 } },
  ];
  it.each<[EventFilters["sort"], string[]]>([
    ["date-asc", ["g", "b", "a"]], ["date-desc", ["a", "b", "g"]], ["name-asc", ["a", "b", "g"]],
    ["name-desc", ["g", "b", "a"]], ["spots-asc", ["g", "a", "b"]], ["spots-desc", ["b", "a", "g"]],
  ])("applies %s without changing the source list", (sort, expected) => {
    expect(filterAndSortEvents(events, { date: "all", sort, slots: "any" }).map((event) => event.id)).toEqual(expected);
    expect(events.map((event) => event.id)).toEqual(["b", "a", "g"]);
  });
  it("includes both slot-range endpoints and excludes more than 100 remaining", () => {
    const rows = [0, 1, 100, 101].map((capacity) => ({ ...events[0], id: String(capacity), capacity, _count: { registrations: 0 } }));
    expect(filterAndSortEvents(rows, { date: "all", sort: "spots-asc", slots: "0-100" }).map((event) => event.id)).toEqual(["0", "1", "100"]);
  });
});
