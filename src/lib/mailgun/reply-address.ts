export function replyToAddress(token: string, domain: string): string {
  const t = token.trim();
  if (!/^[a-f0-9]{32,128}$/i.test(t)) {
    throw new Error("Invalid mail thread token");
  }
  return `reply+${t}@${domain}`;
}

/**
 * Extract thread token from Mailgun recipient (e.g. reply+abc...@mail.luxpads.co).
 * Handles angle brackets and display names.
 */
export function parseThreadTokenFromRecipient(recipientRaw: string): string | null {
  const s = recipientRaw.trim();
  const m = s.match(/<([^>]+)>/);
  const addr = (m ? m[1] : s).trim().toLowerCase();
  const local = addr.split("@")[0] ?? "";
  const plus = local.match(/^reply\+([a-f0-9]{32,128})$/i);
  return plus ? plus[1]!.toLowerCase() : null;
}
