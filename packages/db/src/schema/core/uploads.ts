// packages/db/src/schema/core/uploads.ts
import { pgTable, uuid, varchar, integer, timestamp } from 'drizzle-orm/pg-core';

export const uploads = pgTable('uploads', {
    id: uuid('id').defaultRandom().primaryKey(),

    filename: varchar('filename', { length: 255 }).notNull(),
    originalName: varchar('original_name', { length: 255 }).notNull(),
    mimeType: varchar('mime_type', { length: 100 }).notNull(),
    size: integer('size').notNull(),
    path: varchar('path', { length: 500 }).notNull(),

    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    lastAccessedAt: timestamp('last_accessed_at', { withTimezone: true }).defaultNow().notNull(),
});

