import { pgTable, uuid, integer, timestamp, uniqueIndex, foreignKey } from 'drizzle-orm/pg-core';
import { airlines } from '../core/airlines';
import { airports } from '../core/airports';

export const routes = pgTable('routes', {
    id: uuid('id').defaultRandom().primaryKey(),
    airlineId: uuid('airline_id').notNull(),
    originAirportId: uuid('origin_airport_id').notNull(),
    destinationAirportId: uuid('destination_airport_id').notNull(),
    distanceKm: integer('distance_km'),
    blockTimeMin: integer('block_time_min'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => [
    uniqueIndex('routes_airline_origin_dest_uq').on(t.airlineId, t.originAirportId, t.destinationAirportId),
    foreignKey({ columns: [t.airlineId], foreignColumns: [airlines.id] }).onDelete('cascade'),
    foreignKey({ columns: [t.originAirportId], foreignColumns: [airports.id] }),
    foreignKey({ columns: [t.destinationAirportId], foreignColumns: [airports.id] }),
]);
