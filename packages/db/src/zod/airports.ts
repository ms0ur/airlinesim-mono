import { z } from 'zod';
import { UUID, IATA3, ICAO4 } from './helpers.js';
import { id } from 'zod/v4/locales';

export const AirportCreate = z.object({
    iata: z.string().length(3).transform(s => s.toUpperCase()).pipe(IATA3),
    icao: z.string().length(4).transform(s => s?.toUpperCase()).pipe(ICAO4),
    name: z.string().min(2).max(120).trim(),
    lat: z.string().min(1).max(16),
    lng: z.string().min(1).max(16),
    timezone: z.string().min(1).max(64),
});

export const AirportPublic = z.object({
    id: UUID,
    iata: IATA3,
    icao: ICAO4,
    name: z.string(),
    lat: z.string(),
    lng: z.string(),
    timezone: z.string(),
    createdAt: z.string(),
});

export const AirportUpdate = z.object({
    id: UUID,
    iata: z.string().length(3).optional().transform(s => s?.toUpperCase()).pipe(IATA3.optional()),
    icao: z.string().length(4).optional().transform(s => s?.toUpperCase()).pipe(ICAO4.optional()),
    name: z.string().min(2).max(120).trim().optional(),
    timezone: z.string().min(1).max(64).optional(),
})
