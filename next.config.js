/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // This flag can help ensure webpack configurations are applied correctly.
    webpackBuildWorker: true,
  },
  webpack: (config) => {
    // This is the most critical part. It tells webpack to split any
    // file larger than 1MB into a smaller chunk.
    config.cache = false;
    config.optimization.splitChunks = {
      chunks: 'all',
      maxSize: 1024 * 1024,
    };
    return config;
  },
};

module.exports = nextConfig;