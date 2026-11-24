ALTER TABLE "registrations" ADD COLUMN "manual_code" VARCHAR(6);

DO $$
DECLARE
  registration_id TEXT;
  candidate_code TEXT;
BEGIN
  FOR registration_id IN
    SELECT "id" FROM "registrations" ORDER BY "id"
  LOOP
    LOOP
      candidate_code := upper(substr(encode(uuid_send(gen_random_uuid()), 'hex'), 1, 6));
      EXIT WHEN NOT EXISTS (
        SELECT 1 FROM "registrations" WHERE "manual_code" = candidate_code
      );
    END LOOP;

    UPDATE "registrations"
    SET "manual_code" = candidate_code
    WHERE "id" = registration_id;
  END LOOP;
END $$;

ALTER TABLE "registrations" ALTER COLUMN "manual_code" SET NOT NULL;
CREATE UNIQUE INDEX "registrations_manual_code_key" ON "registrations"("manual_code");
ALTER TABLE "registrations"
  ADD CONSTRAINT "registrations_manual_code_format"
  CHECK ("manual_code" ~ '^[0-9A-HJKMNP-TV-Z]{6}$');
