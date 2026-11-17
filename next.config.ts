import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The Laravel app served every request fresh: no full-route caching.
  // cacheComponents / partialPrefetching intentionally stay off.
};

export default nextConfig;
