CREATE TABLE "uploads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"filename" varchar(255) NOT NULL,
	"original_name" varchar(255) NOT NULL,
	"mime_type" varchar(100) NOT NULL,
	"size" integer NOT NULL,
	"path" varchar(500) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "aircraft_types" ADD COLUMN "image_id" uuid;--> statement-breakpoint
ALTER TABLE "aircraft_types" ADD CONSTRAINT "aircraft_types_image_id_uploads_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."uploads"("id") ON DELETE set null ON UPDATE no action;