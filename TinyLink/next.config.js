/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ensure server components and API routes work correctly
  experimental: {
    // No experimental features needed for Next.js 14
  },
  
  // Ensure proper handling of serverless functions
  output: undefined, // Let Vercel handle this automatically
  
  // Logging for debugging
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
};

module.exports = nextConfig;

