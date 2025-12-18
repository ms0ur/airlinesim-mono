import { db, schema } from '@airlinesim/db/client';
import { and, desc, eq, gt, lte } from 'drizzle-orm';
import { airror } from '@airlinesim/airror';
import { eventRegistry } from '@airlinesim/aivents';
import type { CreateEventInput } from '@airlinesim/db/zod';
import { WORLD_ID } from '../constants/world';

function addHours(d: Date, hours: number) {
    return new Date(d.getTime() + hours * 3600_000);
}

function product(nums: number[]) {
    let p = 1;
    for (const n of nums) p *= n;
    return p;
}

export const eventsRepo = {
    /**
     * Универсальное создание ивента по eventId + payload
     * - валидирует payload через spec.payloadSchema
     * - сохраняет event_instance
     * - материализует effects -> metric_modifiers
     */
    create: async (input: CreateEventInput) => {
        const spec = (eventRegistry as Record<string, any>)[input.eventId];
        if (!spec) throw airror('VALIDATION_ERROR', { messages: { en: `Unknown eventId: ${input.eventId}` } });

        const payload = spec.payloadSchema.parse(input.payload);
        const def = spec.define(payload);

        const now = new Date();

        // endsAt на уровне event_instance — для удобства UI (берём по continuance)
        const eventEndsAt =
            def.continuance.kind === 'temporary' ? addHours(now, def.continuance.ttlHours) : null;

        const [ev] = await db
            .insert(schema.eventInstances)
            .values({
                worldId: WORLD_ID,
                eventId: def.id,
                severity: def.severity,
                requiresAction: def.requiresPlayerAction,
                status: 'active',
                titleKey: def.titleKey,
                descriptionKey: def.descriptionKey,
                sourceKey: 'world',
                payload: payload, // сохраняем распарсенный payload (reason тоже тут)
                startsAt: now,
                endsAt: eventEndsAt ?? undefined,
            })
            .returning();

        // materialize только multiplier/delta
        const modifierRows = def.effects
            .filter((e: any) => e.kind === 'multiplier' || e.kind === 'delta')
            .map((e: any) => {
                const endsAt = e.kind === 'multiplier' ? addHours(now, e.ttlHours) : addHours(now, 0.001); // delta "почти мгновенный"
                return {
                    worldId: WORLD_ID,
                    eventInstanceId: ev.id,
                    metric: e.metric,
                    targetKey: e.target,
                    kind: e.kind,
                    factor: e.kind === 'multiplier' ? String(e.factor) : null,
                    amount: e.kind === 'delta' ? String(e.amount) : null,
                    startsAt: now,
                    endsAt,
                };
            });

        const modifiers =
            modifierRows.length > 0
                ? await db.insert(schema.metricModifiers).values(modifierRows as any).returning()
                : [];

        return { event: ev, modifiers };
    },

    /**
     * История ивентов (для фронта): последние N или после seq
     */
    list: async (args: { afterSeq?: number; limit?: number }) => {
        const limit = Math.min(args.limit ?? 50, 200);

        if (typeof args.afterSeq === 'number' && Number.isFinite(args.afterSeq)) {
            const rows = await db
                .select()
                .from(schema.eventInstances)
                .where(and(eq(schema.eventInstances.worldId, WORLD_ID), gt(schema.eventInstances.seq, args.afterSeq)))
                .orderBy(schema.eventInstances.seq)
                .limit(limit);

            return { data: rows, nextAfterSeq: rows.at(-1)?.seq ?? args.afterSeq };
        }

        const rowsDesc = await db
            .select()
            .from(schema.eventInstances)
            .where(eq(schema.eventInstances.worldId, WORLD_ID))
            .orderBy(desc(schema.eventInstances.seq))
            .limit(limit);

        const rows = rowsDesc.reverse();
        return { data: rows, nextAfterSeq: rows.at(-1)?.seq ?? null };
    },

    /**
     * Множитель метрики на targetKey в момент времени (MVP: используем для fuelPrice@world)
     */
    getActiveMultiplier: async (args: { metric: 'fuelPrice'; targetKey: 'world'; at: Date }) => {
        const rows = await db
            .select({ factor: schema.metricModifiers.factor })
            .from(schema.metricModifiers)
            .where(
                and(
                    eq(schema.metricModifiers.worldId, WORLD_ID),
                    eq(schema.metricModifiers.metric, args.metric),
                    eq(schema.metricModifiers.targetKey, args.targetKey),
                    eq(schema.metricModifiers.kind, 'multiplier'),
                    lte(schema.metricModifiers.startsAt, args.at),
                    gt(schema.metricModifiers.endsAt, args.at),
                ),
            );

        const factors = rows
            .map(r => (r.factor == null ? 1 : Number(r.factor)))
            .filter(f => Number.isFinite(f) && f > 0);

        return product(factors);
    },
};
