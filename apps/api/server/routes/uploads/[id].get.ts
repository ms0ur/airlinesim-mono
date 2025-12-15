import { uploadRepo } from '../../repo/uploadRepo';
import { createError, sendStream, setHeader } from 'h3';
import { createReadStream } from 'fs';
import { z } from 'zod';

export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, 'id');

    if (!id || !z.string().uuid().safeParse(id).success) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Invalid upload ID',
        });
    }

    // Update last accessed time and get upload
    const upload = await uploadRepo.findByIdAndUpdateAccess(id);

    if (!upload) {
        throw createError({
            statusCode: 404,
            statusMessage: 'Upload not found',
        });
    }

    const filePath = uploadRepo.getFilePath(upload);

    try {
        setHeader(event, 'Content-Type', upload.mimeType);
        setHeader(event, 'Content-Length', upload.size);
        setHeader(event, 'Cache-Control', 'public, max-age=31536000'); // 1 year cache

        return sendStream(event, createReadStream(filePath));
    } catch (error) {
        console.error('File read error:', error);
        throw createError({
            statusCode: 500,
            statusMessage: 'Failed to read file',
        });
    }
});

