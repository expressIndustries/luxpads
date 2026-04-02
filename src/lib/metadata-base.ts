/** Safe base URL for Next.js `metadataBase` (invalid env must not crash the app). */
export function getMetadataBase(): URL {
  const raw = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (raw) {
    try {
      return new URL(raw);
    } catch {
      /* ignore */
    }
  }
  return new URL("http://localhost:3000");
}
