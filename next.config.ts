import { NextConfig } from 'next';

// Import the bundle analyzer
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

// Your existing Next.js config object
const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },

  // Add these configurations for Cloudflare Pages compatibility
  experimental: {
    serverComponentsExternalPackages: ['async_hooks'],
  },

  // Webpack configuration to handle Node.js modules in edge runtime
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        "async_hooks": false,
        "fs": false,
        "net": false,
        "tls": false,
        "crypto": false,
      };
    }
    return config;
  },
};

// Wrap your config with the bundle analyzer before exporting
export default withBundleAnalyzer(nextConfig);