import { pgTable, varchar, text } from 'drizzle-orm/pg-core';

export const regions = pgTable('regions', {
    code: varchar('code', { length: 10 }).primaryKey(), // e.g. "AD-02", "US-NY"
    localCode: varchar('local_code', { length: 10 }),
    name: varchar('name', { length: 120 }).notNull(),
    continent: varchar('continent', { length: 2 }).notNull(),
    isoCountry: varchar('iso_country', { length: 2 }).notNull(),
    wikipediaLink: text('wikipedia_link'),
    keywords: text('keywords'),
});
