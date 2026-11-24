import { describe, expect, it } from "vitest";
import { registrationSchema } from "@/lib/registration";

describe("registrationSchema", () => {
  it("normalizes email and accepts a Philippine mobile number", () => {
    expect(registrationSchema.parse({
      fullName: "  Alex Reyes ",
      email: " Alex.Reyes@Example.com ",
      mobile: "09171234567",
    })).toEqual({ fullName: "Alex Reyes", email: "alex.reyes@example.com", mobile: "09171234567" });
  });

  it("rejects invalid email and mobile numbers that do not meet the local format", () => {
    expect(registrationSchema.safeParse({ fullName: "Alex Reyes", email: "not-an-email", mobile: "9171234567" }).success).toBe(false);
    expect(registrationSchema.safeParse({ fullName: "Alex Reyes", email: "alex@example.com", mobile: "0917123456" }).success).toBe(false);
  });

  it("rejects blank and excessively long names", () => {
    expect(registrationSchema.safeParse({ fullName: " ", email: "alex@example.com", mobile: "09171234567" }).success).toBe(false);
    expect(registrationSchema.safeParse({ fullName: "a".repeat(121), email: "alex@example.com", mobile: "09171234567" }).success).toBe(false);
  });
});
