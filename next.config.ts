import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  serverExternalPackages: ['pdf-parse', 'tesseract.js', 'pdfjs-dist'],
};

export default nextConfig;
