import type { DefaultSession } from "next-auth";
import type { Role } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      role: Role;
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
    /** Admin user id while JWT `sub` is the impersonated owner. */
    impersonatorSub?: string;
  }
}
