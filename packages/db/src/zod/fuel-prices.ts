import { z } from 'zod';
import { UUID } from './helpers.js';

export const FuelPricePublic = z.object({
    id: UUID,
    pricePerTon: z.number(),
    recordedAt: z.string(),
});

export const FuelPriceHistory = z.object({
    data: z.array(FuelPricePublic),
    currentPrice: z.number(),
    nextUpdateAt: z.string(),
});

