import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      // Markdown mirror: /posts/<slug>.md serves the raw markdown for agents.
      { source: "/posts/:slug.md", destination: "/api/md/:slug" },
    ];
  },
};

export default nextConfig;
