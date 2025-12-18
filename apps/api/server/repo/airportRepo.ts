import { db, schema } from '@airlinesim/db/client';
import { AirportCreate, AirportPublic, AirportUpdate } from '@airlinesim/db/zod';
import { and, asc, count, eq, ilike, or, sql } from 'drizzle-orm';
import { z } from 'zod';

type AirportInsert = typeof schema.airports.$inferInsert;
type AirportRow = typeof schema.airports.$inferSelect;
type CountryInsert = typeof schema.countries.$inferInsert;
type RegionInsert = typeof schema.regions.$inferInsert;
type RunwayInsert = typeof schema.runways.$inferInsert;

const AirportId = z.uuid();

const airportPublicFields = {
    id: schema.airports.id,
    iata: schema.airports.iata,
    icao: schema.airports.icao,
    name: schema.airports.name,
    lat: schema.airports.lat,
    lon: schema.airports.lon,
    timezone: schema.airports.timezone,
    createdAt: schema.airports.createdAt,
    type: schema.airports.type,
    continent: schema.airports.continent,
    isoCountry: schema.airports.isoCountry,
    isoRegion: schema.airports.isoRegion,
    municipality: schema.airports.municipality,
    scheduledService: schema.airports.scheduledService,
    gpsCode: schema.airports.gpsCode,
    localCode: schema.airports.localCode,
    elevationFt: schema.airports.elevationFt,
    homeLink: schema.airports.homeLink,
    wikipediaLink: schema.airports.wikipediaLink,
    keywords: schema.airports.keywords,
};

const pickDefined = <T extends Record<string, unknown>>(obj: T) =>
    Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined)) as Partial<T>;

const toAirportPublic = (row: Partial<AirportRow>) =>
    AirportPublic.parse({
        ...row,
        createdAt:
            typeof row?.createdAt === 'string'
                ? row.createdAt
                : row?.createdAt instanceof Date
                    ? row.createdAt.toISOString()
                    : row?.createdAt,
    });

export const airportRepo = {
    upsertCountry: async (data: CountryInsert) => {
        return await db.insert(schema.countries)
            .values(data)
            .onConflictDoUpdate({
                target: schema.countries.code,
                set: {
                    name: data.name,
                    continent: data.continent,
                    wikipediaLink: data.wikipediaLink,
                }
            })
            .returning();
    },

    upsertRegion: async (data: RegionInsert) => {
        return await db.insert(schema.regions)
            .values(data)
            .onConflictDoUpdate({
                target: schema.regions.code,
                set: {
                    localCode: data.localCode,
                    name: data.name,
                    continent: data.continent,
                    isoCountry: data.isoCountry,
                    wikipediaLink: data.wikipediaLink,
                    keywords: data.keywords,
                }
            })
            .returning();
    },

    upsertAirport: async (data: AirportInsert) => {
        return await db.insert(schema.airports)
            .values(data)
            .onConflictDoUpdate({
                target: schema.airports.icao,
                set: pickDefined({
                    iata: data.iata,
                    name: data.name,
                    lat: data.lat,
                    lon: data.lon,
                    timezone: data.timezone,
                    type: data.type,
                    continent: data.continent,
                    isoCountry: data.isoCountry,
                    isoRegion: data.isoRegion,
                    municipality: data.municipality,
                    scheduledService: data.scheduledService,
                    gpsCode: data.gpsCode,
                    localCode: data.localCode,
                    elevationFt: data.elevationFt,
                    homeLink: data.homeLink,
                    wikipediaLink: data.wikipediaLink,
                    keywords: data.keywords,
                })
            })
            .returning();
    },

    upsertRunway: async (data: RunwayInsert) => {
        return await db.insert(schema.runways)
            .values(data)
            .onConflictDoUpdate({
                target: [schema.runways.airportId, schema.runways.ident],
                set: {
                    lengthFt: data.lengthFt,
                    widthFt: data.widthFt,
                    surface: data.surface,
                    lighted: data.lighted,
                    closed: data.closed,
                    leIdent: data.leIdent,
                    heIdent: data.heIdent,
                    leLat: data.leLat,
                    leLon: data.leLon,
                    heLat: data.heLat,
                    heLon: data.heLon,
                }
            })
            .returning();
    },

    clearAllData: async () => {
        return await db.transaction(async (tx) => {
            await tx.delete(schema.runways);
            await tx.delete(schema.airports);
            await tx.delete(schema.regions);
            await tx.delete(schema.countries);
        });
    },

    findByIcao: async (icao: string) => {
        const rows = await db.select().from(schema.airports).where(eq(schema.airports.icao, icao)).limit(1);
        return rows[0] || null;
    },

    create: async (data: z.infer<typeof AirportCreate>) => {
        try {
            const values: AirportInsert = {
                ...data,
                iata: data.iata as string,
                icao: data.icao as string,
            };

            const [row] = await db
                .insert(schema.airports)
                .values(values)
                .returning();

            return toAirportPublic(row);
        } catch (e: any) {
            if (e?.code === '23505' && (e?.constraint === 'airports_iata_uq' || e?.constraint === 'airports_icao_uq')) {
                throw new Error('Аэропорт с таким IATA/ICAO уже существует');
            }
            throw e;
        }
    },

    edit: async (data: z.infer<typeof AirportUpdate>) => {
        AirportId.parse(data.id);
        const { id, ...rest } = data;
        const patch = pickDefined(rest) as Partial<AirportInsert>;

        const needGeo = patch.lat !== undefined || patch.lon !== undefined;

        try {
            const setObj: Partial<AirportInsert> = {
                ...patch,
                ...(needGeo
                    ? {
                        geog: sql`ST_SetSRID(
                ST_MakePoint(
                  COALESCE(${patch.lon as number | null}, ${schema.airports.lon}),
                  COALESCE(${patch.lat as number | null}, ${schema.airports.lat})
                ),
                4326
              )::geography`,
                        geom: sql`ST_SetSRID(
                ST_MakePoint(
                  COALESCE(${patch.lon as number | null}, ${schema.airports.lon}),
                  COALESCE(${patch.lat as number | null}, ${schema.airports.lat})
                ),
                4326
              )::geometry(Point,4326)`,
                    }
                    : {}),
            };

            const [row] = await db
                .update(schema.airports)
                .set(setObj)
                .where(eq(schema.airports.id, id))
                .returning(airportPublicFields);

            if (!row) throw new Error('Аэропорт не найден');
            return toAirportPublic(row);
        } catch (e: any) {
            if (e?.code === '23505' && (e?.constraint === 'airports_iata_uq' || e?.constraint === 'airports_icao_uq')) {
                throw new Error('Аэропорт с таким IATA/ICAO уже существует');
            }
            throw e;
        }
    },

    findById: async (id: string) => {
        try {
            AirportId.parse(id);
            const rows = await db
                .select(airportPublicFields)
                .from(schema.airports)
                .where(eq(schema.airports.id, id))
                .limit(1);

            return rows[0] ? toAirportPublic(rows[0]) : null;
        } catch {
            return null;
        }
    },

    /** Удаление */
    remove: async (id: string) => {
        AirportId.parse(id);
        const deleted = await db
            .delete(schema.airports)
            .where(eq(schema.airports.id, id))
            .returning({ id: schema.airports.id });
        return deleted.length > 0;
    },

    /** Пагинированный поиск по строке */
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
                .select(airportPublicFields)
                .from(schema.airports)
                .where(where)
                .orderBy(asc(schema.airports.name))
                .limit(limit)
                .offset(offset),
            db.select({ total: count() }).from(schema.airports).where(where),
        ]);

        return {
            data: rows.map(toAirportPublic),
            total,
            limit,
            offset,
        };
    },

    /**
     * Геопоиск ближайших аэропортов с поддержкой минимального/максимального радиуса.
     * @param lat широта
     * @param lon долгота
     * @param opts опциональные данные
     * @param opts.limit лимит (по умолчанию 10)
     * @param opts.offset оффсет (по умолчанию 0)
     * @param opts.minKm минимальная дистанция от точки (в км). Если 0 — без нижней границы.
     * @param opts.maxKm максимальная дистанция от точки (в км). Если 0 — без верхней границы (только сортировка).
     */
    findByGeo: async (
        lat: number,
        lon: number,
        opts: { limit?: number; offset?: number; minKm?: number; maxKm?: number } = {}
    ) => {
        const { limit = 10, offset = 0 } = opts;
        const minKm = Math.max(0, opts.minKm ?? 0);
        const maxKm = Math.max(0, opts.maxKm ?? 0);

        if (maxKm > 0 && maxKm <= minKm) {
            throw new Error('maxKm должен быть больше minKm');
        }

        // География исходной точки
        const origin = sql`ST_SetSRID(ST_MakePoint(${lon}, ${lat}), 4326)::geography`;
        const distanceExpr = sql<number>`ST_Distance(${schema.airports.geog}, ${origin}) / 1000.0`;

        // Условия: верхняя граница — ST_DWithin; нижняя — NOT ST_DWithin
        const conds: any[] = [];
        if (maxKm > 0) {
            conds.push(sql`ST_DWithin(${schema.airports.geog}, ${origin}, ${maxKm * 1000})`);
        }
        if (minKm > 0) {
            conds.push(sql`NOT ST_DWithin(${schema.airports.geog}, ${origin}, ${minKm * 1000})`);
        }

        const where = conds.length ? and(...conds) : undefined;

        // Сначала отбираем и сортируем по расстоянию
        const [rows, [{ total }]] = await Promise.all([
            db
                .select({
                    ...airportPublicFields,
                    distanceKm: distanceExpr,
                })
                .from(schema.airports)
                .where(where)
                .orderBy(sql`${distanceExpr} ASC`)
                .limit(limit)
                .offset(offset),
            db.select({ total: count() }).from(schema.airports).where(where),
        ]);

        return {
            data: rows.map((row) => {
                const { distanceKm, ...base } = row;
                const pub = toAirportPublic(base);
                return { ...pub, distanceKm: distanceKm != null ? Number(distanceKm) : undefined };
            }),
            total,
            limit,
            offset,
        };
    },

    delete: async (id: string): Promise<boolean> => {
        try {
            const deleted = await db
                .delete(schema.airports)
                .where(eq(schema.airports.id, id))
                .returning({ id: schema.airports.id });

            return deleted.length > 0;
        } catch (e) {
            throw e;
        }
    },
};
