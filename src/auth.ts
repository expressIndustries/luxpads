import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";
import { consumePostVerifyLoginToken } from "@/lib/email-verification";

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
        postVerifyToken: { label: "Post verify", type: "text" },
      },
      async authorize(raw) {
        const postToken =
          raw && typeof raw === "object" && "postVerifyToken" in raw
            ? String((raw as { postVerifyToken?: unknown }).postVerifyToken ?? "").trim()
            : "";
        if (postToken.length > 0) {
          const u = await consumePostVerifyLoginToken(postToken);
          if (!u) return null;
          return {
            id: u.id,
            email: u.email,
            name: u.name ?? undefined,
            role: u.role,
            emailVerified: true,
          };
        }

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
          emailVerified: Boolean(user.emailVerified),
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
        const u = user as {
          id: string;
          email: string;
          name?: string | null;
          role: Role;
          emailVerified?: boolean;
        };
        token.sub = u.id;
        token.role = u.role;
        token.email = u.email;
        token.name = u.name ?? null;
        token.hasVerifiedEmail = Boolean(u.emailVerified);
        delete token.impersonatorSub;
        return token;
      }

      if (trigger === "update" && session && typeof session === "object") {
        const s = session as { action?: string; userId?: string };
        if (s.action === "impersonate" && typeof s.userId === "string") {
          if (token.role !== Role.admin || token.impersonatorSub) {
            return token;
          }
          try {
            const target = await prisma.user.findFirst({
              where: { id: s.userId, role: Role.owner, suspended: false },
              select: { id: true, email: true, name: true, role: true, emailVerified: true },
            });
            if (!target) return token;
            token.impersonatorSub = token.sub;
            token.sub = target.id;
            token.role = target.role;
            token.email = target.email;
            token.name = target.name;
            token.hasVerifiedEmail = Boolean(target.emailVerified);
          } catch (e) {
            console.error("[auth:jwt] impersonate_failed", e);
          }
          return token;
        }
        if (s.action === "stopImpersonation" && token.impersonatorSub) {
          try {
            const admin = await prisma.user.findFirst({
              where: { id: token.impersonatorSub, role: Role.admin, suspended: false },
              select: { id: true, email: true, name: true, role: true, emailVerified: true },
            });
            if (!admin) {
              delete token.impersonatorSub;
              return token;
            }
            token.sub = admin.id;
            token.role = admin.role;
            token.email = admin.email;
            token.name = admin.name;
            token.hasVerifiedEmail = Boolean(admin.emailVerified);
            delete token.impersonatorSub;
          } catch (e) {
            console.error("[auth:jwt] stop_impersonation_failed", e);
          }
          return token;
        }
      }

      // Keep JWT role + verification flag in sync with DB (welcome flow updates role without re-login).
      try {
        const sub = typeof token.sub === "string" ? token.sub.trim() : "";
        if (sub.length > 0) {
          const row = await prisma.user.findUnique({
            where: { id: sub },
            select: { role: true, suspended: true, emailVerified: true },
          });
          if (row && !row.suspended) {
            token.role = row.role;
            token.hasVerifiedEmail = Boolean(row.emailVerified);
          }
        }
      } catch (e) {
        console.error("[auth:jwt] db_sync_failed", e);
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        const sub = typeof token.sub === "string" ? token.sub.trim() : "";
        session.user.id = sub;
        session.user.role = (token.role as Role) ?? Role.renter;
        if (typeof token.email === "string") {
          session.user.email = token.email;
        }
        session.user.name = (token.name as string | null | undefined) ?? session.user.name;
        session.user.isImpersonating = Boolean(token.impersonatorSub);
        session.user.hasVerifiedEmail = Boolean(token.hasVerifiedEmail);
      }
      return session;
    },
  },
});
