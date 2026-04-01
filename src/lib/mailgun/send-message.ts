import type { MailgunEnv } from "@/lib/mailgun/config";

export type OutboundMail = {
  to: string;
  subject: string;
  text: string;
  html?: string;
  replyTo: string;
};

/**
 * Send via Mailgun HTTP API (application/x-www-form-urlencoded).
 */
export async function sendViaMailgun(env: MailgunEnv, mail: OutboundMail): Promise<{ ok: true } | { ok: false; error: string }> {
  const url = `${env.apiBaseUrl}/v3/${encodeURIComponent(env.domain)}/messages`;
  const body = new URLSearchParams();
  body.set("from", env.fromAddress);
  body.set("to", mail.to);
  body.set("subject", mail.subject);
  body.set("text", mail.text);
  if (mail.html) body.set("html", mail.html);
  body.set("h:Reply-To", mail.replyTo);

  const auth = Buffer.from(`api:${env.apiKey}`).toString("base64");

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    return { ok: false, error: `Mailgun ${res.status}: ${errText.slice(0, 500)}` };
  }

  return { ok: true };
}
