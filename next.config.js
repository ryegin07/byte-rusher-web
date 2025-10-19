/** @type {import('next').NextConfig} */
const API = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:3001';

module.exports = {
  async rewrites() {
    return [{ source: '/api/:path*', destination: `${API}/:path*` }];
  },
};
