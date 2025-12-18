import { z } from 'zod';

export const CountryPublic = z.object({
    code: z.string().length(2),
    name: z.string(),
    continent: z.string().length(2),
    wikipediaLink: z.string().url().nullable().optional(),
});

export const CountryCreate = CountryPublic;
