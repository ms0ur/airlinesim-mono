CREATE TYPE "public"."event_action" AS ENUM('none', 'optional', 'required');--> statement-breakpoint
CREATE TYPE "public"."event_severity" AS ENUM('minor', 'major', 'crisis');--> statement-breakpoint
CREATE TYPE "public"."event_status" AS ENUM('active', 'pendingDecision', 'resolved', 'expired');--> statement-breakpoint
CREATE TYPE "public"."metric_key" AS ENUM('fuelPrice', 'demand', 'airportCapacity', 'reputation', 'costIndex');--> statement-breakpoint
CREATE TYPE "public"."modifier_kind" AS ENUM('multiplier', 'delta');--> statement-breakpoint
CREATE TABLE "countries" (
	"code" varchar(2) PRIMARY KEY NOT NULL,
	"name" varchar(120) NOT NULL,
	"continent" varchar(2) NOT NULL,
	"wikipedia_link" text
);
--> statement-breakpoint
CREATE TABLE "runways" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"airport_id" uuid NOT NULL,
	"ident" varchar(10) NOT NULL,
	"length_ft" integer,
	"width_ft" integer,
	"surface" varchar(64),
	"lighted" boolean DEFAULT false NOT NULL,
	"closed" boolean DEFAULT false NOT NULL,
	"le_ident" varchar(10),
	"he_ident" varchar(10),
	"le_lat" double precision,
	"le_lon" double precision,
	"he_lat" double precision,
	"he_lon" double precision
);
--> statement-breakpoint
CREATE TABLE "event_instances" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"world_id" integer NOT NULL,
	"seq" bigserial NOT NULL,
	"event_id" text NOT NULL,
	"severity" "event_severity" DEFAULT 'minor' NOT NULL,
	"requires_action" "event_action" DEFAULT 'none' NOT NULL,
	"status" "event_status" DEFAULT 'active' NOT NULL,
	"title_key" text NOT NULL,
	"description_key" text NOT NULL,
	"source_key" text NOT NULL,
	"payload" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"starts_at" timestamp with time zone DEFAULT now() NOT NULL,
	"ends_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "metric_modifiers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"world_id" integer NOT NULL,
	"event_instance_id" uuid NOT NULL,
	"metric" "metric_key" NOT NULL,
	"target_key" text NOT NULL,
	"kind" "modifier_kind" NOT NULL,
	"factor" numeric(12, 6),
	"amount" numeric(14, 4),
	"starts_at" timestamp with time zone NOT NULL,
	"ends_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fuel_prices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"price_per_ton" integer NOT NULL,
	"recorded_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "airlines" ADD COLUMN "balance" bigint DEFAULT 50000000 NOT NULL;--> statement-breakpoint
ALTER TABLE "airlines" ADD COLUMN "fuel_tons" integer DEFAULT 30000 NOT NULL;--> statement-breakpoint
ALTER TABLE "airports" ADD COLUMN "type" varchar(32) DEFAULT 'small_airport' NOT NULL;--> statement-breakpoint
ALTER TABLE "airports" ADD COLUMN "continent" varchar(2);--> statement-breakpoint
ALTER TABLE "airports" ADD COLUMN "iso_country" varchar(2);--> statement-breakpoint
ALTER TABLE "airports" ADD COLUMN "iso_region" varchar(10);--> statement-breakpoint
ALTER TABLE "airports" ADD COLUMN "municipality" varchar(120);--> statement-breakpoint
ALTER TABLE "airports" ADD COLUMN "gps_code" varchar(10);--> statement-breakpoint
ALTER TABLE "airports" ADD COLUMN "local_code" varchar(10);--> statement-breakpoint
ALTER TABLE "airports" ADD COLUMN "elevation_ft" integer;--> statement-breakpoint
ALTER TABLE "uploads" ADD COLUMN "last_accessed_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "runways" ADD CONSTRAINT "runways_airport_id_airports_id_fk" FOREIGN KEY ("airport_id") REFERENCES "public"."airports"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "metric_modifiers" ADD CONSTRAINT "metric_modifiers_event_instance_id_event_instances_id_fk" FOREIGN KEY ("event_instance_id") REFERENCES "public"."event_instances"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "event_instances_world_seq_uq" ON "event_instances" USING btree ("world_id","seq");--> statement-breakpoint
CREATE INDEX "event_instances_world_created_idx" ON "event_instances" USING btree ("world_id","created_at");--> statement-breakpoint
CREATE INDEX "metric_modifiers_active_lookup_idx" ON "metric_modifiers" USING btree ("world_id","metric","target_key","starts_at","ends_at");