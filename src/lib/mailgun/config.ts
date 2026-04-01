export type MailgunEnv = {
  apiKey: string;
  domain: string;
  apiBaseUrl: string;
  fromAddress: string;
  webhookSigningKey: string | null;
};

export function getMailgunEnv(): MailgunEnv | null {
  const apiKey = process.env.MAILGUN_API_KEY?.trim();
  if (!apiKey) return null;

  const domain = process.env.MAILGUN_DOMAIN?.trim() || "mail.luxpads.co";
  const eu = process.env.MAILGUN_EU === "1" || process.env.MAILGUN_EU === "true";
  const apiBaseUrl =
    process.env.MAILGUN_API_BASE_URL?.trim() ||
    (eu ? "https://api.eu.mailgun.net" : "https://api.mailgun.net");

  const fromAddress =
    process.env.MAILGUN_FROM?.trim() || `LuxPads <messages@${domain}>`;

  const webhookSigningKey = process.env.MAILGUN_WEBHOOK_SIGNING_KEY?.trim() || null;

  return { apiKey, domain, apiBaseUrl, fromAddress, webhookSigningKey };
}

export function isMailgunConfigured(): boolean {
  return getMailgunEnv() !== null;
}
