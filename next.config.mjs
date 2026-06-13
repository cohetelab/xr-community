/** @type {import('next').NextConfig} */
const nextConfig = {
  // Multi-Zones: cohetelab.asia/community 아래로 마운트돼도 라우팅/에셋이 안 깨지도록
  basePath: "/community",
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.supabase.co" },
    ],
  },
};

export default nextConfig;
