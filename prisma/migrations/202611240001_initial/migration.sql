CREATE TYPE "EventStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'CLOSED');
CREATE TYPE "RegistrationStatus" AS ENUM ('CONFIRMED', 'CHECKED_IN', 'WAITLISTED', 'CANCELLED');
CREATE TYPE "StaffRole" AS ENUM ('ORGANIZER', 'DOOR_STAFF');

CREATE TABLE "events" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "venue" TEXT NOT NULL,
  "startsAt" TIMESTAMPTZ(3) NOT NULL,
  "endsAt" TIMESTAMPTZ(3) NOT NULL,
  "capacity" INTEGER NOT NULL,
  "status" "EventStatus" NOT NULL DEFAULT 'DRAFT',
  "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ(3) NOT NULL,
  CONSTRAINT "events_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "events_capacity_positive" CHECK ("capacity" >= 1),
  CONSTRAINT "events_end_after_start" CHECK ("endsAt" > "startsAt")
);

CREATE TABLE "staff_users" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "username" TEXT NOT NULL,
  "password_hash" TEXT NOT NULL,
  "role" "StaffRole" NOT NULL DEFAULT 'ORGANIZER',
  "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "staff_users_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "registrations" (
  "id" TEXT NOT NULL,
  "event_id" TEXT NOT NULL,
  "full_name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "normalized_email" TEXT NOT NULL,
  "mobile" TEXT NOT NULL,
  "ticket_code" TEXT NOT NULL,
  "status" "RegistrationStatus" NOT NULL DEFAULT 'CONFIRMED',
  "registered_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "checked_in_at" TIMESTAMPTZ(3),
  "checked_in_by" TEXT,
  CONSTRAINT "registrations_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "registrations_event_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "registrations_staff_fkey" FOREIGN KEY ("checked_in_by") REFERENCES "staff_users"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "staff_users_username_key" ON "staff_users"("username");
CREATE UNIQUE INDEX "registrations_ticket_code_key" ON "registrations"("ticket_code");
CREATE INDEX "events_status_startsAt_idx" ON "events"("status", "startsAt");
CREATE INDEX "registrations_event_id_status_registered_at_idx" ON "registrations"("event_id", "status", "registered_at");
CREATE INDEX "registrations_event_id_normalized_email_status_idx" ON "registrations"("event_id", "normalized_email", "status");
CREATE INDEX "registrations_full_name_idx" ON "registrations"("full_name");
CREATE UNIQUE INDEX "registrations_active_email_per_event_key"
  ON "registrations"("event_id", "normalized_email")
  WHERE "status" IN ('CONFIRMED', 'CHECKED_IN');
