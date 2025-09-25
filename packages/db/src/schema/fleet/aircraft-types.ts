import { pgTable, uuid, varchar, integer, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';

export const aircraftTypes = pgTable('aircraft_types', {
    id: uuid('id').defaultRandom().primaryKey(),
    name: varchar('name', { length: 120 }).notNull(),
    icao: varchar('icao', { length: 4 }).notNull(),
    iata: varchar('iata', { length: 3 }),
    seatsEconomy: integer('seats_economy').notNull(),
    seatsBusiness: integer('seats_business').default(0).notNull(),
    seatsFirst: integer('seats_first').default(0).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => [
    uniqueIndex('aircraft_types_icao_uq').on(t.icao),
]);
