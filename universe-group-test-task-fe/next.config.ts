import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Emits `.next/standalone/` — a minimal self-contained server bundle
  // (just the code it actually needs, plus a pruned node_modules). The
  // production Dockerfile copies this into a slim runtime image, which
  // keeps the final image small (~150MB vs ~1GB for full node_modules).
  output: "standalone",
};

export default nextConfig;
