import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Docker copies `.next/standalone`; Vercel supplies its own output handling.
  // Enabling standalone there makes its post-build adapter look for a removed
  // Next.js 16 trace file.
  ...(process.env.VERCEL ? {} : { output: "standalone" }),
};

export default nextConfig;
