import { db } from "./db";

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  retryAfter: number;
};

const PREFIX = "throttle:";

/**
 * The Laravel routes carried `throttle:N,1` — N hits per minute per key, kept
 * in the database cache. This is that counter, same table, same semantics.
 */
export async function rateLimit(
  key: string,
  maxAttempts: number,
  windowSeconds = 60,
): Promise<RateLimitResult> {
  const cacheKey = PREFIX + key;
  const now = Math.floor(Date.now() / 1000);
  const expiresAt = now + windowSeconds;

  const row = await db.cache.findUnique({ where: { key: cacheKey } });

  if (!row || row.expiration <= now) {
    await db.cache.upsert({
      where: { key: cacheKey },
      create: { key: cacheKey, value: "1", expiration: expiresAt },
      update: { value: "1", expiration: expiresAt },
    });
    return { allowed: true, remaining: Math.max(0, maxAttempts - 1), retryAfter: 0 };
  }

  const attempts = Number(row.value || "0") + 1;

  if (attempts > maxAttempts) {
    await db.cache.update({
      where: { key: cacheKey },
      data: { value: String(attempts) },
    });
    return {
      allowed: false,
      remaining: 0,
      retryAfter: Math.max(1, row.expiration - now),
    };
  }

  await db.cache.update({
    where: { key: cacheKey },
    data: { value: String(attempts) },
  });

  return {
    allowed: true,
    remaining: Math.max(0, maxAttempts - attempts),
    retryAfter: 0,
  };
}
