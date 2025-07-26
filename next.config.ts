import { NextConfig } from 'next'

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
    serverComponentsExternalPackages: ['async_hooks']
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
  }
}

export default nextConfig