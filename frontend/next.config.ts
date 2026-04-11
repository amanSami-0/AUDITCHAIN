import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/dev/:path*',
        destination: 'http://localhost:4000/:path*',
      },
      {
        source: '/api/:path*',
        destination: 'http://localhost:3000/:path*',
      },
    ]
  },
};

export default nextConfig;
