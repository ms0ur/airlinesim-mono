CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"username" varchar(30) NOT NULL,
	"email" varchar(254) NOT NULL,
	"password" varchar(255) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
DROP INDEX "aircraft_types_icao_uq";--> statement-breakpoint
ALTER TABLE "airlines" ADD COLUMN "owner_id" uuid;--> statement-breakpoint
ALTER TABLE "aircraft_types" ADD COLUMN "manufacturer" varchar(120) NOT NULL;--> statement-breakpoint
ALTER TABLE "aircraft_types" ADD COLUMN "model" varchar(120) NOT NULL;--> statement-breakpoint
ALTER TABLE "aircraft_types" ADD COLUMN "range_km" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "aircraft_types" ADD COLUMN "cruising_speed_kph" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "aircraft_types" ADD COLUMN "characteristics" jsonb;--> statement-breakpoint
CREATE UNIQUE INDEX "users_username_idx" ON "users" USING btree ("username");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");--> statement-breakpoint
ALTER TABLE "airlines" ADD CONSTRAINT "airlines_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;