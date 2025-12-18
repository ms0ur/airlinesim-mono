import { pgTable, uuid, varchar, integer, timestamp, jsonb, uniqueIndex } from 'drizzle-orm/pg-core';
import { uploads } from '../core/uploads';

export const aircraftTypes = pgTable('aircraft_types', {
    id: uuid('id').defaultRandom().primaryKey(),

    displayName: varchar('name', { length: 120 }).notNull(),
    manufacturer: varchar('manufacturer', { length: 120 }).notNull(),
    model: varchar('model', { length: 120 }).notNull(),

    icao: varchar('icao', { length: 4 }).notNull(),
    iata: varchar('iata', { length: 3 }),

    imageId: uuid('image_id').references(() => uploads.id, { onDelete: 'set null' }),

    rangeKm: integer('range_km').notNull(),
    cruisingSpeedKph: integer('cruising_speed_kph').notNull(),
    seatCapacity: integer('seat_capacity').notNull(),

    characteristics: jsonb('characteristics').$type<Record<string, unknown>>(),

    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => [
    uniqueIndex('aircraft_types_icao_uq').on(t.icao),
]);
