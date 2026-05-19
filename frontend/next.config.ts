import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/dev/:path*',
        destination: 'http://127.0.0.1:4000/:path*',
      },
      {
        source: '/api/:path*',
        destination: 'http://127.0.0.1:3005/:path*',
      },
    ]
  },
};

export default nextConfig;
