import { aircraftTypeRepo } from '../../repo/aircraftTypesRepo';
import { AircraftTypeUpdate } from '@airlinesim/db/zod';
import { createError } from 'h3';
import { z } from 'zod';

export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, 'id');

    if (!id || !z.string().uuid().safeParse(id).success) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Invalid aircraft type ID',
        });
    }

    const body = await readBody(event);
    const parsed = AircraftTypeUpdate.safeParse({ ...body, id });

    if (!parsed.success) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Invalid request body',
            data: parsed.error.flatten(),
        });
    }

    try {
        const updated = await aircraftTypeRepo.edit(parsed.data);

        if (!updated) {
            throw createError({
                statusCode: 404,
                statusMessage: 'Aircraft type not found',
            });
        }

        return { data: updated };
    } catch (error) {
        console.error(error);
        throw createError({
            statusCode: 500,
            statusMessage: 'Failed to update aircraft type',
        });
    }
});

