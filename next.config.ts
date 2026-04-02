import type { NextConfig } from "next";
import { nextImageRemoteHostnames } from "./src/lib/s3-env";

const s3ImageHosts = nextImageRemoteHostnames();

const nextConfig: NextConfig = {
  output: "standalone",
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
