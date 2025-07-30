/** @type {import('next').NextConfig} */
const nextConfig = {
  // Your ESLint and TypeScript settings can stay
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
g  },

  // This is the essential part to fix the file size error
  webpack: (config) => {
    config.optimization.splitChunks = {
      chunks: 'all',
      maxSize: 1024 * 1024, // Splits files larger than 1MB
    };
    return config;
  },
};

export default nextConfig;