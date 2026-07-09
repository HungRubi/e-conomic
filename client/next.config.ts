import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
    // Allow any hostname for blog images that have fallback handling
    // The ImageWithFallback component catches failures
    dangerouslyAllowSVG: false,
  },
};

export default nextConfig;
