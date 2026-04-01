import { getMailgunEnv } from "@/lib/mailgun/config";
import { replyToAddress } from "@/lib/mailgun/reply-address";
import { sendViaMailgun } from "@/lib/mailgun/send-message";

type MailPayload = {
  to: string;
  subject: string;
  text: string;
  html?: string;
  /** Required for LuxPads thread mail (Mailgun relay). */
  replyTo: string;
};

function appBaseUrl(): string {
  const base = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "";
  return base || "http://localhost:3000";
}

/**
 * Deliver transactional mail. Prefers Mailgun when MAILGUN_API_KEY is set.
 * Reply-To must be the thread relay address so email clients thread correctly.
 */
export async function sendMail(payload: MailPayload): Promise<{ ok: true; mode: string } | { ok: false; error: string }> {
  const mg = getMailgunEnv();
  if (mg) {
    const sent = await sendViaMailgun(mg, {
      to: payload.to,
      subject: payload.subject,
      text: payload.text,
      html: payload.html,
      replyTo: payload.replyTo,
    });
    if (!sent.ok) {
      console.error("[email:mailgun]", sent.error);
      return { ok: false, error: sent.error };
    }
    return { ok: true, mode: "mailgun" };
  }

  if (process.env.SMTP_URL || process.env.RESEND_API_KEY) {
    console.info("[email] SMTP/Resend not wired for Reply-To relay — configure Mailgun for production:", {
      to: payload.to,
      subject: payload.subject,
    });
    return { ok: true, mode: "placeholder" };
  }

  console.info("[email:dev]", payload.subject, "→", payload.to, "| Reply-To:", payload.replyTo);
  return { ok: true, mode: "console" };
}

function threadReplyTo(mailThreadToken: string): string {
  const domain = getMailgunEnv()?.domain ?? process.env.MAILGUN_DOMAIN?.trim() ?? "mail.luxpads.co";
  return replyToAddress(mailThreadToken, domain);
}

export async function notifyOwnerOfNewConversation(params: {
  ownerEmail: string;
  listingTitle: string;
  guestDisplayName: string;
  messagePreview: string;
  conversationId: string;
  mailThreadToken: string;
}) {
  const link = `${appBaseUrl()}/dashboard/messages/${params.conversationId}`;
  const replyTo = threadReplyTo(params.mailThreadToken);
  return sendMail({
    to: params.ownerEmail,
    subject: `New message: ${params.listingTitle}`,
    replyTo,
    text: [
      `${params.guestDisplayName} sent a message about “${params.listingTitle}” on LuxPads.`,
      "Their email address is not shown here—replies go through LuxPads.",
      "",
      params.messagePreview,
      "",
      `Open in your dashboard: ${link}`,
      "",
      "Or reply to this email; your response is delivered through LuxPads.",
    ].join("\n"),
  });
}

export async function notifyOwnerOfRenterMessage(params: {
  ownerEmail: string;
  listingTitle: string;
  guestDisplayName: string;
  messagePreview: string;
  conversationId: string;
  mailThreadToken: string;
}) {
  const link = `${appBaseUrl()}/dashboard/messages/${params.conversationId}`;
  const replyTo = threadReplyTo(params.mailThreadToken);
  return sendMail({
    to: params.ownerEmail,
    subject: `New reply: ${params.listingTitle}`,
    replyTo,
    text: [
      `${params.guestDisplayName} sent another message about “${params.listingTitle}”.`,
      "",
      params.messagePreview,
      "",
      `Open thread: ${link}`,
      "",
      "Or reply to this email to respond through LuxPads.",
    ].join("\n"),
  });
}

export async function notifyRenterOfOwnerMessage(params: {
  renterEmail: string;
  listingTitle: string;
  ownerDisplayName: string;
  messagePreview: string;
  conversationId: string;
  mailThreadToken: string;
}) {
  const link = `${appBaseUrl()}/account/messages/${params.conversationId}`;
  const replyTo = threadReplyTo(params.mailThreadToken);
  return sendMail({
    to: params.renterEmail,
    subject: `Message about ${params.listingTitle}`,
    replyTo,
    text: [
      `${params.ownerDisplayName} sent a message about “${params.listingTitle}” on LuxPads.`,
      "Reply to this email to respond—the homeowner does not see your personal address in the LuxPads app.",
      "",
      params.messagePreview,
      "",
      `View online: ${link}`,
      "",
      "Sign in with the same email you used for your inquiry if you open the link above.",
    ].join("\n"),
  });
}
