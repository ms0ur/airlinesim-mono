// packages/db/src/schema/airports.ts
import {
    pgTable, uuid, varchar, timestamp,
    uniqueIndex, doublePrecision,
} from "drizzle-orm/pg-core";
import { customType } from "drizzle-orm/pg-core";

// PostGIS типы: объявляем через customType (генерация — в миграции)
const geography = customType<{ data: unknown }>({
    dataType() { return "geography(Point,4326)"; },
});

const geometry = customType<{ data: unknown }>({
    dataType() { return "geometry(Point,4326)"; },
});

export const airports = pgTable("airports", {
    id: uuid("id").defaultRandom().primaryKey(),

    iata: varchar("iata", { length: 3 }).notNull(),
    icao: varchar("icao", { length: 4 }).notNull(),

    name: varchar("name", { length: 120 }).notNull(),
    timezone: varchar("timezone", { length: 64 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),

    lat: doublePrecision("lat").notNull(),
    lon: doublePrecision("lon").notNull(),

    geog: geography("geog").notNull(),
    geom: geometry("geom").notNull(),
}, (t) => [
    uniqueIndex("airports_iata_uq").on(t.iata),
    uniqueIndex("airports_icao_uq").on(t.icao),
]);
