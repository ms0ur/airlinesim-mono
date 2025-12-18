import { z } from 'zod';

/**
 * TargetKey: единый ключ цели для модификаторов/ивентов.
 * Примеры:
 * - world
 * - region:RU
 * - airport:SVO
 * - route:SVO-JFK
 * - airline:42
 */
export const targetKeySchema = z.union([
    z.literal('world'),
    z.string().regex(/^region:.+$/),
    z.string().regex(/^airport:.+$/),
    z.string().regex(/^route:.+$/),
    z.string().regex(/^airline:.+$/),
]);

export const eventSeveritySchema = z.enum(['minor', 'major', 'crisis']);
export const eventActionSchema = z.enum(['none', 'optional', 'required']);
export const eventStatusSchema = z.enum(['active', 'pendingDecision', 'resolved', 'expired']);

export const metricKeySchema = z.enum([
    'fuelPrice',
    'demand',
    'airportCapacity',
    'reputation',
    'costIndex',
]);

export const modifierKindSchema = z.enum(['multiplier', 'delta']);

export const createEventSchema = z.object({
    eventId: z.string(),
    payload: z.unknown(),
});

export type CreateEventInput = z.infer<typeof createEventSchema>;
export type TargetKey = z.infer<typeof targetKeySchema>;
export type MetricKey = z.infer<typeof metricKeySchema>;
