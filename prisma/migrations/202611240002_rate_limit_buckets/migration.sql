CREATE TABLE "rate_limit_buckets" (
  "key" TEXT NOT NULL,
  "attempts" INTEGER NOT NULL,
  "window_started_at" TIMESTAMPTZ(3) NOT NULL,
  "expires_at" TIMESTAMPTZ(3) NOT NULL,
  CONSTRAINT "rate_limit_buckets_pkey" PRIMARY KEY ("key"),
  CONSTRAINT "rate_limit_buckets_attempts_positive" CHECK ("attempts" >= 1)
);

CREATE INDEX "rate_limit_buckets_expires_at_idx" ON "rate_limit_buckets" ("expires_at");
