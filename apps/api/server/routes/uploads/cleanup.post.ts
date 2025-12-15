import { uploadRepo } from '../../repo/uploadRepo';
import { createError } from 'h3';
import { z } from 'zod';

const CleanupQuerySchema = z.object({
    days: z.coerce.number().int().min(1).max(365).default(30),
});

export default defineEventHandler(async (event) => {
    const query = getQuery(event);
    const parsed = CleanupQuerySchema.safeParse(query);

    if (!parsed.success) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Invalid query parameters',
        });
    }

    const { days } = parsed.data;

    try {
        const result = await uploadRepo.cleanupStaleUnused(days);

        return {
            success: true,
            message: `Cleaned up ${result.deletedCount} unused uploads older than ${days} days`,
            ...result,
        };
    } catch (error) {
        console.error('Cleanup error:', error);
        throw createError({
            statusCode: 500,
            statusMessage: 'Failed to cleanup uploads',
        });
    }
});

