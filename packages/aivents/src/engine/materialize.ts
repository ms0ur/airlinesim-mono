import type { EffectOp, EventId, MetricKey } from '../core/types';
import type { TargetKey } from '../core/targetKey';

export type ModifierRow = {
    id: string;
    worldId: string;
    sourceEventId: EventId;

    metric: MetricKey;
    target: TargetKey;

    factor: number;
    startsAt: Date;
    endsAt: Date;
};

export type Mutation = {
    metric: MetricKey;
    target: TargetKey;
    amount: number;
};

export function materializeEffects(args: {
    worldId: string;
    eventId: EventId;
    effects: EffectOp[];
    now: Date;
}): { modifiers: Omit<ModifierRow, 'id'>[]; mutations: Mutation[] } {
    const modifiers: Omit<ModifierRow, 'id'>[] = [];
    const mutations: Mutation[] = [];

    for (const op of args.effects) {
        if (op.kind === 'delta') {
            mutations.push({
                metric: op.metric,
                target: op.target,
                amount: op.amount,
            });
            continue;
        }

        if (op.kind === 'multiplier') {
            const endsAt = new Date(args.now.getTime() + op.ttlHours * 3600_000);
            modifiers.push({
                worldId: args.worldId,
                sourceEventId: args.eventId,
                metric: op.metric,
                target: op.target,
                factor: op.factor,
                startsAt: args.now,
                endsAt,
            });
            continue;
        }
    }

    return { modifiers, mutations };
}
