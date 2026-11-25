import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ auth: vi.fn(), rateLimit: vi.fn(), findTicket: vi.fn(), redirect: vi.fn((path: string): never => { throw new Error(`REDIRECT:${path}`); }) }));
vi.mock("@/auth", () => ({ auth: mocks.auth }));
vi.mock("next/navigation", () => ({ redirect: mocks.redirect }));
vi.mock("@/lib/prisma", () => ({ prisma: { registration: { findFirst: mocks.findTicket } } }));
vi.mock("@/lib/rate-limit", () => ({ consumeRateLimit: mocks.rateLimit }));
import { findStaffTicket } from "./actions";

const idle = { kind: "idle" as const, message: "" };
function code(value: string) { const form = new FormData(); form.set("manualCode", value); return form; }

describe("Scan manual ticket verification", () => {
  beforeEach(() => { vi.clearAllMocks(); mocks.auth.mockResolvedValue({ user: { staffId: "staff-1" } }); mocks.rateLimit.mockResolvedValue(true); mocks.findTicket.mockResolvedValue(null); });
  it("blocks unauthenticated lookup before accessing attendees", async () => {
    mocks.auth.mockResolvedValue(null);
    await expect(findStaffTicket("event", idle, code("A7K2P9"))).rejects.toThrow("REDIRECT:/staff/sign-in");
    expect(mocks.rateLimit).not.toHaveBeenCalled(); expect(mocks.findTicket).not.toHaveBeenCalled();
  });
  it("rate limits attempts before querying registrations", async () => {
    mocks.rateLimit.mockResolvedValue(false);
    expect((await findStaffTicket("event", idle, code("A7K2P9"))).kind).toBe("error");
    expect(mocks.findTicket).not.toHaveBeenCalled();
  });
  it("rejects malformed manual codes", async () => {
    expect((await findStaffTicket("event", idle, code("short"))).kind).toBe("invalid");
    expect(mocks.findTicket).not.toHaveBeenCalled();
  });
  it("normalizes the code, scopes lookup to the event, and opens protected review", async () => {
    const secret = "A".repeat(43);
    mocks.findTicket.mockResolvedValue({ ticketCode: secret });
    await expect(findStaffTicket("event-1", idle, code(" a7k2p9 "))).rejects.toThrow(`REDIRECT:/staff/verify/${secret}?eventId=event-1`);
    expect(mocks.findTicket).toHaveBeenCalledWith({ where: { manualCode: "A7K2P9", eventId: "event-1", event: { status: { in: ["PUBLISHED", "CLOSED"] } } }, select: { ticketCode: true } });
  });
  it("returns safe feedback for a code absent from the selected event", async () => {
    expect(await findStaffTicket("other-event", idle, code("A7K2P9"))).toEqual({ kind: "invalid", message: "Ticket not found. Check the code and selected event." });
    expect(mocks.redirect).not.toHaveBeenCalled();
  });
});
