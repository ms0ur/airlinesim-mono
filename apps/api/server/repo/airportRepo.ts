import { db, schema } from '@airlinesim/db/client';
import { AirportCreate, AirportPublic, AirportUpdate } from '@airlinesim/db/zod';
import { asc, count, eq, ilike, or } from 'drizzle-orm';
import { z } from 'zod';

const AirportId = z.string().uuid();

const pickDefined = <T extends Record<string, any>>(obj: T) =>
    Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined)) as Partial<T>;

export const airportRepo = {
    create: async (data: z.infer<typeof AirportCreate>) => {
        try {
            const [row] = await db.insert(schema.airports).values(data).returning();
            return AirportPublic.parse(row);
        } catch (e: any) {
            // PG unique violation
            if (e?.code === '23505' && e?.constraint === 'airports_iata_uq') {
                throw new Error('Аэропорт с таким IATA уже существует');
            }
            throw e;
        }
    },

    edit: async (data: z.infer<typeof AirportUpdate>) => {
        AirportId.parse(data.id);
        const { id, ...rest } = data;
        const patch = pickDefined(rest);

        try {
            const [row] = await db
                .update(schema.airports)
                .set(patch)
                .where(eq(schema.airports.id, id))
                .returning();

            if (!row) throw new Error('Аэропорт не найден');
            return AirportPublic.parse(row);
        } catch (e: any) {
            if (e?.code === '23505' && e?.constraint === 'airports_iata_uq') {
                throw new Error('Аэропорт с таким IATA уже существует');
            }
            throw e;
        }
    },

    findById: async (id: string) => {
        AirportId.parse(id);
        const rows = await db
            .select()
            .from(schema.airports)
            .where(eq(schema.airports.id, id))
            .limit(1);

        return rows[0] ? AirportPublic.parse(rows[0]) : null;
    },


    remove: async (id: string) => {
        AirportId.parse(id);
        const deleted = await db
            .delete(schema.airports)
            .where(eq(schema.airports.id, id))
            .returning({ id: schema.airports.id });
        return deleted.length > 0; // true, если что-то удалили
    },

    find: async (limit = 100, offset = 0, filterByString = '') => {
        const q = filterByString.trim();

        const where = q
            ? or(
                ilike(schema.airports.name, `%${q}%`),
                ilike(schema.airports.iata, `%${q}%`),
                ilike(schema.airports.icao, `%${q}%`),
                ilike(schema.airports.timezone, `%${q}%`)
            )
            : undefined;

        const [rows, [{ total }]] = await Promise.all([
            db
                .select()
                .from(schema.airports)
                .where(where)
                .orderBy(asc(schema.airports.name))
                .limit(limit)
                .offset(offset),
            db.select({ total: count() }).from(schema.airports).where(where),
        ]);

        return {
            items: rows.map((a) => AirportPublic.parse(a)),
            total,
            limit,
            offset,
        };
    },
};
