import { UserRepo } from '../../repo/userRepo';
import { userUpdate } from '@airlinesim/db/zod';
import { createError } from 'h3';
import { z } from 'zod';

export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, 'id');

    if (!id || !z.string().uuid().safeParse(id).success) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Invalid user ID',
        });
    }

    const body = await readBody(event);
    const parsed = userUpdate.safeParse({ ...body, id });

    if (!parsed.success) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Invalid request body',
            data: parsed.error.flatten(),
        });
    }

    try {
        const updated = await UserRepo.edit(parsed.data);

        if (!updated) {
            throw createError({
                statusCode: 404,
                statusMessage: 'User not found',
            });
        }

        return { data: updated };
    } catch (error) {
        console.error(error);
        throw createError({
            statusCode: 500,
            statusMessage: 'Failed to update user',
        });
    }
});

