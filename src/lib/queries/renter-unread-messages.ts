import { prisma } from "@/lib/prisma";
import { MessageSender } from "@prisma/client";
import { normalizeRenterEmail } from "@/lib/messaging";

/** Owner messages the renter has not marked read (matches `/account/messages` thread rules). */
export async function countRenterUnreadOwnerMessages(userId: string, userEmail: string): Promise<number> {
  const emailNorm = normalizeRenterEmail(userEmail);
  return prisma.message.count({
    where: {
      senderRole: MessageSender.owner,
      readByRenterAt: null,
      conversation: {
        OR: [{ renterUserId: userId }, { renterEmail: emailNorm }],
      },
    },
  });
}
