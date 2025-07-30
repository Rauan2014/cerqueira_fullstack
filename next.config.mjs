/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  serverExternalPackages: ['async_hooks'],
  experimental: {},

  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push('node:crypto');
    }

    // Configuração agressiva para forçar a divisão de código
    config.optimization.splitChunks = {
      chunks: 'all',
      maxSize: 500 * 1024, // Força a divisão em arquivos de no máximo 500KB
    };

    return config;
  },
};

export default nextConfig;