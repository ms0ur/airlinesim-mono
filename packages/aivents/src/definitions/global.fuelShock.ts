import { TK } from '../core/targetKey';
import type { EventDefinition } from '../core/types';

type FuelShockParams = {
    factor: number;
    ttlHours: number;
    reason?: string;
};

export function defineFuelShock(params: FuelShockParams): EventDefinition {
    return {
        id: 'GLOBAL.MARKET.FUEL_SHOCK',
        titleKey: 'event.market.fuelShock.title',
        descriptionKey: 'event.market.fuelShock.desc',

        continuance: { kind: 'temporary', ttlHours: params.ttlHours },

        // воздействие на весь мир
        targets: [TK.world],

        severity: 'major',
        requiresPlayerAction: 'none',

        effects: [
            {
                kind: 'multiplier',
                target: TK.world,
                metric: 'fuelPrice',
                factor: params.factor,
                ttlHours: params.ttlHours,
            },
        ],
    };
}
