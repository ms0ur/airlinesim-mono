// packages/db/src/schema/aircraft.ts
import { pgTable, uuid, varchar, integer, timestamp, jsonb } from 'drizzle-orm/pg-core';

export const aircraftTypes = pgTable('aircraft_types', {
    id: uuid('id').defaultRandom().primaryKey(),

    displayName: varchar('name', { length: 120 }).notNull(),
    manufacturer: varchar('manufacturer', { length: 120 }).notNull(),
    model: varchar('model', { length: 120 }).notNull(),

    icao: varchar('icao', { length: 4 }).notNull(), // пример: A320, B738, A35K
    iata: varchar('iata', { length: 3 }),           // пример: 320, 738, 351, 7M8

    // ТТХ
    rangeKm: integer('range_km').notNull(),
    cruisingSpeedKph: integer('cruising_speed_kph').notNull(),
    seatCapacity: integer('seat_capacity').notNull(),

    // Произвольные характеристики
    characteristics: jsonb('characteristics').$type<Record<string, unknown>>(),

    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});
