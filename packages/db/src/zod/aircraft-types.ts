import { z } from 'zod';

const IcaoCode = z.string().regex(/^[A-Z0-9]{2,4}$/, 'ICAO: 2–4 символа A–Z/0–9');
const IataCode = z.string().regex(/^[A-Z0-9]{3}$/, 'IATA: 3 символа A–Z/0–9');
const Name120  = z.string().min(1).max(120);
const PosInt   = z.number().int().positive();

export const AircraftTypeCreate = z.object({
    displayName: Name120,
    manufacturer: Name120,
    model: Name120,

    icao: IcaoCode,
    iata: IataCode.optional(),

    rangeKm: PosInt,
    cruisingSpeedKph: PosInt,
    seatCapacity: PosInt,

    characteristics: z.record(z.string(), z.unknown()).optional(),
});

export const AircraftTypePublic = AircraftTypeCreate.extend({
    id: z.uuid(),
    createdAt: z.date(),
});

export const AircraftTypeUpdate = z.object({
    id: z.uuid(),
    displayName: Name120.optional(),
    manufacturer: Name120.optional(),
    model: Name120.optional(),

    icao: IcaoCode.optional(),
    iata: z.union([IataCode, z.null()]).optional(),

    rangeKm: PosInt.optional(),
    cruisingSpeedKph: PosInt.optional(),
    seatCapacity: PosInt.optional(),

    characteristics: z.union([z.record(z.string(), z.unknown()), z.null()]).optional(),
});
