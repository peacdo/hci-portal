/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'export',
    images: {
      unoptimized: true,
    },
    basePath: '/hci-portal',
    assetPrefix: '/hci-portal',
    trailingSlash: true,
  }
  
  module.exports = nextConfig