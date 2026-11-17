import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The Laravel app served every request fresh: no full-route caching.
  // cacheComponents / partialPrefetching intentionally stay off.
  experimental: {
    // requireRole() calls forbidden() on a role mismatch; Next 16 gates that
    // API behind this flag and renders app/forbidden.tsx when it is on.
    authInterrupts: true,
  },
};

export default nextConfig;
