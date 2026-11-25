import { beforeEach, describe, expect, it, vi } from "vitest";
vi.mock("@/lib/prisma", () => ({ prisma: { registration: { count: vi.fn(), findMany: vi.fn() } } }));
import { prisma } from "@/lib/prisma";
import { attendeeWhere, getStaffAttendees } from "@/lib/staff-attendees";

describe("staff attendee searches", () => {
  beforeEach(() => { vi.resetAllMocks(); vi.mocked(prisma.registration.count).mockResolvedValue(0); vi.mocked(prisma.registration.findMany).mockResolvedValue([]); });
  it("scopes partial name and code matching to the selected event and status", () => {
    expect(attendeeWhere("selected-event", " aB3 ", "awaiting", false)).toEqual({ eventId: "selected-event", status: "CONFIRMED", OR: [{ fullName: { contains: "aB3", mode: "insensitive" } }, { manualCode: { contains: "aB3", mode: "insensitive" } }] });
    expect(attendeeWhere("selected-event", "", "checked", false).status).toBe("CHECKED_IN");
  });
  it("restricts Door Staff All results to confirmed and checked-in registrations", () => {
    expect(attendeeWhere("event", "", "", false).status).toEqual({ in: ["CONFIRMED", "CHECKED_IN"] });
    expect(attendeeWhere("event", "", "", true).status).toBeUndefined();
  });
  it("omits contact details and QR secrets from Door Staff database selection", async () => {
    await getStaffAttendees("event", "", "", 1, false);
    const select = vi.mocked(prisma.registration.findMany).mock.calls[0][0]?.select;
    expect(select).not.toHaveProperty("email"); expect(select).not.toHaveProperty("mobile"); expect(select).not.toHaveProperty("ticketCode");
  });
  it("clamps pages and uses latest check-in order for Activity", async () => {
    vi.mocked(prisma.registration.count).mockResolvedValueOnce(51);
    const result = await getStaffAttendees("event", "", "", 999, true, true);
    expect(result.page).toBe(2); expect(result.pages).toBe(2);
    expect(prisma.registration.findMany).toHaveBeenCalledWith(expect.objectContaining({ where: expect.objectContaining({ eventId: "event", status: "CHECKED_IN" }), skip: 50, take: 50, orderBy: [{ checkedInAt: "desc" }, { id: "desc" }], select: expect.objectContaining({ email: true, mobile: true }) }));
  });
});
