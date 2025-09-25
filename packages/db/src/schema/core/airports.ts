import { pgTable, uuid, varchar, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';

export const airports = pgTable('airports', {
    id: uuid('id').defaultRandom().primaryKey(),
    iata: varchar('iata', { length: 3 }).notNull(),
    icao: varchar('icao', { length: 4 }),
    name: varchar('name', { length: 120 }).notNull(),
    timezone: varchar('timezone', { length: 64 }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => [
    uniqueIndex('airports_iata_uq').on(t.iata),
]);
