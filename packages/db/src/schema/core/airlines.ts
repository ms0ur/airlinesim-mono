import { pgTable, uuid, varchar, timestamp, uniqueIndex, bigint, integer } from "drizzle-orm/pg-core";
import { airports } from "./airports";
import { users } from "./users";

export const airlines = pgTable(
    "airlines",
    {
        id: uuid("id").defaultRandom().primaryKey(),
        name: varchar("name", { length: 120 }).notNull(),
        iata: varchar("iata", { length: 2 }),
        icao: varchar("icao", { length: 3 }).notNull().unique(),
        baseAirportId: uuid("base_airport_id")
            .references(() => airports.id, { onDelete: "set null" }),
        ownerId: uuid("owner_id")
            .references(() => users.id, { onDelete: "set null" }),

        balance: bigint("balance", { mode: 'number' }).default(50000000).notNull(),
        fuelTons: integer("fuel_tons").default(30000).notNull(),

        createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    },
    (t) => [uniqueIndex("airlines_icao_uq").on(t.icao)]
);
