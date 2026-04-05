/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Penting untuk Vercel: pastikan streaming tidak di-buffer
  experimental: {
    // Tidak ada yang perlu di sini untuk Next.js 14
  },
};

export default nextConfig;
