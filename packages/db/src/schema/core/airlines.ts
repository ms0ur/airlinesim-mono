import { pgTable, uuid, varchar, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';

export const airlines = pgTable('airlines', {
    id: uuid('id').defaultRandom().primaryKey(),
    name: varchar('name', { length: 120 }).notNull(),
    iata: varchar('iata', { length: 2 }),
    icao: varchar('icao', { length: 3 }).notNull().unique(),
    baseAirportId: uuid('base_airport_id'), // references('airports.id')
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => [
    uniqueIndex('airlines_icao_uq').on(t.icao),
]);
