import { PrismaClient } from "@prisma/client";

// One client per server process. Next dev hot-reloads modules often; without
// the global cache every reload would open a fresh pool.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const db = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
