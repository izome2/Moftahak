import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'i.pravatar.cc',
        port: '',
        pathname: '/**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    unoptimized: false,
  },
  
  // Performance optimizations
  compress: true,
  poweredByHeader: false,
  
  // React optimizations
  reactStrictMode: true,
  
  // Compiler optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // Output standalone for optimal deployment
  output: 'standalone',
  
  // Experimental features for better performance
  experimental: {
    optimizePackageImports: ['lucide-react', 'react-icons', 'framer-motion'],
    // Enable modern bundling
    serverMinification: true,
    // Optimize CSS
    optimizeCss: true,
    // Enable partial prerendering for better performance
    ppr: false,
  },
  
  // Turbopack configuration (empty to silence warnings)
  turbopack: {},
};

export default nextConfig;
