import { z } from 'zod';
import { createError } from 'h3';
import { aircraftTypeRepo } from '../../repo/aircraftTypesRepo';

const QSchema = z.object({
    mode: z.enum(['id', 'text', 'all']).default('all'),
    id: z.uuid().optional(),
    text: z.string().optional(),

    limit: z.coerce.number().int().min(1).max(1000).default(10),
    offset: z.coerce.number().int().min(0).default(0),
});

export default defineEventHandler(async (event) => {
    const parsed = QSchema.safeParse(getQuery(event));

    if (!parsed.success) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Validation Error',
            data: parsed.error.flatten(),
        });
    }

    const {
        mode,
        id,
        text,
        limit,
        offset,
    } = parsed.data;

    switch (mode) {
        case 'all': {
            const result = await aircraftTypeRepo.find('', limit, offset);
            return result;
        }

        case 'id': {
            if (!id) {
                throw createError({
                    statusCode: 400,
                    statusMessage: "field 'id' is required",
                });
            }

            const aircraftType = await aircraftTypeRepo.findById(id);

            if (!aircraftType) {
                throw createError({
                    statusCode: 404,
                    statusMessage: 'AircraftType Not Found',
                });
            }

            return aircraftType;
        }

        case 'text': {
            if (!text) {
                throw createError({
                    statusCode: 400,
                    statusMessage: "field 'text' is required",
                });
            }

            const result = await aircraftTypeRepo.find(text, limit, offset);
            return result;
        }
    }
});
