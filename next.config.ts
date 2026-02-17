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
};

export default nextConfig;
