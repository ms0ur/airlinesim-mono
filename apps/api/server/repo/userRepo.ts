import { db, schema } from '@airlinesim/db/client';
import { userCreate, userUpdate, userPublic } from '@airlinesim/db/zod';
import { eq, ilike, or, sql } from 'drizzle-orm';
import { z } from 'zod';
import bcrypt from 'bcryptjs';

type UserInsert = typeof schema.users.$inferInsert;

export const UserRepo = {
    create: async (data: z.infer<typeof userCreate>) => {
        const values: UserInsert = {
            username: data.username,
            email: data.email,
            password: await bcrypt.hash(data.password, 10),
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
                .where(eq(schema.users.id as any, id) as any)
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

    getHashedPassword: async (id: string): Promise<{ id: string; password: string } | null> => {
        try {
            const row = await db
                .select({
                    id: schema.users.id,
                    password: schema.users.password,
                })
                .from(schema.users)
                .where(eq(schema.users.id as any, id) as any)
                .limit(1)
                .then((rows) => rows[0]);

            return row ?? null;
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
                .where(eq(schema.users.email as any, email) as any)
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
                .where(eq(schema.users.username as any, username) as any)
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
            const trimmed = filter.trim();
            let whereExpr: any = undefined;

            if (trimmed.length > 0) {
                whereExpr = or(
                    ilike(schema.users.username as any, `%${trimmed}%`),
                    ilike(schema.users.email as any, `%${trimmed}%`),
                );
            }

            const baseSelect = db
                .select({
                    id: schema.users.id,
                    username: schema.users.username,
                    email: schema.users.email,
                    createdAt: schema.users.createdAt,
                })
                .from(schema.users);

            const dataQuery = whereExpr
                ? baseSelect.where(whereExpr).limit(limit).offset(offset)
                : baseSelect.limit(limit).offset(offset);

            const countSelect = db
                .select({ count: sql<number>`count(*)::int` as any })
                .from(schema.users);

            const countQuery = whereExpr ? countSelect.where(whereExpr) : countSelect;

            const [rows, countRows] = await Promise.all([dataQuery, countQuery]);
            const [{ count }] = countRows;

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
            const current = await UserRepo.findById(id);
            return current;
        }

        try {
            const [row] = await db
                .update(schema.users)
                .set(patch)
                .where(eq(schema.users.id as any, id) as any)
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

    delete: async (id: string): Promise<boolean> => {
        try {
            const deleted = await db
                .delete(schema.users)
                .where(eq(schema.users.id as any, id) as any)
                .returning({ id: schema.users.id });

            return deleted.length > 0;
        } catch (error) {
            throw error;
        }
    },
};
