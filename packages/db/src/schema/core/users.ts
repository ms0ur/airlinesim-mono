import { pgTable, uuid, varchar, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { airlines } from "./airlines";

export const users = pgTable("users", {
    id: uuid('id').defaultRandom().primaryKey(),

    username: varchar('username', { length: 30 }).notNull(),
    email: varchar('email', { length: 60 }).notNull(),
    password: varchar('password').notNull(),
})