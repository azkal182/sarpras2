import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { admins } from "@/db/schema";

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: { strategy: "jwt" },
  pages: { signIn: "/admin/login" },
  providers: [Credentials({
    credentials: { email: {}, password: {} },
    async authorize(credentials) {
      const email = String(credentials?.email ?? "").trim().toLowerCase();
      const password = String(credentials?.password ?? "");
      if (!email || !password) return null;
      const admin = await db.query.admins.findFirst({ where: eq(admins.email, email) });
      if (!admin || !(await bcrypt.compare(password, admin.passwordHash))) return null;
      return { id: admin.id, name: admin.name, email: admin.email };
    },
  })],
  callbacks: {
    jwt({ token, user }) { if (user) { token.id = user.id; token.name = user.name; token.email = user.email; } return token; },
    session({ session, token }) { if (session.user) { session.user.id = token.id as string; session.user.name = token.name ?? null; session.user.email = token.email ?? ""; } return session; },
  },
});
