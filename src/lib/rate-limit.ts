import { createHmac } from "node:crypto";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

const windowSeconds = {
  ticketLookup: 15 * 60,
  staffAuth: 15 * 60,
  checkIn: 60,
} as const;

export type RateLimitScope = keyof typeof windowSeconds;

/** Read the proxy-provided client address. Configure the hosting proxy to set one of these headers. */
export async function getRequestClientAddress(): Promise<string> {
  const requestHeaders = await headers();
  const realIp = requestHeaders.get("x-real-ip")?.trim();
  if (realIp && realIp.length <= 64) return realIp;

  const forwardedFor = requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwardedFor && forwardedFor.length <= 64 ? forwardedFor : "unknown";
}

/** Uses PostgreSQL upsert so counters stay atomic and shared across app processes. Raw subjects are never stored. */
export async function consumeRateLimit(
  scope: RateLimitScope,
  subject: string,
  limit: number,
): Promise<boolean> {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET is required for rate limiting");

  const key = createHmac("sha256", secret).update(`${scope}:${subject}`).digest("hex");
  const seconds = windowSeconds[scope];

  const result = await prisma.$queryRaw<{ attempts: number }[]>`
    INSERT INTO "rate_limit_buckets" ("key", "attempts", "window_started_at", "expires_at")
    VALUES (${key}, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + make_interval(secs => ${seconds}))
    ON CONFLICT ("key") DO UPDATE SET
      "attempts" = CASE
        WHEN "rate_limit_buckets"."expires_at" <= CURRENT_TIMESTAMP THEN 1
        ELSE "rate_limit_buckets"."attempts" + 1
      END,
      "window_started_at" = CASE
        WHEN "rate_limit_buckets"."expires_at" <= CURRENT_TIMESTAMP THEN CURRENT_TIMESTAMP
        ELSE "rate_limit_buckets"."window_started_at"
      END,
      "expires_at" = CASE
        WHEN "rate_limit_buckets"."expires_at" <= CURRENT_TIMESTAMP
          THEN CURRENT_TIMESTAMP + make_interval(secs => ${seconds})
        ELSE "rate_limit_buckets"."expires_at"
      END
    RETURNING "attempts"
  `;

  // Opportunistically prune old address buckets in small batches without a separate scheduler.
  if (Math.random() < 0.02) {
    try {
      await prisma.$executeRaw`
        WITH expired AS (
          SELECT "key" FROM "rate_limit_buckets"
          WHERE "expires_at" < CURRENT_TIMESTAMP
          ORDER BY "expires_at"
          LIMIT 100
        )
        DELETE FROM "rate_limit_buckets" AS buckets
        USING expired
        WHERE buckets."key" = expired."key"
      `;
    } catch (error) {
      console.error("EntryFlow rate-limit cleanup failed", { errorType: error instanceof Error ? error.name : "UnknownError" });
    }
  }

  return (result[0]?.attempts ?? limit + 1) <= limit;
}
