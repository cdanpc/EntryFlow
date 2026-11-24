import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { StaffRole } from "@prisma/client";

const credentialsSchema = z.object({ username: z.string().trim().min(1).max(80), password: z.string().min(1).max(256) });

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
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        if (token.staffId && (token.role === StaffRole.ORGANIZER || token.role === StaffRole.DOOR_STAFF)) {
          session.user.role = token.role;
          session.user.staffId = token.staffId;
        }
      }
      return session;
    },
  },
});
