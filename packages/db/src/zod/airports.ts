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
    iata: UpperOpt(IATA3),
    icao: UpperOpt(ICAO4),
    name: z.string().min(2).max(120).trim(),
    lat: NumberFromUserInput(-90, 90),
    lon: NumberFromUserInput(-180, 180),
    timezone: IanaTimezone,
});

/**
 * Публичный вид аэропорта.
 */
export const AirportPublic = z.object({
    id: UUID,
    iata: IATA3,
    icao: ICAO4,
    name: z.string(),
    lat: z.number(),
    lon: z.number(),
    timezone: IanaTimezone,
    createdAt: z.string(),
});

/**
 * Обновление аэропорта
 */
export const AirportUpdate = z.object({
    id: UUID,
    iata: UpperOpt(IATA3.optional()),
    icao: UpperOpt(ICAO4.optional()),
    name: z.string().min(2).max(120).trim().optional(),
    timezone: IanaTimezone.optional(),
    lat: NumberFromUserInput(-90, 90).optional(),
    lon: NumberFromUserInput(-180, 180).optional(),
});

export const AirportWithDistance = AirportPublic.extend({
    distanceKm: z.number().nonnegative().optional(),
});
