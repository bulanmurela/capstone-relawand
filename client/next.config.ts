import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Fix for workspace root detection issues
  outputFileTracingRoot: require('path').resolve(__dirname, '../../'),
  // Increase timeout for chunk loading
  experimental: {
    optimizeCss: false,
  },
  // Disable TypeScript check at build time for faster loading
  typescript: {
    ignoreBuildErrors: false,
  },
  // Handle chunk loading timeouts
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
};

export default nextConfig;
