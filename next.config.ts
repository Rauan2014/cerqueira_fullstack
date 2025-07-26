import { NextConfig } from 'next';

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
  // This webpack config is crucial for the edge runtime
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Exclude node:crypto from the edge bundle, as 'jose' uses Web Crypto
      config.externals.push('node:crypto');
    }
    return config;
  },
};

export default nextConfig;