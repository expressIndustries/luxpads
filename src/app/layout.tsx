import type { Metadata } from "next";
import { Cormorant_Garamond, DM_Sans } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { ImpersonationBanner } from "@/components/layout/impersonation-banner";
import { AppProviders } from "@/components/providers/app-providers";
import { GoogleAnalytics } from "@/components/analytics/google-analytics";
import { siteCopy } from "@/lib/constants";
import { getMetadataBase } from "@/lib/metadata-base";

const display = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-display",
});

const sans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
});

/** Default link-preview title (Messages, Slack, OG). Child routes use `template`. */
const shareTitle = `${siteCopy.legalName} | ${siteCopy.tagline}`;

export const metadata: Metadata = {
  metadataBase: getMetadataBase(),
  title: {
    default: shareTitle,
    template: `%s | ${siteCopy.domainDisplay}`,
  },
  description: siteCopy.tagline,
  applicationName: siteCopy.legalName,
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
  },
  ...(process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION?.trim()
    ? { verification: { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION.trim() } }
    : {}),
  openGraph: {
    title: shareTitle,
    description: siteCopy.tagline,
    type: "website",
    siteName: siteCopy.legalName,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: shareTitle,
    description: siteCopy.tagline,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable} h-full`}>
      <body className="flex min-h-full flex-col bg-[#faf9f7] font-sans text-stone-900 antialiased">
        <GoogleAnalytics />
        <AppProviders>
          <ImpersonationBanner />
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <SiteFooter />
        </AppProviders>
      </body>
    </html>
  );
}
