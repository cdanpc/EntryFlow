import { describe, expect, it } from "vitest";
import { eventStartBounds, parseEventFilters, sortEvents, type EventSort } from "@/lib/event-browse";

describe("event browse filters", () => {
  it("uses safe defaults for unknown or repeated parameters", () => {
    expect(parseEventFilters("bad", ["name-asc"])).toEqual({ date: "all", sort: "date-asc" });
    expect(parseEventFilters("week", "spots-desc")).toEqual({ date: "week", sort: "spots-desc" });
  });
  it("ends date windows at Cebu midnight and excludes past start times", () => {
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
  it.each<[EventSort, string[]]>([
    ["date-asc", ["g", "b", "a"]], ["date-desc", ["a", "b", "g"]],
    ["name-asc", ["a", "b", "g"]], ["name-desc", ["g", "b", "a"]],
    ["spots-desc", ["b", "a", "g"]], ["spots-asc", ["g", "a", "b"]],
  ])("orders events using %s without changing the original list", (sort, expected) => {
    expect(sortEvents(events, sort).map((event) => event.id)).toEqual(expected);
    expect(events.map((event) => event.id)).toEqual(["b", "a", "g"]);
  });
});
