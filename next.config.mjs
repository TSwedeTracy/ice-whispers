/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true, // Cloudflare Pages doesn't support the default Next.js image optimizer
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
