import Script from "next/script";

/** Set `NEXT_PUBLIC_GA_MEASUREMENT_ID` to override (e.g. staging). */
const DEFAULT_GA_ID = "G-LBCHZVQ50F";

export function GoogleAnalytics() {
  const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim() || DEFAULT_GA_ID;
  if (!measurementId) return null;

  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`} strategy="afterInteractive" />
      <Script id="google-analytics-gtag" strategy="afterInteractive">
        {`
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${measurementId}');
        `.trim()}
      </Script>
    </>
  );
}
