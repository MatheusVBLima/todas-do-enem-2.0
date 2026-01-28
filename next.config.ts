import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [
    '@prisma/client',
    '@prisma/adapter-libsql',
    '@libsql/client',
  ],
  experimental: {
    staleTimes: {
      dynamic: 180, // 3 minutos de cache para rotas dinâmicas no navegador
      static: 300,  // 5 minutos para rotas estáticas
    },
    // Optimize barrel imports - tree-shakes unused icons (200-800ms import savings)
    optimizePackageImports: ['lucide-react'],
  },
};

export default nextConfig;
