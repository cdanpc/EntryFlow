"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/auth";

export type SignInState = { message: string };

export async function signInStaff(_state: SignInState, formData: FormData): Promise<SignInState> {
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!username || !password || username.length > 80 || password.length > 256) return { message: "Enter your username and password." };

  try {
    await signIn("credentials", { username, password, redirectTo: "/staff" });
  } catch (error) {
    if (error instanceof AuthError) return { message: "Sign-in failed. Check your credentials and try again." };
    throw error;
  }
  return { message: "Sign-in failed. Check your credentials and try again." };
}
