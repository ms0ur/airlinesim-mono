import { z } from 'zod';
import { UUID, IATA2, ICAO3 } from './helpers.js';

export const AirlineCreate = z.object({
    iata: z.string().length(2).transform(s => s.toUpperCase()).pipe(IATA2),
    icao: z.string().length(3).transform(s => s.toUpperCase()).pipe(ICAO3),
    name: z.string().min(2).max(120).trim(),
    baseAirportId: UUID,
    ownerId: UUID.optional(),
    startingAircraftTypeId: UUID.optional(), // First aircraft type to add
});

export const AirlinePublic = z.object({
    id: UUID,
    iata: IATA2,
    icao: ICAO3,
    name: z.string(),
    baseAirportId: UUID,
    ownerId: UUID.nullable().optional(),
    balance: z.number(),
    fuelTons: z.number(),
    createdAt: z.string(),
});

export const AirlineUpdate = z.object({
    id: UUID,
    iata: z.string().length(2).optional().transform(s => s?.toUpperCase()).pipe(IATA2.optional()),
    icao: z.string().length(3).optional().transform(s => s?.toUpperCase()).pipe(ICAO3.optional()),
    name: z.string().min(2).max(120).trim().optional(),
    baseAirportId: UUID.optional(),
    ownerId: UUID.optional(),
    balance: z.number().optional(),
    fuelTons: z.number().optional(),
})