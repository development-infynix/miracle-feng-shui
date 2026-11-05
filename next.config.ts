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
      // Checkout is a drawer on the cart page now.
      { source: '/checkout', destination: '/cart', permanent: true },
      // Orders and favorites now live on the profile page.
      { source: '/my-orders', destination: '/profile?tab=orders', permanent: true },
      { source: '/orders', destination: '/profile?tab=orders', permanent: true },
      { source: '/favorites', destination: '/profile?tab=favorites', permanent: true },
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
