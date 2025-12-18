import { z } from 'zod';
import { UUID, IATA3, ICAO4 } from './helpers.js';

/** Приведение к строке */
const NumberFromUserInput = (min: number, max: number) =>
    z.preprocess((v) => {
        if (typeof v === 'string') {
            const s = v.trim();
            if (s === '') return undefined;
            const n = Number(s.replace(',', '.'));
            return Number.isNaN(n) ? v : n;
        }
        return v;
    }, z.number()
        .refine(Number.isFinite, 'Должно быть конечным числом')
        .min(min)
        .max(max));

/** апперкейс */
const UpperOpt = (base: z.ZodTypeAny) =>
    z.preprocess((v) => (typeof v === 'string' ? v.toUpperCase() : v), base);

/** Проверка таймзоны */
const IanaTimezone = z
    .string()
    .min(1)
    .max(64)
    .regex(/^([A-Za-z_]+(?:\/[A-Za-z0-9_+\-]+)+|UTC|GMT)$/, 'Неверный формат IANA таймзоны');

/**
 * Создание аэропорта.
 * `lat/lon` допускают как number, так и строку "55.7522" / "55,7522".
 */
export const AirportCreate = z.object({
    iata: UpperOpt(IATA3.optional().nullable()),
    icao: UpperOpt(ICAO4),
    name: z.string().min(2).max(120).trim(),
    lat: NumberFromUserInput(-90, 90),
    lon: NumberFromUserInput(-180, 180),
    timezone: IanaTimezone,

    type: z.string().max(32).default('small_airport'),
    continent: z.string().length(2).nullable().optional(),
    isoCountry: z.string().length(2).nullable().optional(),
    isoRegion: z.string().max(10).nullable().optional(),
    municipality: z.string().max(120).nullable().optional(),
    scheduledService: z.string().max(10).default('no'),
    gpsCode: z.string().max(10).nullable().optional(),
    localCode: z.string().max(10).nullable().optional(),
    elevationFt: z.number().nullable().optional(),
    homeLink: z.string().nullable().optional(),
    wikipediaLink: z.string().nullable().optional(),
    keywords: z.string().nullable().optional(),
});

/**
 * Публичный вид аэропорта.
 */
export const AirportPublic = z.object({
    id: UUID,
    iata: IATA3.nullable().optional(),
    icao: ICAO4,
    name: z.string(),
    lat: z.number(),
    lon: z.number(),
    timezone: IanaTimezone,
    createdAt: z.string(),

    type: z.string(),
    continent: z.string().nullable().optional(),
    isoCountry: z.string().nullable().optional(),
    isoRegion: z.string().nullable().optional(),
    municipality: z.string().nullable().optional(),
    scheduledService: z.string(),
    gpsCode: z.string().nullable().optional(),
    localCode: z.string().nullable().optional(),
    elevationFt: z.number().nullable().optional(),
    homeLink: z.string().nullable().optional(),
    wikipediaLink: z.string().nullable().optional(),
    keywords: z.string().nullable().optional(),
});

/**
 * Обновление аэропорта
 */
export const AirportUpdate = z.object({
    id: UUID,
    iata: UpperOpt(IATA3.optional().nullable()),
    icao: UpperOpt(ICAO4.optional()),
    name: z.string().min(2).max(120).trim().optional(),
    timezone: IanaTimezone.optional(),
    lat: NumberFromUserInput(-90, 90).optional(),
    lon: NumberFromUserInput(-180, 180).optional(),

    type: z.string().max(32).optional(),
    continent: z.string().length(2).nullable().optional(),
    isoCountry: z.string().length(2).nullable().optional(),
    isoRegion: z.string().max(10).nullable().optional(),
    municipality: z.string().max(120).nullable().optional(),
    scheduledService: z.string().max(10).optional(),
    gpsCode: z.string().max(10).nullable().optional(),
    localCode: z.string().max(10).nullable().optional(),
    elevationFt: z.number().nullable().optional(),
    homeLink: z.string().nullable().optional(),
    wikipediaLink: z.string().nullable().optional(),
    keywords: z.string().nullable().optional(),
});

export const AirportWithDistance = AirportPublic.extend({
    distanceKm: z.number().nonnegative().optional(),
});
