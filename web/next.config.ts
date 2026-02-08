import type { NextConfig } from "next";

const isProduction = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Allow up to 3 image files (max 5MB each) plus multipart overhead.
      bodySizeLimit: "20mb",
    },
  },
  async headers() {
    const baseHeaders = [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
      { key: "X-DNS-Prefetch-Control", value: "off" },
      { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
    ];

    if (isProduction) {
      baseHeaders.push({ key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains; preload" });
    }

    return [
      {
        source: "/(.*)",
        headers: baseHeaders,
      },
    ];
  },
};

export default nextConfig;
