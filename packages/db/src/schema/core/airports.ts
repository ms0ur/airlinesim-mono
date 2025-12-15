import { pgTable, uuid, varchar, timestamp, uniqueIndex, doublePrecision } from 'drizzle-orm/pg-core'
import { customType } from 'drizzle-orm/pg-core'
import { SQL, sql } from 'drizzle-orm'

const geography = customType<{ data: unknown }>({
    dataType: () => 'geography',
})
const geometry = customType<{ data: unknown }>({
    dataType: () => 'geometry',
})

export const airports = pgTable('airports', {
    id: uuid('id').defaultRandom().primaryKey(),

    iata: varchar('iata', { length: 3 }).notNull(),
    icao: varchar('icao', { length: 4 }).notNull(),

    name: varchar('name', { length: 120 }).notNull(),
    timezone: varchar('timezone', { length: 64 }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),

    lat: doublePrecision('lat').notNull(),
    lon: doublePrecision('lon').notNull(),

    geog: geography('geog')
        .notNull()
        .generatedAlwaysAs((): SQL =>
            sql`ST_SetSRID(ST_MakePoint(${airports.lon}, ${airports.lat}), 4326)::geography`
        ),

    geom: geometry('geom')
        .notNull()
        .generatedAlwaysAs((): SQL =>
            sql`ST_SetSRID(ST_MakePoint(${airports.lon}, ${airports.lat}), 4326)::geometry(Point,4326)`
        ),
}, (t) => [
    uniqueIndex('airports_iata_uq').on(t.iata),
    uniqueIndex('airports_icao_uq').on(t.icao),
])
