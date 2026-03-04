import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  devIndicators: false,
  webpack: (config) => {
    config.resolve = config.resolve ?? {};
    config.resolve.alias = {
      ...(config.resolve.alias ?? {}),
      "@vercel/flags-definitions": path.resolve(
        process.cwd(),
        "lib/vercel-flags-definitions-shim.ts",
      ),
    };
    return config;
  },
  onDemandEntries: {
    maxInactiveAge: 1000 * 60 * 60,
    pagesBufferLength: 5,
  },
  logging: {
    fetches: {
      fullUrl: process.env.NODE_ENV === "development" ? false : true,
    },
  },
};

export default nextConfig;
