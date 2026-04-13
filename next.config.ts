import type { NextConfig } from "next";
import { nextImageRemoteHostnames } from "./src/lib/s3-env";

const s3ImageHosts = nextImageRemoteHostnames();

/**
 * Reverse-proxy phpMyAdmin under /expressmin001 → internal Docker service `phpmyadmin:80`.
 * Baked in at `next build` when NODE_ENV=production (Docker image). Disable with PHPMYADMIN_UPSTREAM=0 (e.g. Vercel).
 * Local `npm run dev`: set PHPMYADMIN_UPSTREAM=http://127.0.0.1:18080 if phpMyAdmin runs on the host port.
 */
function getPhpMyAdminUpstream(): string {
  const raw = process.env.PHPMYADMIN_UPSTREAM?.trim();
  const off = raw?.toLowerCase();
  if (raw === "0" || off === "off" || off === "false") {
    return "";
  }
  if (raw) {
    return raw.replace(/\/$/, "");
  }
  if (process.env.VERCEL) {
    return "";
  }
  if (process.env.NODE_ENV === "production") {
    return "http://phpmyadmin:80";
  }
  return "";
}

function phpmyadminRewrites(): { source: string; destination: string }[] {
  const base = getPhpMyAdminUpstream();
  if (!base) return [];
  return [
    { source: "/expressmin001", destination: `${base}/` },
    { source: "/expressmin001/", destination: `${base}/` },
    { source: "/expressmin001/:path*", destination: `${base}/:path*` },
  ];
}

const nextConfig: NextConfig = {
  output: "standalone",
  experimental: {
    /** Listing photo uploads (single file per request); default proxy limit is 10MB. */
    proxyClientMaxBodySize: "32mb",
  },
  async rewrites() {
    return phpmyadminRewrites();
  },
  async redirects() {
    return [
      { source: "/dashboard/billing", destination: "/dashboard", permanent: true },
      { source: "/owners/pricing", destination: "/owners", permanent: true },
    ];
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com", pathname: "/**" },
      { protocol: "https", hostname: "picsum.photos", pathname: "/**" },
      ...s3ImageHosts.map((hostname) => ({
        protocol: "https" as const,
        hostname,
        pathname: "/**" as const,
      })),
    ],
  },
};

export default nextConfig;
