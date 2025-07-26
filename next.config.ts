import { NextConfig } from 'next';

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // This helps the bundler understand how to handle edge functions
  experimental: {
    serverComponentsExternalPackages: ['@opentelemetry/api'],
  },
  // Explicitly handle crypto for the edge runtime
  webpack: (config, { isServer, webpack }) => {
    if (isServer) {
      config.plugins.push(
        new webpack.ProvidePlugin({
          crypto: ["crypto"],
        })
      );
    }
    return config;
  },
};

export default nextConfig;