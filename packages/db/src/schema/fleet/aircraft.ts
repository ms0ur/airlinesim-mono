import { pgTable, uuid, varchar, boolean, timestamp, uniqueIndex, foreignKey } from 'drizzle-orm/pg-core';
import { airlines } from '../core/airlines';
import { aircraftTypes } from './aircraft-types';

export const aircraft = pgTable('aircraft', {
    id: uuid('id').defaultRandom().primaryKey(),
    airlineId: uuid('airline_id').notNull(),
    typeId: uuid('type_id').notNull(),
    tailNumber: varchar('tail_number', { length: 16 }).notNull(),
    inService: boolean('in_service').default(true).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => [
    uniqueIndex('aircraft_tail_uq').on(t.tailNumber),
    foreignKey({ columns: [t.airlineId], foreignColumns: [airlines.id] }).onDelete('cascade'),
    foreignKey({ columns: [t.typeId], foreignColumns: [aircraftTypes.id] }),
]);
