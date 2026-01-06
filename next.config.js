import bundleAnalyzer from "@next/bundle-analyzer";

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  /**
   * REQUIRED for Capacitor
   * Generates `out/` directory
   */

  /**
   * REQUIRED for static export
   * Next/Image optimization does NOT work in export mode
   */
  images: {
    unoptimized: true,
  },

  /**
   * Faster builds
   */
  eslint: {
    ignoreDuringBuilds: true,
  },

  /**
   * Experimental features (safe)
   */
  experimental: {
    optimizeCss: true,
    scrollRestoration: true,
  },
};

export default withBundleAnalyzer(nextConfig);
