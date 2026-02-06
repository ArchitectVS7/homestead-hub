/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable static export for self-hosting without Node.js server
  // output: 'export',
  
  // Strict mode for better development experience
  reactStrictMode: true,
  
  // Optimize images
  images: {
    unoptimized: true, // For self-hosted/offline use
  },
}

module.exports = nextConfig
