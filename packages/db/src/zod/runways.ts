import { z } from 'zod';
import { UUID } from './helpers.js';

export const RunwayPublic = z.object({
    id: UUID,
    airportId: UUID,
    ident: z.string(),
    lengthFt: z.number().nullable().optional(),
    widthFt: z.number().nullable().optional(),
    surface: z.string().nullable().optional(),
    lighted: z.boolean(),
    closed: z.boolean(),
    leIdent: z.string().nullable().optional(),
    heIdent: z.string().nullable().optional(),
    leLat: z.number().nullable().optional(),
    leLon: z.number().nullable().optional(),
    heLat: z.number().nullable().optional(),
    heLon: z.number().nullable().optional(),
});

export const RunwayCreate = RunwayPublic.omit({ id: true });
