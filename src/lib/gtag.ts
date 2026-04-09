/**
 * Fire GA4 events (gtag must be loaded — see `GoogleAnalytics` in root layout).
 * Use for ads conversion tracking and funnels.
 */
export function gaEvent(
  name: string,
  params?: Record<string, string | number | boolean | undefined>,
): void {
  if (typeof window === "undefined") return;
  const g = (
    window as unknown as {
      gtag?: (command: string, target: string, config?: Record<string, unknown>) => void;
    }
  ).gtag;
  if (typeof g !== "function") return;
  const cleaned = params
    ? Object.fromEntries(
        Object.entries(params).filter(([, v]) => v !== undefined) as [string, string | number | boolean][],
      )
    : undefined;
  g("event", name, cleaned ?? {});
}
