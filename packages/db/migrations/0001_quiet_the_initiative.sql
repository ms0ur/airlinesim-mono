ALTER TABLE "aircraft_types" ADD COLUMN "seat_capacity" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "aircraft_types" DROP COLUMN "seats_economy";--> statement-breakpoint
ALTER TABLE "aircraft_types" DROP COLUMN "seats_business";--> statement-breakpoint
ALTER TABLE "aircraft_types" DROP COLUMN "seats_first";