import type { DefaultSession } from "next-auth";
import type { Role } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      role: Role;
      /** From JWT (kept in sync on sign-in / jwt refresh); avoids a DB round-trip on every `auth()` call. */
      hasVerifiedEmail: boolean;
      /** True when an admin is viewing the site as this owner account. */
      isImpersonating?: boolean;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: Role;
    email?: string;
    name?: string | null;
    /** Mirrored from DB on sign-in and jwt refresh; session reads this (no per-request Prisma in session callback). */
    hasVerifiedEmail?: boolean;
    /** Admin user id while JWT `sub` is the impersonated owner. */
    impersonatorSub?: string;
  }
}
