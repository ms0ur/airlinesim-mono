import { db, schema } from '@airlinesim/db/client';
import { AirlineCreate, AirlinePublic, AirlineUpdate } from '@airlinesim/db/zod';
import {eq, ilike, or, sql} from 'drizzle-orm';
import { z } from 'zod';

import { airror } from '@airlinesim/airror';

type AirlineInsert = typeof schema.airlines.$inferInsert;

const AirlineId = z.uuid();

function generateTailNumber(icao: string): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const nums = '0123456789';
    let suffix = '';
    for (let i = 0; i < 2; i++) suffix += chars[Math.floor(Math.random() * chars.length)];
    for (let i = 0; i < 2; i++) suffix += nums[Math.floor(Math.random() * nums.length)];
    return `${icao}-${suffix}`;
}

export const airlineRepo = {
    create: async (data: z.infer<typeof AirlineCreate>) => {
        const values: AirlineInsert = {
            name: data.name,
            baseAirportId: data.baseAirportId as string,
            iata: data.iata as string,
            icao: data.icao as string,
            ownerId: data.ownerId as string | undefined,
        };
        try {
            const [row] = await db
                .insert(schema.airlines)
                .values(values)
                .returning({
                    id: schema.airlines.id,
                    name: schema.airlines.name,
                    baseAirportId: schema.airlines.baseAirportId,
                    iata: schema.airlines.iata,
                    icao: schema.airlines.icao,
                    ownerId: schema.airlines.ownerId,
                    balance: schema.airlines.balance,
                    fuelTons: schema.airlines.fuelTons,
                    createdAt: schema.airlines.createdAt,
                });

            if (data.startingAircraftTypeId) {
                await db
                    .insert(schema.aircraft)
                    .values({
                        airlineId: row.id,
                        typeId: data.startingAircraftTypeId as string,
                        tailNumber: generateTailNumber(row.icao as string),
                        inService: true,
                    });
            }

            return AirlinePublic.parse({
                ...row,
                balance: row.balance ?? 50000000,
                fuelTons: row.fuelTons ?? 30000,
                createdAt: row.createdAt instanceof Date ? row.createdAt.toISOString() : row.createdAt,
            });
        } catch (e: any) {
            throw airror("DB_ERROR", { cause: e });
        }
    },
    findById: async (id: string) => {
        try{
            const row = await db
                .select()
                .from(schema.airlines)
                .where(eq(schema.airlines.id, id))
                .limit(1)
                .then((r) => r[0]);

            if (!row) {
                return null;
            }

            return AirlinePublic.parse({
                ...row,
                ownerId: row.ownerId ?? null,
                balance: row.balance ?? 50000000,
                fuelTons: row.fuelTons ?? 30000,
                createdAt: row.createdAt instanceof Date ? row.createdAt.toISOString() : row.createdAt,
            });
        } catch (e) {
            throw airror("DB_ERROR", { cause: e });
        }
    },
    edit: async (data: z.infer<typeof AirlineUpdate>) => {
        AirlineId.parse(data.id);

        const { id, ...rest } = data;
        const patch = Object.fromEntries(
            Object.entries(rest).filter(([, v]) => v !== undefined)
        ) as Partial<AirlineInsert>;

        try {
            const [row] = await db
                .update(schema.airlines)
                .set(patch)
                .where(eq(schema.airlines.id, id))
                .returning({
                    id: schema.airlines.id,
                    name: schema.airlines.name,
                    baseAirportId: schema.airlines.baseAirportId,
                    iata: schema.airlines.iata,
                    icao: schema.airlines.icao,
                    ownerId: schema.airlines.ownerId,
                    balance: schema.airlines.balance,
                    fuelTons: schema.airlines.fuelTons,
                    createdAt: schema.airlines.createdAt,
                });

            if (!row) {
                return null;
            }
            return AirlinePublic.parse({
                ...row,
                balance: row.balance ?? 50000000,
                fuelTons: row.fuelTons ?? 30000,
                createdAt: row.createdAt instanceof Date ? row.createdAt.toISOString() : row.createdAt,
            });
        } catch (e) {
            throw airror("DB_ERROR", { cause: e });
        }
    },
    find: async(filter = "", limit = 10, offset = 0) => {
        try {
            const [rows, [{ count }]] = await Promise.all([
                db
                    .select()
                    .from(schema.airlines)
                    .where(
                        or(
                            ilike(schema.airlines.name, `%${filter}%`),
                            ilike(schema.airlines.iata, `%${filter}%`),
                            ilike(schema.airlines.icao, `%${filter}%`)
                        )
                    )
                    .limit(limit)
                    .offset(offset),
                db
                    .select({ count: sql<number>`count(*)::int` })
                    .from(schema.airlines)
                    .where(
                        or(
                            ilike(schema.airlines.name, `%${filter}%`),
                            ilike(schema.airlines.iata, `%${filter}%`),
                            ilike(schema.airlines.icao, `%${filter}%`)
                        )
                    )
            ]);

            return {
                data: rows.map(row => AirlinePublic.parse({
                ...row,
                balance: row.balance ?? 50000000,
                fuelTons: row.fuelTons ?? 30000,
                createdAt: row.createdAt instanceof Date ? row.createdAt.toISOString() : row.createdAt,
                })),
                total: count,
                limit,
                offset
            };
        } catch (e) {
            throw airror("DB_ERROR", { cause: e });
        }
    },

    findByOwnerId: async (ownerId: string) => {
        try {
            const row = await db
                .select()
                .from(schema.airlines)
                .where(eq(schema.airlines.ownerId, ownerId))
                .limit(1)
                .then((r) => r[0]);

            if (!row) {
                return null;
            }

            return AirlinePublic.parse({
                ...row,
                ownerId: row.ownerId ?? null,
                balance: row.balance ?? 50000000,
                fuelTons: row.fuelTons ?? 30000,
                createdAt: row.createdAt instanceof Date ? row.createdAt.toISOString() : row.createdAt,
            });
        } catch (e) {
            throw airror("DB_ERROR", { cause: e });
        }
    },

    delete: async (id: string): Promise<boolean> => {
        try {
            const deleted = await db
                .delete(schema.airlines)
                .where(eq(schema.airlines.id, id))
                .returning({ id: schema.airlines.id });

            return deleted.length > 0;
        } catch (e) {
            throw airror("DB_ERROR", { cause: e });
        }
    }
}