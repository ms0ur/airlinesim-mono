import {
    pgTable,
    uuid,
    integer,
    text,
    timestamp,
    jsonb,
    bigserial,
    index,
    uniqueIndex,
} from 'drizzle-orm/pg-core';
import { eventActionEnum, eventSeverityEnum, eventStatusEnum } from './enums';

export const eventInstances = pgTable(
    'event_instances',
    {
        id: uuid('id').defaultRandom().primaryKey(),

        worldId: integer('world_id').notNull(),

        // курсор для истории/реалтайма (монотонный)
        seq: bigserial('seq', { mode: 'number' }).notNull(),

        eventId: text('event_id').notNull(), // 'GLOBAL.MARKET.FUEL_SHOCK'

        severity: eventSeverityEnum('severity').notNull().default('minor'),
        requiresAction: eventActionEnum('requires_action').notNull().default('none'),
        status: eventStatusEnum('status').notNull().default('active'),

        titleKey: text('title_key').notNull(),
        descriptionKey: text('description_key').notNull(),

        // 'world' | 'region:RU' | ...
        sourceKey: text('source_key').notNull(),

        payload: jsonb('payload').$type<Record<string, unknown>>().notNull().default({}),

        startsAt: timestamp('starts_at', { withTimezone: true }).notNull().defaultNow(),
        endsAt: timestamp('ends_at', { withTimezone: true }),

        createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    },
    (t) => ({
        worldSeqUq: uniqueIndex('event_instances_world_seq_uq').on(t.worldId, t.seq),
        worldCreatedIdx: index('event_instances_world_created_idx').on(t.worldId, t.createdAt),
    }),
);
