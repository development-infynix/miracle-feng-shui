import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  // Products open in a drawer on the shop page now, so old product links still land on the product.
  redirects() {
    return [
      {
        source: '/product/:id',
        destination: '/shop?product=:id',
        permanent: true,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.squarespace-cdn.com',
      },
    ],
  },
};

export default nextConfig;
