/** @type {import('next').NextConfig} */
const nextConfig = {
  // ปล่อยให้ deploy ได้แม้มี ESLint warning เล็กน้อย (ยังตรวจ TypeScript error ตามปกติ)
  eslint: { ignoreDuringBuilds: true },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "*.supabase.co" },
    ],
  },
};

export default nextConfig;
