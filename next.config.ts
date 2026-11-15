import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Self-contained server bundle for the Docker image (Coolify/Hetzner). Ignored by Vercel.
  output: "standalone",
  experimental: {
    // Admin photo uploads pass through a server action (default limit 1 MB). The API caps photos at 10 MB.
    serverActions: { bodySizeLimit: "11mb" },
  },
  cacheComponents: true,
  partialPrefetching: true,
  poweredByHeader: false,
  images: {
    // Images are served straight from their CDN (e.g. Unsplash/imgix) with width/quality
    // parameters added by our loader. This avoids per-image optimisation costs on free hosting.
    loader: "custom",
    loaderFile: "./src/lib/image-loader.ts",
    qualities: [60, 75, 85],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
