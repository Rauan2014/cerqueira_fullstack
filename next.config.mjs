/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // This config splits large files and fixes the size error
  webpack: (config) => {
    config.optimization.splitChunks = {
      chunks: 'all',
      maxSize: 1024 * 1024, // Splits files larger than 1MB
    };
    return config;
  },
};

export default nextConfig;