// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true, // gunakan SWC untuk minify
  // appDir sudah default di Next.js 15+, tidak perlu experimental
}

export default nextConfig;
