import { pgTable, uuid, timestamp, integer } from 'drizzle-orm/pg-core';

export const fuelPrices = pgTable('fuel_prices', {
    id: uuid('id').defaultRandom().primaryKey(),
    pricePerTon: integer('price_per_ton').notNull(),
    recordedAt: timestamp('recorded_at', { withTimezone: true }).defaultNow().notNull(),
});

