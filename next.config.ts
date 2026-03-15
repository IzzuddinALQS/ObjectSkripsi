import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  serverExternalPackages: ['pdf-parse', 'tesseract.js', 'pdfjs-dist'],
  async rewrites() {
    return [
      {
        source: '/uploads/:path*',
        destination: '/api/file/:path*',
      },
    ]
  },
};

export default nextConfig;
