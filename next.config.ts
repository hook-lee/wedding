import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * Dev-server only. Next blocks its internal /_next/* requests when a page is
   * opened from an origin it doesn't recognise, so hitting the dev server from
   * a phone on the LAN loads the HTML but not the JS — the page renders and
   * nothing is clickable. Needed to test on a real device before deploying.
   * No effect on production builds.
   */
  allowedDevOrigins: ["192.168.0.113"],
};

export default nextConfig;
