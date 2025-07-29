import { NextConfig } from 'next';

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  serverExternalPackages: ['async_hooks'],
  experimental: {
    // serverComponentsExternalPackages is deprecated
  },
  
  webpack: (config, { isServer }) => {
    // Your existing config for the server
    if (isServer) {
      config.externals.push('node:crypto');
    }
    
    // ✅ ADD THIS PART to force code splitting
    // This prevents a single large file for edge functions.
    config.optimization.splitChunks = {
      ...config.optimization.splitChunks,
      chunks: 'all',
      // This sets a maximum size for each chunk, in bytes.
      // 1024 * 1024 = 1MB. Files will be smaller than this.
      maxSize: 1024 * 1024, 
    };
    
    // Return the modified config
    return config;
  },
};

export default nextConfig;