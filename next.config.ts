import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["tokenshit.metasal.xyz", "*.trycloudflare.com", "*.vercel.app"],
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
