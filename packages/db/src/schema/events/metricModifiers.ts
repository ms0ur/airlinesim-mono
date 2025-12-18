import {
    pgTable,
    uuid,
    integer,
    text,
    timestamp,
    numeric,
    index,
} from 'drizzle-orm/pg-core';
import { metricKeyEnum, modifierKindEnum } from './enums';
import { eventInstances } from './eventInstances';

export const metricModifiers = pgTable(
    'metric_modifiers',
    {
        id: uuid('id').defaultRandom().primaryKey(),

        worldId: integer('world_id').notNull(),

        eventInstanceId: uuid('event_instance_id')
            .notNull()
            .references(() => eventInstances.id, { onDelete: 'cascade' }),

        metric: metricKeyEnum('metric').notNull(),
        targetKey: text('target_key').notNull(), // 'world' | 'region:RU' | ...

        kind: modifierKindEnum('kind').notNull(),

        // multiplier
        factor: numeric('factor', { precision: 12, scale: 6 }),
        // delta
        amount: numeric('amount', { precision: 14, scale: 4 }),

        startsAt: timestamp('starts_at', { withTimezone: true }).notNull(),
        endsAt: timestamp('ends_at', { withTimezone: true }).notNull(),

        createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    },
    (t) => ({
        activeLookupIdx: index('metric_modifiers_active_lookup_idx').on(
            t.worldId,
            t.metric,
            t.targetKey,
            t.startsAt,
            t.endsAt,
        ),
    }),
);
