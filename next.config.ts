import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    // This will disable ESLint checking during builds
    ignoreDuringBuilds: true,
  },
  typescript: {
    // This will disable TypeScript type checking during builds
    ignoreBuildErrors: true,
  },
  images: {
    // Allow all domains (use with caution)
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**", // Wildcard to allow all domains
      },
    ],
  },
};

export default nextConfig;
