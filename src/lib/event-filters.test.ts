import { describe, expect, it } from "vitest";
import { sortEvents, parseEventFilters, type EventFilters } from "@/lib/event-filters";

describe("compact event filters", () => {
  it("falls back safely for invalid/repeated parameters", () => {
    expect(parseEventFilters(["name-asc"])).toEqual({ sort: "date-asc" });
    expect(parseEventFilters("invalid")).toEqual({ sort: "date-asc" });
    expect(parseEventFilters("name-asc")).toEqual({ sort: "name-asc" });
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
    expect(sortEvents(events, { sort }).map((event) => event.id)).toEqual(expected);
    expect(events.map((event) => event.id)).toEqual(["b", "a", "g"]);
  });
});
