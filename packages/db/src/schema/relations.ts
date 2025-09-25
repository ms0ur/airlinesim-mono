// packages/db/src/schema/relations.ts
import { relations } from 'drizzle-orm';
import { airlines } from './core/airlines';
import { airports } from './core/airports';
import { aircraftTypes } from './fleet/aircraft-types';
import { aircraft } from './fleet/aircraft';
import { routes } from './network/routes';
import { schedules } from './network/schedules';
import { flights } from './ops/flights';

export const airlinesRelations = relations(airlines, ({ one, many }) => ({
    aircraft: many(aircraft),
    routes: many(routes),
    baseAirportId: one(airports),
}));

export const airportsRelations = relations(airports, ({ many }) => ({
    originRoutes: many(routes, { relationName: 'origin' }),
    destinationRoutes: many(routes, { relationName: 'destination' }),
}));

export const aircraftTypesRelations = relations(aircraftTypes, ({ many }) => ({
    aircraft: many(aircraft),
}));

export const aircraftRelations = relations(aircraft, ({ one, many }) => ({
    airline: one(airlines, { fields: [aircraft.airlineId], references: [airlines.id] }),
    type:    one(aircraftTypes, { fields: [aircraft.typeId], references: [aircraftTypes.id] }),
    flights: many(flights),
}));

export const routesRelations = relations(routes, ({ one, many }) => ({
    airline: one(airlines, { fields: [routes.airlineId], references: [airlines.id] }),
    origin:  one(airports, { fields: [routes.originAirportId], references: [airports.id], relationName: 'origin' }),
    destination: one(airports, { fields: [routes.destinationAirportId], references: [airports.id], relationName: 'destination' }),
    schedules: many(schedules),
    flights:   many(flights),
}));

export const schedulesRelations = relations(schedules, ({ one, many }) => ({
    route:   one(routes, { fields: [schedules.routeId], references: [routes.id] }),
    flights: many(flights),
}));

export const flightsRelations = relations(flights, ({ one }) => ({
    route:    one(routes,   { fields: [flights.routeId],   references: [routes.id] }),
    schedule: one(schedules,{ fields: [flights.scheduleId],references: [schedules.id] }),
    aircraft: one(aircraft, { fields: [flights.aircraftId],references: [aircraft.id] }),
}));
