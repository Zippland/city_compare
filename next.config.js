/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'hits.sh',
        port: '',
        pathname: '/**',
      },
    ],
    unoptimized: process.env.NODE_ENV !== 'production',
  },
};

module.exports = nextConfig; 