CREATE TABLE IF NOT EXISTS "fuel_prices" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "price_per_ton" integer NOT NULL,
    "recorded_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "fuel_prices_recorded_at_idx" ON "fuel_prices" ("recorded_at" DESC);

