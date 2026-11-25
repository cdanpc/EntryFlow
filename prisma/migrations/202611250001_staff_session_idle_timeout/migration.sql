CREATE TABLE "staff_sessions" (
  "id" TEXT NOT NULL,
  "staff_user_id" TEXT NOT NULL,
  "last_activity_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "expires_at" TIMESTAMPTZ(3) NOT NULL,
  CONSTRAINT "staff_sessions_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "staff_sessions_expires_at_idx" ON "staff_sessions"("expires_at");

ALTER TABLE "staff_sessions" ADD CONSTRAINT "staff_sessions_staff_user_id_fkey"
  FOREIGN KEY ("staff_user_id") REFERENCES "staff_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
