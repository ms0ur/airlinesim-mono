import { z } from 'zod';
import { TK } from '../../../core/targetKey';
import type { EventSpec } from '../../spec';

const payloadSchema = z.object({
    factor: z.number().min(0.5).max(2.0),
    ttlHours: z.number().int().min(1).max(24 * 30),
    reason: z.string().min(1).max(200).optional(),
});

type Payload = z.infer<typeof payloadSchema>;

export const fuelShockSpec: EventSpec<Payload> = {
    id: 'GLOBAL.MARKET.FUEL_SHOCK',
    payloadSchema,
    define: (p) => ({
        id: 'MARKET.FUEL_SHOCK',
        titleKey: 'event.market.fuelShock.title',
        descriptionKey: 'event.market.fuelShock.desc',
        continuance: { kind: 'temporary', ttlHours: p.ttlHours },
        targets: [TK.world],
        severity: 'major',
        requiresPlayerAction: 'none',
        effects: [
            { kind: 'multiplier', target: TK.world, metric: 'fuelPrice', factor: p.factor, ttlHours: p.ttlHours },
        ],
    }),
};
