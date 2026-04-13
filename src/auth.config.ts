import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import type { Role } from "@prisma/client";

/**
 * Edge-safe Auth.js options for Next.js middleware only.
 * Must not import Node-only modules (Prisma, bcrypt, node:crypto, @/lib/email-verification, etc.).
 * Real `authorize` and DB-backed `jwt` logic live in `auth.ts` (Node).
 */
export const credentialsFields = {
  email: { label: "Email", type: "email" },
  password: { label: "Password", type: "password" },
  postVerifyToken: { label: "Post verify", type: "text" },
} as const;

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

export const authConfig = {
  trustHost: true,
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      name: "Email and password",
      credentials: credentialsFields,
      /** Middleware never runs sign-in; Node `auth.ts` overrides this provider for handlers. */
      authorize: async () => null,
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
    async jwt({ token, user }) {
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
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        const sub = typeof token.sub === "string" ? token.sub.trim() : "";
        session.user.id = sub;
        session.user.role = (token.role as Role) ?? ("renter" as Role);
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
} satisfies NextAuthConfig;
