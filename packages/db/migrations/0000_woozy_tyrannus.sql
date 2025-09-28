CREATE TABLE "airlines" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(120) NOT NULL,
	"iata" varchar(2),
	"icao" varchar(3) NOT NULL,
	"base_airport_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "airlines_icao_unique" UNIQUE("icao")
);
--> statement-breakpoint
CREATE TABLE "airports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"iata" varchar(3) NOT NULL,
	"icao" varchar(4),
	"name" varchar(120) NOT NULL,
	"timezone" varchar(64) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "aircraft_types" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(120) NOT NULL,
	"icao" varchar(4) NOT NULL,
	"iata" varchar(3),
	"seats_economy" integer NOT NULL,
	"seats_business" integer DEFAULT 0 NOT NULL,
	"seats_first" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "aircraft" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"airline_id" uuid NOT NULL,
	"type_id" uuid NOT NULL,
	"tail_number" varchar(16) NOT NULL,
	"in_service" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "routes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"airline_id" uuid NOT NULL,
	"origin_airport_id" uuid NOT NULL,
	"destination_airport_id" uuid NOT NULL,
	"distance_km" integer,
	"block_time_min" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "schedules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"route_id" uuid NOT NULL,
	"dow_mask" integer NOT NULL,
	"departure_minutes" integer NOT NULL,
	"base_price" numeric(12, 2) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "flights" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"schedule_id" uuid,
	"route_id" uuid NOT NULL,
	"aircraft_id" uuid NOT NULL,
	"departure_utc" timestamp with time zone NOT NULL,
	"arrival_utc" timestamp with time zone NOT NULL,
	"status" varchar(24) DEFAULT 'scheduled' NOT NULL,
	"total_economy" integer DEFAULT 0 NOT NULL,
	"sold_economy" integer DEFAULT 0 NOT NULL,
	"revenue_economy" numeric(12, 2) DEFAULT '0' NOT NULL,
	"total_business" integer DEFAULT 0 NOT NULL,
	"sold_business" integer DEFAULT 0 NOT NULL,
	"revenue_business" numeric(12, 2) DEFAULT '0' NOT NULL,
	"total_first" integer DEFAULT 0 NOT NULL,
	"sold_first" integer DEFAULT 0 NOT NULL,
	"revenue_first" numeric(12, 2) DEFAULT '0' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "airlines" ADD CONSTRAINT "airlines_base_airport_id_airports_id_fk" FOREIGN KEY ("base_airport_id") REFERENCES "public"."airports"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "aircraft" ADD CONSTRAINT "aircraft_airline_id_airlines_id_fk" FOREIGN KEY ("airline_id") REFERENCES "public"."airlines"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "aircraft" ADD CONSTRAINT "aircraft_type_id_aircraft_types_id_fk" FOREIGN KEY ("type_id") REFERENCES "public"."aircraft_types"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "routes" ADD CONSTRAINT "routes_airline_id_airlines_id_fk" FOREIGN KEY ("airline_id") REFERENCES "public"."airlines"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "routes" ADD CONSTRAINT "routes_origin_airport_id_airports_id_fk" FOREIGN KEY ("origin_airport_id") REFERENCES "public"."airports"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "routes" ADD CONSTRAINT "routes_destination_airport_id_airports_id_fk" FOREIGN KEY ("destination_airport_id") REFERENCES "public"."airports"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "schedules" ADD CONSTRAINT "schedules_route_id_routes_id_fk" FOREIGN KEY ("route_id") REFERENCES "public"."routes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "flights" ADD CONSTRAINT "flights_schedule_id_schedules_id_fk" FOREIGN KEY ("schedule_id") REFERENCES "public"."schedules"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "flights" ADD CONSTRAINT "flights_route_id_routes_id_fk" FOREIGN KEY ("route_id") REFERENCES "public"."routes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "flights" ADD CONSTRAINT "flights_aircraft_id_aircraft_id_fk" FOREIGN KEY ("aircraft_id") REFERENCES "public"."aircraft"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "airlines_icao_uq" ON "airlines" USING btree ("icao");--> statement-breakpoint
CREATE UNIQUE INDEX "airports_iata_uq" ON "airports" USING btree ("iata");--> statement-breakpoint
CREATE UNIQUE INDEX "aircraft_types_icao_uq" ON "aircraft_types" USING btree ("icao");--> statement-breakpoint
CREATE UNIQUE INDEX "aircraft_tail_uq" ON "aircraft" USING btree ("tail_number");--> statement-breakpoint
CREATE UNIQUE INDEX "routes_airline_origin_dest_uq" ON "routes" USING btree ("airline_id","origin_airport_id","destination_airport_id");--> statement-breakpoint
CREATE INDEX "schedules_route_idx" ON "schedules" USING btree ("route_id");--> statement-breakpoint
CREATE INDEX "flights_route_dep_idx" ON "flights" USING btree ("route_id","departure_utc");