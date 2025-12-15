import { db, schema } from '@airlinesim/db/client';
import { eq } from 'drizzle-orm';
import { airror } from '@airlinesim/airror';

type AircraftInsert = typeof schema.aircraft.$inferInsert;

export const aircraftRepo = {
    findByAirlineId: async (airlineId: string) => {
        try {
            const rows = await db
                .select({
                    id: schema.aircraft.id,
                    airlineId: schema.aircraft.airlineId,
                    typeId: schema.aircraft.typeId,
                    tailNumber: schema.aircraft.tailNumber,
                    inService: schema.aircraft.inService,
                    createdAt: schema.aircraft.createdAt,
                    type: {
                        id: schema.aircraftTypes.id,
                        displayName: schema.aircraftTypes.displayName,
                        manufacturer: schema.aircraftTypes.manufacturer,
                        model: schema.aircraftTypes.model,
                        icao: schema.aircraftTypes.icao,
                        iata: schema.aircraftTypes.iata,
                        rangeKm: schema.aircraftTypes.rangeKm,
                        cruisingSpeedKph: schema.aircraftTypes.cruisingSpeedKph,
                        seatCapacity: schema.aircraftTypes.seatCapacity,
                    }
                })
                .from(schema.aircraft)
                .leftJoin(schema.aircraftTypes, eq(schema.aircraft.typeId, schema.aircraftTypes.id))
                .where(eq(schema.aircraft.airlineId, airlineId));

            return rows.map(row => ({
                ...row,
                createdAt: row.createdAt instanceof Date ? row.createdAt.toISOString() : row.createdAt,
            }));
        } catch (e) {
            throw airror("DB_ERROR", { cause: e });
        }
    },

    countByAirlineId: async (airlineId: string): Promise<number> => {
        try {
            const rows = await db
                .select({ id: schema.aircraft.id })
                .from(schema.aircraft)
                .where(eq(schema.aircraft.airlineId, airlineId));

            return rows.length;
        } catch (e) {
            throw airror("DB_ERROR", { cause: e });
        }
    },

    create: async (data: AircraftInsert) => {
        try {
            const [row] = await db
                .insert(schema.aircraft)
                .values(data)
                .returning();

            return {
                ...row,
                createdAt: row.createdAt instanceof Date ? row.createdAt.toISOString() : row.createdAt,
            };
        } catch (e) {
            throw airror("DB_ERROR", { cause: e });
        }
    },

    findById: async (id: string) => {
        try {
            const row = await db
                .select()
                .from(schema.aircraft)
                .where(eq(schema.aircraft.id, id))
                .limit(1)
                .then(r => r[0]);

            if (!row) return null;

            return {
                ...row,
                createdAt: row.createdAt instanceof Date ? row.createdAt.toISOString() : row.createdAt,
            };
        } catch (e) {
            throw airror("DB_ERROR", { cause: e });
        }
    },

    delete: async (id: string): Promise<boolean> => {
        try {
            const deleted = await db
                .delete(schema.aircraft)
                .where(eq(schema.aircraft.id, id))
                .returning({ id: schema.aircraft.id });

            return deleted.length > 0;
        } catch (e) {
            throw airror("DB_ERROR", { cause: e });
        }
    }
};

