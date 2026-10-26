import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Required by forbidden(): non-admin visitors to /admin receive a real 403 page.
  experimental: { authInterrupts: true },
  // Docker copies `.next/standalone`; Vercel supplies its own output handling.
  // Enabling standalone there makes its post-build adapter look for a removed
  // Next.js 16 trace file.
  ...(process.env.VERCEL ? {} : { output: "standalone" }),
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
