import { pgTable, uuid, varchar, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { airports } from "./airports";

export const airlines = pgTable("airlines", {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name", { length: 120 }).notNull(),
    iata: varchar("iata", { length: 2 }),                  // может быть пустым
    icao: varchar("icao", { length: 3 }).notNull().unique(),
    baseAirportId: uuid("base_airport_id").references(() => airports.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => [
    uniqueIndex("airlines_icao_uq").on(t.icao),
]);