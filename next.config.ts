import type { NextConfig } from "next";

const API_PROXY_TARGET = process.env.API_PROXY_TARGET ?? "http://localhost:9080";
const API_PROXY_PRESERVE_SERVICE_PREFIX =
  process.env.API_PROXY_PRESERVE_SERVICE_PREFIX === "true";

function upstreamPath(service: "identity" | "tenant") {
  return API_PROXY_PRESERVE_SERVICE_PREFIX
    ? `${API_PROXY_TARGET}/${service}/:path*`
    : `${API_PROXY_TARGET}/:path*`;
}

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/identity/:path*",
        destination: upstreamPath("identity"),
      },
      {
        source: "/tenant/:path*",
        destination: upstreamPath("tenant"),
      },
    ];
  },
};

export default nextConfig;
