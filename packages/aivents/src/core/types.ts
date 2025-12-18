import type { TargetKey } from './targetKey';

export type EventId = string;

export type Continuance =
    | { kind: 'instant' }
    | { kind: 'temporary'; ttlHours: number }
    | { kind: 'chain'; chainId: string };

export type MetricKey =
    | 'fuelPrice'
    | 'demand'
    | 'airportCapacity'
    | 'reputation'
    | 'costIndex';

export type EffectOp =
    | {
        kind: 'delta';
        target: TargetKey;
        metric: MetricKey;
        amount: number;
    }
    | {
        kind: 'multiplier';
        target: TargetKey;
        metric: MetricKey;
        factor: number;
        ttlHours: number;
    };

export type EventDefinition = {
    id: EventId;
    titleKey: string;
    descriptionKey: string;

    continuance: Continuance;

    targets: TargetKey[];

    effects: EffectOp[];

    requiresPlayerAction: 'none' | 'optional' | 'required';
    severity: 'minor' | 'major' | 'crisis';
};
