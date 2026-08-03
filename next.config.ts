import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "kkgujlnkrazsqwsjlvon.supabase.co",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/",
        destination: "/index.html",
      },
      {
        source: "/kine",
        destination: "/kine.html",
      },
    ];
  },
};

export default nextConfig;
