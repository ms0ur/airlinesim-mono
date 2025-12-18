import { pgTable, varchar, text } from 'drizzle-orm/pg-core';

export const countries = pgTable('countries', {
    code: varchar('code', { length: 2 }).primaryKey(), // ISO 3166-1 alpha-2
    name: varchar('name', { length: 120 }).notNull(),
    continent: varchar('continent', { length: 2 }).notNull(), // AF, AN, AS, EU, NA, OC, SA
    wikipediaLink: text('wikipedia_link'),
});
