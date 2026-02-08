import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Allow up to 3 image files (max 5MB each) plus multipart overhead.
      bodySizeLimit: "20mb",
    },
  },
};

export default nextConfig;
