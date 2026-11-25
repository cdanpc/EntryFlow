import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { StaffRole } from "@prisma/client";
import { consumeRateLimit, getRequestClientAddress } from "@/lib/rate-limit";
import { randomBytes } from "node:crypto";

const credentialsSchema = z.object({ username: z.string().trim().min(1).max(80), password: z.string().min(1).max(256) });
const STAFF_IDLE_MS = 30 * 60 * 1000;
const STAFF_ABSOLUTE_MS = 8 * 60 * 60 * 1000;

export const { handlers, auth, signIn, signOut } = NextAuth({
  pages: { signIn: "/staff/sign-in" },
  session: { strategy: "jwt", maxAge: 8 * 60 * 60 },
  providers: [
    Credentials({
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(input) {
        const parsed = credentialsSchema.safeParse(input);
        if (!parsed.success) return null;
        const username = parsed.data.username.toLowerCase();
        const address = await getRequestClientAddress();
        const addressAllowed = await consumeRateLimit("staffAuth", `address:${address}`, 30);
        const userAllowed = await consumeRateLimit("staffAuth", `username:${username}`, 10);
        if (!addressAllowed || !userAllowed) return null;
        const staff = await prisma.staffUser.findUnique({ where: { username }, select: { id: true, name: true, username: true, passwordHash: true, role: true } });
        if (!staff || !(await compare(parsed.data.password, staff.passwordHash))) return null;
        return { id: staff.id, name: staff.name, email: staff.username, role: staff.role };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.staffId = user.id;
        const now = new Date();
        const id = randomBytes(32).toString("base64url");
        await prisma.staffSession.deleteMany({ where: { expiresAt: { lt: now } } });
        await prisma.staffSession.create({ data: { id, staffUserId: user.id!, lastActivityAt: now, expiresAt: new Date(now.getTime() + STAFF_ABSOLUTE_MS) } });
        token.staffSessionId = id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        const now = new Date();
        session.user.staffId = "";
        if (typeof token.staffId === "string" && typeof token.staffSessionId === "string" &&
          (token.role === StaffRole.ORGANIZER || token.role === StaffRole.DOOR_STAFF)) {
          const updated = await prisma.staffSession.updateMany({
            where: { id: token.staffSessionId, staffUserId: token.staffId, lastActivityAt: { gt: new Date(now.getTime() - STAFF_IDLE_MS) }, expiresAt: { gt: now } },
            data: { lastActivityAt: now },
          });
          if (updated.count === 1) {
            session.user.role = token.role;
            session.user.staffId = token.staffId;
          }
        }
      }
      return session;
    },
  },
});
