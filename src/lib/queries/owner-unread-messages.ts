import { prisma } from "@/lib/prisma";
import { MessageSender } from "@prisma/client";

/** Guest (renter) messages the owner has not marked read. */
export async function countOwnerUnreadGuestMessages(ownerId: string): Promise<number> {
  return prisma.message.count({
    where: {
      senderRole: MessageSender.renter,
      readByOwnerAt: null,
      conversation: { ownerId },
    },
  });
}
