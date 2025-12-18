import { TK } from '../core/targetKey';
import type { EventDefinition } from '../core/types';

export function runwayClosed(airportId: string): EventDefinition {
    return {
        id: 'AIRPORT.RUNWAY_CLOSED',
        titleKey: 'event.airport.runwayClosed.title',
        descriptionKey: 'event.airport.runwayClosed.desc',

        continuance: { kind: 'temporary', ttlHours: 72 },

        targets: [TK.airport(airportId)],

        effects: [
            {
                kind: 'multiplier',
                target: TK.airport(airportId),
                metric: 'airportCapacity',
                factor: 0.7,
                ttlHours: 72,
            },
        ],

        requiresPlayerAction: 'optional',
        severity: 'major',
    };
}
