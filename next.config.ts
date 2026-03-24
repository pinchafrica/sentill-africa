import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,          // security: don't expose Next.js version
  compress: true,                  // enable gzip compression
  // output: "standalone",            // compress build size to <100MB for cPanel node.js app
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.sentill.africa" },
      { protocol: "https", hostname: "**" }, // allow all HTTPS images during dev/preview
    ],
    formats: ["image/avif", "image/webp"],
  },
  async redirects() {
    return [
      // T-Bills alias → canonical Treasury Bills page
      { source: "/markets/tbills", destination: "/markets/treasuries", permanent: true },
      // Academy aliases
      { source: "/learn", destination: "/academy", permanent: true },
      { source: "/courses", destination: "/academy", permanent: true },
      // Tools alias
      { source: "/tools/dhowcsd", destination: "/markets/treasuries", permanent: false },
    ];
  },
};

export default nextConfig;
