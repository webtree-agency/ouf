import type { NextConfig } from "next";

// SVGO wirft die `viewBox` sonst ab, und ein Icon in anderer Grösse wird abgeschnitten.
const SVGR = {
  svgoConfig: {
    plugins: [
      {
        name: "preset-default",
        params: { overrides: { removeViewBox: false } },
      },
    ],
  },
};

const nextConfig: NextConfig = {
  output: "standalone",
  poweredByHeader: false,
  // Ein Import darf 2 MB haben; Server Actions nehmen von Haus aus nur 1 MB.
  experimental: { serverActions: { bodySizeLimit: "3mb" } },
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: [{ loader: "@svgr/webpack", options: SVGR }],
    });
    return config;
  },
  turbopack: {
    root: __dirname,
    rules: {
      "*.svg": {
        loaders: [{ loader: "@svgr/webpack", options: SVGR }],
        as: "*.js",
      },
    },
  },
};

export default nextConfig;
