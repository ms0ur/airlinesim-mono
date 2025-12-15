import { z } from 'zod'
import { createError } from 'h3'
import { airlineRepo } from '../../repo/airlineRepo'

const QSchema = z.object({
    mode: z.enum(['id', 'text', 'all']).default('all'),
    id: z.uuid().optional(),

    text: z.string().optional(),

    limit: z.coerce.number().int().min(1).max(1000).default(10),
    offset: z.coerce.number().int().min(0).default(0),
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
    } = parsed.data

    switch (mode) {
        case 'id': {
            if (!id) {
                throw createError({
                    statusCode: 400,
                    statusMessage: 'ID is required for mode=id',
                })
            }
            const item = await airlineRepo.findById(id)
            if (!item) {
                throw createError({
                    statusCode: 404,
                    statusMessage: 'Airline not found',
                })
            }
            return item
        }
        case 'text': {
            if (!text) {
                throw createError({
                    statusCode: 400,
                    statusMessage: 'Text is required for mode=text',
                })
            }
            return await airlineRepo.find(text, limit, offset)
        }
        case 'all': {
            return await airlineRepo.find('', limit, offset)
        }
    }
})