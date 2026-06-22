import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Image optimization
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "res.cloudinary.com" },
    ],
  },

  // Performance optimizations
  experimental: {
    optimizePackageImports: ["lucide-react", "date-fns"],
  },

  // Compression
  compress: true,

  // Production source maps (smaller bundle)
  productionBrowserSourceMaps: false,

  // Powered-by header (security + small perf gain)
  poweredByHeader: false,

  // Compress images automatically
  experimental: {
    optimizePackageImports: ["lucide-react", "date-fns"],
  },
};

export default nextConfig;

