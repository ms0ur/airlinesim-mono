// apps/api/repo/userRepo.ts
import { db, schema } from '@airlinesim/db/client';
import { userCreate, userUpdate, userPublic } from '@airlinesim/db/zod';
import { eq, ilike, or, sql } from 'drizzle-orm';
import { z } from 'zod';

type UserInsert = typeof schema.users.$inferInsert;
// type UserSelect = typeof schema.users.$inferSelect;

export const UserRepo = {
    create: async (data: z.infer<typeof userCreate>) => {
        const values: UserInsert = {
            username: data.username,
            email: data.email,
            password: data.password,
        };

        try {
            const [row] = await db
                .insert(schema.users)
                .values(values)
                .returning({
                    id: schema.users.id,
                    username: schema.users.username,
                    email: schema.users.email,
                    createdAt: schema.users.createdAt,
                });

            return userPublic.parse({
                ...row,
                createdAt:
                    row.createdAt instanceof Date
                        ? row.createdAt.toISOString()
                        : row.createdAt,
            });
        } catch (error) {
            throw error;
        }
    },

    findById: async (id: string) => {
        try {
            const row = await db
                .select({
                    id: schema.users.id,
                    username: schema.users.username,
                    email: schema.users.email,
                    createdAt: schema.users.createdAt,
                })
                .from(schema.users)
                .where(eq(schema.users.id, id))
                .limit(1)
                .then((rows) => rows[0]);

            if (!row) return null;

            return userPublic.parse({
                ...row,
                createdAt:
                    row.createdAt instanceof Date
                        ? row.createdAt.toISOString()
                        : row.createdAt,
            });
        } catch (error) {
            throw error;
        }
    },

    findByEmail: async (email: string) => {
        try {
            const row = await db
                .select({
                    id: schema.users.id,
                    username: schema.users.username,
                    email: schema.users.email,
                    createdAt: schema.users.createdAt,
                })
                .from(schema.users)
                .where(eq(schema.users.email, email))
                .limit(1)
                .then((rows) => rows[0]);

            if (!row) return null;

            return userPublic.parse({
                ...row,
                createdAt:
                    row.createdAt instanceof Date
                        ? row.createdAt.toISOString()
                        : row.createdAt,
            });
        } catch (error) {
            throw error;
        }
    },

    findByUsername: async (username: string) => {
        try {
            const row = await db
                .select({
                    id: schema.users.id,
                    username: schema.users.username,
                    email: schema.users.email,
                    createdAt: schema.users.createdAt,
                })
                .from(schema.users)
                .where(eq(schema.users.username, username))
                .limit(1)
                .then((rows) => rows[0]);

            if (!row) return null;

            return userPublic.parse({
                ...row,
                createdAt:
                    row.createdAt instanceof Date
                        ? row.createdAt.toISOString()
                        : row.createdAt,
            });
        } catch (error) {
            throw error;
        }
    },

    find: async (filter = '', limit = 10, offset = 0) => {
        try {
            const whereExpr =
                filter.trim().length === 0
                    ? undefined
                    : or(
                        ilike(schema.users.username, `%${filter}%`),
                        ilike(schema.users.email, `%${filter}%`),
                    );

            const [rows, [{ count }]] = await Promise.all([
                db
                    .select({
                        id: schema.users.id,
                        username: schema.users.username,
                        email: schema.users.email,
                        createdAt: schema.users.createdAt,
                    })
                    .from(schema.users)
                    .where(whereExpr)
                    .limit(limit)
                    .offset(offset),
                db
                    .select({ count: sql<number>`count(*)::int` })
                    .from(schema.users)
                    .where(whereExpr),
            ]);

            return {
                data: rows.map((row) =>
                    userPublic.parse({
                        ...row,
                        createdAt:
                            row.createdAt instanceof Date
                                ? row.createdAt.toISOString()
                                : row.createdAt,
                    }),
                ),
                total: count,
                limit,
                offset,
            };
        } catch (error) {
            throw error;
        }
    },

    edit: async (data: z.infer<typeof userUpdate>) => {
        const { id, ...patchIn } = data;

        const patch: Partial<UserInsert> = {};
        if (patchIn.username !== undefined) patch.username = patchIn.username;
        if (patchIn.email !== undefined) patch.email = patchIn.email;
        if (patchIn.password !== undefined) patch.password = patchIn.password;

        if (Object.keys(patch).length === 0) {
            // ничего обновлять
            const current = await UserRepo.findById(id);
            return current; // либо бросить ошибку — на твой вкус
        }

        try {
            const [row] = await db
                .update(schema.users)
                .set(patch)
                .where(eq(schema.users.id, id))
                .returning({
                    id: schema.users.id,
                    username: schema.users.username,
                    email: schema.users.email,
                    createdAt: schema.users.createdAt,
                });

            if (!row) return null;

            return userPublic.parse({
                ...row,
                createdAt:
                    row.createdAt instanceof Date
                        ? row.createdAt.toISOString()
                        : row.createdAt,
            });
        } catch (error) {
            throw error;
        }
    },
};
