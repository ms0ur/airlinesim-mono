import { UserRepo } from '../../repo/userRepo';
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

    try {
        const deleted = await UserRepo.delete(id);

        if (!deleted) {
            throw createError({
                statusCode: 404,
                statusMessage: 'User not found',
            });
        }

        return { success: true, id };
    } catch (error) {
        console.error(error);
        throw createError({
            statusCode: 500,
            statusMessage: 'Failed to delete user',
        });
    }
});

