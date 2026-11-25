import { describe, expect, it } from "vitest";
import { staffReturnPath } from "./staff-return-path";

describe("staffReturnPath", () => {
  it("returns to a ticket verification page after sign-in", () => {
    expect(staffReturnPath(`/staff/verify/${"A".repeat(43)}`)).toBe(`/staff/verify/${"A".repeat(43)}`);
  });

  it.each(["https://example.com", "//example.com", "/staff/verify/../admin", "/staff/verify/short", null])("rejects an unsafe destination: %s", (value) => {
    expect(staffReturnPath(value)).toBe("/staff");
  });
});
