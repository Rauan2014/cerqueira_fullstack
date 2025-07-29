import { NextConfig } from 'next';

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Remove output: 'export' - this conflicts with API routes and edge runtime
  // Keep your API routes working with Cloudflare Pages
  
  // Move serverComponentsExternalPackages to the root level (Next.js 15+ change)
  serverExternalPackages: ['async_hooks'],
  
  experimental: {
    // Remove deprecated serverComponentsExternalPackages
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