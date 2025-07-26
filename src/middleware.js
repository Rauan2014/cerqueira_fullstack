import { NextConfig } from 'next';

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    serverComponentsExternalPackages: ['async_hooks'],
  },
  webpack: (config, { isServer }) => {
    // This is the crucial part for the server/edge bundle
    if (isServer) {
      // Exclude node:crypto from the edge bundle
      config.externals.push('node:crypto');
    }

    // Your existing fallback for the client-side bundle
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

export default withBundleAnalyzer(nextConfig);