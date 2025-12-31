// next.config.mjs
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // appDir sudah default di Next.js 15+, tidak perlu experimental
  
  // Set output file tracing root to frontend directory to silence warning about multiple lockfiles
  output: 'standalone',
  outputFileTracingRoot: resolve(__dirname),
}

export default nextConfig;
