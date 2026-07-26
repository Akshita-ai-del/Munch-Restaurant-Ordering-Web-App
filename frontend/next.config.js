const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'images.squarespace-cdn.com' },
      { protocol: 'http', hostname: 'static1.squarespace.com' },
    ],
  },

  // Proxy all /api and /socket.io requests to the backend (port 5000)
  // This means the frontend at localhost:3000 handles everything —
  // no need to expose port 5000 to the user.
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:5000/api/:path*',
      },
      {
        source: '/socket.io/:path*',
        destination: 'http://localhost:5000/socket.io/:path*',
      },
    ];
  },
};

module.exports = withPWA(nextConfig);
