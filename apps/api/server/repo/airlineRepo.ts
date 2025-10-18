import { db, schema } from '@airlinesim/db/client';
import { AirlineCreate, AirlinePublic, AirlineUpdate } from '@airlinesim/db/zod';
import {eq, ilike, or, sql} from 'drizzle-orm';
import { z } from 'zod';

import { airror } from '@airlinesim/airror';

type AirlineInsert = typeof schema.airlines.$inferInsert;

const AirlineId = z.uuid();

export const airlineRepo = {
    create: async (data: z.infer<typeof AirlineCreate>) => {
        const values: AirlineInsert = {
            name: data.name,
            baseAirportId: data.baseAirportId as string,
            iata: data.iata as string,
            icao: data.icao as string,
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
                    createdAt: schema.airlines.createdAt,
                });

            return AirlinePublic.parse({
                ...row,
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
                    createdAt: schema.airlines.createdAt,
                });

            if (!row) {
                return null;
            }
            return AirlinePublic.parse({
                ...row,
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
                createdAt: row.createdAt instanceof Date ? row.createdAt.toISOString() : row.createdAt,
                })),
                total: count,
                limit,
                offset
            };
        } catch (e) {
            throw airror("DB_ERROR", { cause: e });
        }
    }
}