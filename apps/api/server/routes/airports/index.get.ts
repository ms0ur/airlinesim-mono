import { z } from 'zod'
import { createError } from 'h3'
import { airportRepo } from '../../repo/airportRepo'

const QSchema = z.object({
    mode: z.enum(['id', 'text', 'geoFrom', 'all']).default('all'),
    id: z.uuid().optional(),

    text: z.string().optional(),

    limit: z.coerce.number().int().min(1).max(1000).default(10),
    offset: z.coerce.number().int().min(0).default(0),

    lat: z.coerce.number().optional(),
    lng: z.coerce.number().optional(),
    maxRadius: z.coerce.number().optional(),
    minRadius: z.coerce.number().optional(),
})

export default defineEventHandler(async (event) => {
    const parsed = QSchema.safeParse(getQuery(event))
    if (!parsed.success) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Validation Error',
            data: parsed.error.flatten(),
        })
    }

    const { mode, id,
        text, limit, offset,
        lat, lng,
        maxRadius, minRadius
    } = parsed.data

    switch (mode) {
        case 'all': {
            return airportRepo.find(limit, offset, '')
        }

        case 'id': {
            if (!id) {
                throw createError({ statusCode: 400, statusMessage: "field 'id' is required" })
            }
            return airportRepo.findById(id)
        }

        case 'text': {
            if (!text) {
                throw createError({ statusCode: 400, statusMessage: "field 'text' is required" })
            }
            return airportRepo.find(limit, offset, text)
        }

        case 'geoFrom': {
            if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
                throw createError({ statusCode: 400, statusMessage: "fields 'lat' and 'lng' are required" })
            }
            // @ts-ignore lat и lng точно числа из-за проверки выше
            return airportRepo.findByGeo(lat, lng, {
                limit,
                offset,
                maxKm: maxRadius,
                minKm: minRadius,
            })
        }
    }
})
