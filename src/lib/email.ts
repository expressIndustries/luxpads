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

const MESSAGE_BANNER_START = "-=-=-=-=-=-=-=Message=-=-=-=-=-=-=-";
const MESSAGE_BANNER_END = "-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=";

/** Keeps email size reasonable; very long bodies are still complete in the app. */
const MAX_MESSAGE_CHARS_IN_EMAIL = 10_000;

function clipMessageForEmail(body: string): string {
  const t = body.trim();
  if (t.length <= MAX_MESSAGE_CHARS_IN_EMAIL) return t;
  return `${t.slice(0, MAX_MESSAGE_CHARS_IN_EMAIL)}\n\n… (truncated for email — open the thread for the full message.)`;
}

/** Plain-text block so the guest/owner’s words are visually separate from boilerplate. */
function delimitedMessageBlock(messageBody: string): string {
  const inner = clipMessageForEmail(messageBody);
  return `${MESSAGE_BANNER_START}\n\n${inner}\n\n${MESSAGE_BANNER_END}`;
}

export async function notifyOwnerOfNewConversation(params: {
  ownerEmail: string;
  listingTitle: string;
  guestDisplayName: string;
  messageBody: string;
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
      delimitedMessageBlock(params.messageBody),
      "",
      `Open thread: ${link}`,
      "",
      "Or reply to this email to respond through LuxPads.",
    ].join("\n"),
  });
}

export async function notifyOwnerOfRenterMessage(params: {
  ownerEmail: string;
  listingTitle: string;
  guestDisplayName: string;
  messageBody: string;
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
      delimitedMessageBlock(params.messageBody),
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
  messageBody: string;
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
      delimitedMessageBlock(params.messageBody),
      "",
      `Open thread: ${link}`,
      "",
      "Or reply to this email to respond through LuxPads.",
      "",
      "Sign in with the same email you used for your inquiry if you open the link above.",
    ].join("\n"),
  });
}
