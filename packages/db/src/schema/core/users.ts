import { pgTable, uuid, varchar, timestamp, uniqueIndex } from "drizzle-orm/pg-core";

export const users = pgTable(
    "users",
    {
        id: uuid("id").defaultRandom().primaryKey(),

        username: varchar("username", { length: 30 }).notNull(),
        email: varchar("email", { length: 254 }).notNull(),
        password: varchar("password", { length: 255 }).notNull(),

        createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    },
    (t) => ({
        usersUsernameIdx: uniqueIndex("users_username_idx").on(t.username),
        usersEmailIdx: uniqueIndex("users_email_idx").on(t.email),
    })
);
