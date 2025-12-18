CREATE TABLE "regions" (
	"code" varchar(10) PRIMARY KEY NOT NULL,
	"local_code" varchar(10),
	"name" varchar(120) NOT NULL,
	"continent" varchar(2) NOT NULL,
	"iso_country" varchar(2) NOT NULL,
	"wikipedia_link" text,
	"keywords" text
);
--> statement-breakpoint
ALTER TABLE "airports" ADD COLUMN "scheduled_service" varchar(10) DEFAULT 'no' NOT NULL;--> statement-breakpoint
ALTER TABLE "airports" ADD COLUMN "home_link" text;--> statement-breakpoint
ALTER TABLE "airports" ADD COLUMN "wikipedia_link" text;--> statement-breakpoint
ALTER TABLE "airports" ADD COLUMN "keywords" text;