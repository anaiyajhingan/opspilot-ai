import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Stable as of Next 16 (was `experimental.typedRoutes` in earlier versions).
  typedRoutes: true,
  experimental: {
    typedEnv: true,
  },
  // Prisma 7's driver-adapter architecture (@prisma/client + @prisma/adapter-pg
  // + pg) ships native/optional-native pieces that break if the bundler
  // tries to inline them into the server bundle — load them as real
  // Node.js dependencies at runtime instead. See docs/architecture.md
  // section 5 and src/lib/db.ts.
  serverExternalPackages: ["@prisma/client", "@prisma/adapter-pg", "pg"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
