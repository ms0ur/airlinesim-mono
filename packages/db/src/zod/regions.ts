import { z } from 'zod';

export const RegionPublic = z.object({
    code: z.string().max(10),
    localCode: z.string().max(10),
    name: z.string().max(120),
    continent: z.string().length(2),
    isoCountry: z.string().length(2),
    wikipediaLink: z.string().nullable().optional(),
    keywords: z.string().nullable().optional(),
});

export const RegionCreate = RegionPublic;
export const RegionUpdate = RegionPublic.partial().extend({
    code: z.string().max(10),
});
