import { z } from "zod";

export const registrationSchema = z.object({
  fullName: z.string().trim().min(2, "Enter your full name.").max(120, "Name must be 120 characters or fewer."),
  email: z.string().trim().email("Enter a valid email address.").max(254).transform((value) => value.toLowerCase()),
  mobile: z.string().trim().regex(/^09\d{9}$/, "Use an 11-digit Philippine mobile number starting with 09."),
});

export type RegistrationInput = z.infer<typeof registrationSchema>;
