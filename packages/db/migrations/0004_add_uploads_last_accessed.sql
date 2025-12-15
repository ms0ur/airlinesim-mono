ALTER TABLE "uploads" ADD COLUMN "last_accessed_at" timestamp with time zone DEFAULT now() NOT NULL;

