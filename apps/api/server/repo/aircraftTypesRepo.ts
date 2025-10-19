import { db, schema } from '@airlinesim/db/client';

import { AircraftTypeCreate, AircraftTypeUpdate, AircraftTypePublic } from "@airlinesim/db/zod";

import {eq, ilike, or, sql} from 'drizzle-orm';
import { z } from 'zod';

type AircraftTypeInsert = typeof schema.aircraftTypes.$inferInsert;

export const aircraftTypeRepo = {
    createType: async (data: z.infer<typeof AircraftTypeCreate>) => {
        const values: AircraftTypeInsert = {
            displayName: data.displayName,
            manufacturer: data.manufacturer,
            model: data.model,
            icao: data.icao,
            iata: data.iata,
            rangeKm: data.rangeKm,
            cruisingSpeedKph: data.cruisingSpeedKph,
            seatCapacity: data.seatCapacity,
            characteristics: data.characteristics,
        }
        try {
            const [row] = await db
                .insert(schema.aircraftTypes)
                .values(values)
                .returning({
                        id: schema.aircraftTypes.id,
                        displayName: schema.aircraftTypes.displayName,
                        manufacturer: schema.aircraftTypes.manufacturer,
                        model: schema.aircraftTypes.model,
                        icao: schema.aircraftTypes.icao,
                        iata: schema.aircraftTypes.iata,
                        rangeKm: schema.aircraftTypes.rangeKm,
                        cruisingSpeedKph: schema.aircraftTypes.cruisingSpeedKph,
                        seatCapacity: schema.aircraftTypes.seatCapacity,
                        characteristics: schema.aircraftTypes.characteristics,
                        createdAt: schema.aircraftTypes.createdAt,
                    }
                );
            return AircraftTypePublic.parse({
                ...row,
                createdAt: row.createdAt instanceof Date ? row.createdAt.toISOString() : row.createdAt,
            })
        } catch (error) {
            throw error;
        }
    },
    findById: async (id: string) => {
        try {
            const row = await db
                .select()
                .from(schema.aircraftTypes)
                .where(eq(schema.aircraftTypes.id, id))
                .limit(1)
                .then(rows => rows[0])

            if (!row) return null;
            return AircraftTypePublic.parse({
                ...row,
                createdAt: row.createdAt instanceof Date ? row.createdAt.toISOString() : row.createdAt,
            });
        } catch (e) {
            throw e;
        }
    },
    find: async (filter="", limit=10, offset=0) => {
        try {
            const [rows, [{ count }]] = await Promise.all([
                db
                    .select()
                    .from(schema.aircraftTypes)
                    .where(
                        or(
                            ilike(schema.aircraftTypes.displayName, `%${filter}%`),
                            ilike(schema.aircraftTypes.model, `%${filter}%`),
                            ilike(schema.aircraftTypes.icao, `%${filter}%`),
                            ilike(schema.aircraftTypes.iata, `%${filter}%`),
                            ilike(schema.aircraftTypes.manufacturer, `%${filter}%`)
                        )
                    )
                    .limit(limit)
                    .offset(offset),
                db
                    .select({ count: sql<number>`count(*)::int` })
                    .from(schema.aircraftTypes)
                    .where(
                        or(
                            ilike(schema.aircraftTypes.displayName, `%${filter}%`),
                            ilike(schema.aircraftTypes.model, `%${filter}%`),
                            ilike(schema.aircraftTypes.icao, `%${filter}%`),
                            ilike(schema.aircraftTypes.iata, `%${filter}%`),
                            ilike(schema.aircraftTypes.manufacturer, `%${filter}%`)
                        )
                    )
            ])

            return {
                data: rows.map(row => AircraftTypePublic.parse({
                    ...row,
                    createdAt: row.createdAt instanceof Date ? row.createdAt.toISOString() : row.createdAt,
                })),
                total: count,
                limit: limit,
                offset: offset,
            }
        } catch (error) {
            throw error;
        }
    },
    edit: async (data: z.infer<typeof AircraftTypeUpdate>) => {
        // TODO implement method
        console.warn("aircraftTypeRepo.edit(data) is not implemented");
        throw new Error("aircraftTypeRepo.edit(data) is not implemented")
    }
}