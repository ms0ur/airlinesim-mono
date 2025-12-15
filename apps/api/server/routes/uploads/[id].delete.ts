import { uploadRepo } from '../../repo/uploadRepo';
import { createError } from 'h3';
import { z } from 'zod';

export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, 'id');

    if (!id || !z.string().uuid().safeParse(id).success) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Invalid upload ID',
        });
    }

    const deleted = await uploadRepo.delete(id);

    if (!deleted) {
        throw createError({
            statusCode: 404,
            statusMessage: 'Upload not found',
        });
    }

    return { success: true, id };
});

