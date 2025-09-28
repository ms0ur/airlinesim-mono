ALTER TABLE "airports" ALTER COLUMN "icao" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "airports" ADD COLUMN "lat" varchar(16);--> statement-breakpoint
ALTER TABLE "airports" ADD COLUMN "lng" varchar(16);