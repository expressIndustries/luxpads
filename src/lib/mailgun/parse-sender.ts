/** Parse bare email from Mailgun `sender` / `from` (may be `Name <email@x.y>`). */
export function parseEmailAddress(raw: string): string | null {
  const s = raw.trim();
  const angle = s.match(/<([^>]+)>/);
  const candidate = (angle ? angle[1] : s).trim();
  const email = candidate.toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return null;
  return email;
}
