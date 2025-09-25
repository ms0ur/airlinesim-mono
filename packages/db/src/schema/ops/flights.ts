import { pgTable, uuid, varchar, timestamp, integer, numeric, index, foreignKey } from 'drizzle-orm/pg-core';
import { schedules } from '../network/schedules';
import { routes } from '../network/routes';
import { aircraft } from '../fleet/aircraft';

export const flights = pgTable('flights', {
    id: uuid('id').defaultRandom().primaryKey(),

    // связи
    scheduleId: uuid('schedule_id'),                // nullable для чартеров/разовых
    routeId: uuid('route_id').notNull(),
    aircraftId: uuid('aircraft_id').notNull(),

    // время/статус
    departureUtc: timestamp('departure_utc', { withTimezone: true }).notNull(),
    arrivalUtc:   timestamp('arrival_utc',   { withTimezone: true }).notNull(),
    status: varchar('status', { length: 24 }).default('scheduled').notNull(),

    // ПРОСТО ЦИФРЫ: вместимость, продано, выручка — всё внутри рейса
    totalEconomy:  integer('total_economy').default(0).notNull(),
    soldEconomy:   integer('sold_economy').default(0).notNull(),
    revenueEconomy: numeric('revenue_economy', { precision: 12, scale: 2 }).default('0').notNull(),

    totalBusiness:  integer('total_business').default(0).notNull(),
    soldBusiness:   integer('sold_business').default(0).notNull(),
    revenueBusiness: numeric('revenue_business', { precision: 12, scale: 2 }).default('0').notNull(),

    totalFirst:  integer('total_first').default(0).notNull(),
    soldFirst:   integer('sold_first').default(0).notNull(),
    revenueFirst: numeric('revenue_first', { precision: 12, scale: 2 }).default('0').notNull(),

    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => [
    index('flights_route_dep_idx').on(t.routeId, t.departureUtc),
    foreignKey({ columns: [t.scheduleId], foreignColumns: [schedules.id] }),
    foreignKey({ columns: [t.routeId],    foreignColumns: [routes.id] }).onDelete('cascade'),
    foreignKey({ columns: [t.aircraftId], foreignColumns: [aircraft.id] }),
]);
