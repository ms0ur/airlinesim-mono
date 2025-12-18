import { pgTable, uuid, varchar, integer, boolean, doublePrecision } from 'drizzle-orm/pg-core';
import { airports } from './airports';

export const runways = pgTable('runways', {
    id: uuid('id').defaultRandom().primaryKey(),
    airportId: uuid('airport_id').references(() => airports.id, { onDelete: 'cascade' }).notNull(),

    ident: varchar('ident', { length: 10 }).notNull(), // e.g. 09L/27R

    lengthFt: integer('length_ft'),
    widthFt: integer('width_ft'),
    surface: varchar('surface', { length: 64 }),
    lighted: boolean('lighted').default(false).notNull(),
    closed: boolean('closed').default(false).notNull(),

    // Thresholds and headings (simplified)
    leIdent: varchar('le_ident', { length: 10 }),
    heIdent: varchar('he_ident', { length: 10 }),

    leLat: doublePrecision('le_lat'),
    leLon: doublePrecision('le_lon'),
    heLat: doublePrecision('he_lat'),
    heLon: doublePrecision('he_lon'),
});
