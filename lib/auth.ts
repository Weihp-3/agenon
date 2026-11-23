import { randomBytes } from "crypto";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { forbidden, redirect } from "next/navigation";
import { or } from "@prisma/orm-postgres/orm-client";

import { db } from "./db";

const googleId = process.env.AUTH_GOOGLE_ID;
const googleSecret = process.env.AUTH_GOOGLE_SECRET;

/**
 * Auth.js v5 with JWT sessions and no adapter. The credentials provider needs
 * the JWT strategy, and a database session table would only duplicate what the
 * users table already holds.
 */
export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: process.env.AUTH_SECRET,
  trustHost: true,
  session: { strategy: "jwt", maxAge: 120 * 60 },
  pages: { signIn: "/login" },

  providers: [
    ...(googleId && googleSecret
      ? [Google({ clientId: googleId, clientSecret: googleSecret })]
      : []),
    Credentials({
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Kata sandi", type: "password" },
      },
      async authorize(credentials) {
        const email = String(credentials?.email ?? "")
          .trim()
          .toLowerCase();
        const password = String(credentials?.password ?? "");

        if (!email || !password) return null;

        const user = await db.orm.public.users.where({ email }).first();
        if (!user || !user.password) return null;

        const matches = await bcrypt.compare(password, user.password);
        if (!matches) return null;

        return {
          id: String(user.id),
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user, account, profile }) {
      if (!user) return token;

      token.name = user.name ?? token.name;
      token.email = user.email ?? token.email;
      token.avatar = user.avatar ?? token.avatar ?? null;

      if (account?.provider === "google") {
        const email = String(user.email ?? "").trim().toLowerCase();
        if (!email) return token;

        const googleId = String((profile as { sub?: string } | undefined)?.sub ?? "");
        let dbUser = await db.orm.public.users
          .where((u) =>
            googleId ? or(u.email.eq(email), u.google_id.eq(googleId)) : u.email.eq(email),
          )
          .first();

        if (!dbUser) {
          dbUser = await db.orm.public.users.create({
            name: user.name ?? email.split("@")[0],
            email,
            google_id: googleId || null,
            avatar: user.image ?? null,
            password: randomBytes(32).toString("hex"),
            role: "user",
          });
        } else if (googleId && dbUser.google_id !== googleId) {
          dbUser = await db.orm.public.users
            .where({ id: dbUser.id })
            .update({ google_id: googleId });
        }

        if (!dbUser) return token;

        token.id = String(dbUser.id);
        token.role = dbUser.role;
        token.avatar = dbUser.avatar;
        return token;
      }

      token.id = user.id ?? token.id;
      token.role = user.role ?? token.role;
      return token;
    },

    async session({ session, token }) {
      if (token.id) session.user.id = token.id;
      if (token.name) session.user.name = token.name;
      if (token.email) session.user.email = token.email;
      session.user.role = token.role ?? session.user.role ?? "user";
      session.user.avatar = token.avatar ?? null;
      return session;
    },
  },
});

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string | null;
};

/**
 * Port of CheckRole: role mismatch aborts with 403 rather than bouncing to
 * login. The `user` role is the single customer role.
 */
export function hasRole(
  user: { role?: string | null } | null | undefined,
  ...roles: string[]
): boolean {
  if (!user) return false;

  const allowed = new Set<string>(roles);
  return allowed.has(user.role ?? "user");
}

export async function requireUser(): Promise<SessionUser> {
  const session = await auth();
  if (!session?.user) redirect("/login");
  return session.user;
}

export async function requireRole(...roles: string[]): Promise<SessionUser> {
  const user = await requireUser();
  if (!hasRole(user, ...roles)) forbidden();
  return user;
}
