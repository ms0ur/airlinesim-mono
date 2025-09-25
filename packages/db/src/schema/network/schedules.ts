import { pgTable, uuid, integer, numeric, timestamp, index, foreignKey } from 'drizzle-orm/pg-core';
import { routes } from './routes';

export const schedules = pgTable('schedules', {
    id: uuid('id').defaultRandom().primaryKey(),
    routeId: uuid('route_id').notNull(),
    dowMask: integer('dow_mask').notNull(),
    departureMinutes: integer('departure_minutes').notNull(),
    basePrice: numeric('base_price', { precision: 12, scale: 2 }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => [
    index('schedules_route_idx').on(t.routeId),
    foreignKey({ columns: [t.routeId], foreignColumns: [routes.id] }).onDelete('cascade'),
]);
