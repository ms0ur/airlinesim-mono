import type { MetricKey } from '../core/types';
import type { TargetKey } from '../core/targetKey';
import type { ModifierRow } from './materialize';

export function getEffectiveMetric(args: {
    metric: MetricKey;
    targets: TargetKey[]; // какие ключи учитывать (например world + airline:42)
    base: number;
    now: Date;
    modifiers: Array<Pick<ModifierRow, 'metric' | 'target' | 'factor' | 'startsAt' | 'endsAt'>>;
}): number {
    let product = 1;

    for (const m of args.modifiers) {
        if (m.metric !== args.metric) continue;
        if (!args.targets.includes(m.target)) continue;
        if (m.startsAt > args.now) continue;
        if (m.endsAt <= args.now) continue;

        product *= m.factor;
    }

    return args.base * product;
}
