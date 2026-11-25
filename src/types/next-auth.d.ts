import type { StaffRole } from "@prisma/client";
import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & { staffId: string; role: StaffRole };
  }
  interface User {
    role: StaffRole;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    staffId?: string;
    staffSessionId?: string;
    role?: StaffRole;
  }
}
