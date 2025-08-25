import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Skip ESLint during builds for production deployment
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Skip TypeScript check during builds (will be handled separately)
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
