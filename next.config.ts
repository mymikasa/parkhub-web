import type { NextConfig } from "next";

const API_PROXY_TARGET = process.env.API_PROXY_TARGET ?? "http://localhost:9080";
const API_PROXY_PRESERVE_SERVICE_PREFIX =
  process.env.API_PROXY_PRESERVE_SERVICE_PREFIX === "true";

function upstreamPath(service: "identity" | "tenant" | "parking") {
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
      {
        source: "/api/v1/:path*",
        destination: `${API_PROXY_TARGET}/api/v1/:path*`,
      },
      {
        source: "/parking/:path*",
        destination: upstreamPath("parking"),
      },
    ];
  },
};

export default nextConfig;
