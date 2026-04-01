import type { User } from "@prisma/client";

export function normalizeRenterEmail(email: string): string {
  return email.toLowerCase().trim();
}

export function appBaseUrl(): string {
  const base = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "";
  return base || "http://localhost:3000";
}

/** Renter may access a thread by linked account or matching verified email on file. */
export function renterMatchesConversation(
  user: Pick<User, "id" | "email">,
  conversation: { renterUserId: string | null; renterEmail: string },
): boolean {
  if (conversation.renterUserId && conversation.renterUserId === user.id) return true;
  return normalizeRenterEmail(user.email) === normalizeRenterEmail(conversation.renterEmail);
}
