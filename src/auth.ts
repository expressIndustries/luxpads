import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

/** Public site origin for redirects. Fixes sign-out/login landing on localhost when the app sees Host as 127.0.0.1:3000 behind Docker/proxy. */
function authCanonicalBaseUrl(): string | null {
  const raw =
    process.env.AUTH_URL?.trim() ||
    process.env.NEXTAUTH_URL?.trim() ||
    process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (!raw) return null;
  try {
    return new URL(raw).origin;
  } catch {
    return null;
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      name: "Email and password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(raw) {
        const parsed = credentialsSchema.safeParse(raw);
        if (!parsed.success) return null;
        const { email, password } = parsed.data;
        const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
        if (!user?.passwordHash || user.suspended) return null;
        const ok = await compare(password, user.passwordHash);
        if (!ok) return null;
        return {
          id: user.id,
          email: user.email,
          name: user.name ?? undefined,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    redirect({ url, baseUrl }) {
      const canonical = authCanonicalBaseUrl();
      const effectiveBase = canonical ?? baseUrl;

      if (url.startsWith("/")) {
        return `${effectiveBase}${url}`;
      }
      try {
        const target = new URL(url);
        const base = new URL(effectiveBase);
        if (target.origin === base.origin) {
          return url;
        }
      } catch {
        /* invalid URL */
      }
      return effectiveBase;
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        const u = user as { id: string; email: string; name?: string | null; role: Role };
        token.sub = u.id;
        token.role = u.role;
        token.email = u.email;
        token.name = u.name ?? null;
        delete token.impersonatorSub;
        return token;
      }

      if (trigger === "update" && session && typeof session === "object") {
        const s = session as { action?: string; userId?: string };
        if (s.action === "impersonate" && typeof s.userId === "string") {
          if (token.role !== Role.admin || token.impersonatorSub) {
            return token;
          }
          const target = await prisma.user.findFirst({
            where: { id: s.userId, role: Role.owner, suspended: false },
            select: { id: true, email: true, name: true, role: true },
          });
          if (!target) return token;
          token.impersonatorSub = token.sub;
          token.sub = target.id;
          token.role = target.role;
          token.email = target.email;
          token.name = target.name;
          return token;
        }
        if (s.action === "stopImpersonation" && token.impersonatorSub) {
          const admin = await prisma.user.findFirst({
            where: { id: token.impersonatorSub, role: Role.admin, suspended: false },
            select: { id: true, email: true, name: true, role: true },
          });
          if (!admin) {
            delete token.impersonatorSub;
            return token;
          }
          token.sub = admin.id;
          token.role = admin.role;
          token.email = admin.email;
          token.name = admin.name;
          delete token.impersonatorSub;
          return token;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!;
        session.user.role = (token.role as Role) ?? Role.renter;
        if (typeof token.email === "string") {
          session.user.email = token.email;
        }
        session.user.name = (token.name as string | null | undefined) ?? session.user.name;
        session.user.isImpersonating = Boolean(token.impersonatorSub);
        if (token.sub) {
          const row = await prisma.user.findUnique({
            where: { id: token.sub },
            select: { emailVerified: true },
          });
          session.user.hasVerifiedEmail = Boolean(row?.emailVerified);
        } else {
          session.user.hasVerifiedEmail = false;
        }
      }
      return session;
    },
  },
});
