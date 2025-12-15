-- Add airline resources for dashboard
ALTER TABLE "airlines" ADD COLUMN IF NOT EXISTS "balance" bigint DEFAULT 50000000 NOT NULL;
ALTER TABLE "airlines" ADD COLUMN IF NOT EXISTS "fuel_tons" integer DEFAULT 30000 NOT NULL;

