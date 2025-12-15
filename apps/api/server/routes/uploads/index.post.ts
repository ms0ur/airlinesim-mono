import { uploadRepo } from '../../repo/uploadRepo';
import { createError } from 'h3';

export default defineEventHandler(async (event) => {
    const formData = await readMultipartFormData(event);

    if (!formData || formData.length === 0) {
        throw createError({
            statusCode: 400,
            statusMessage: 'No file provided',
        });
    }

    const file = formData.find(f => f.name === 'file');

    if (!file || !file.data) {
        throw createError({
            statusCode: 400,
            statusMessage: 'No file field in form data',
        });
    }

    // Validate file type (images only)
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type || '')) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Invalid file type. Allowed: JPEG, PNG, WebP, GIF',
        });
    }

    // Max 5MB
    if (file.data.length > 5 * 1024 * 1024) {
        throw createError({
            statusCode: 400,
            statusMessage: 'File too large. Max 5MB',
        });
    }

    try {
        const upload = await uploadRepo.create({
            buffer: file.data,
            originalName: file.filename || 'unknown',
            mimeType: file.type || 'application/octet-stream',
        });

        setResponseStatus(event, 201);
        return { data: upload };
    } catch (error) {
        console.error('Upload error:', error);
        throw createError({
            statusCode: 500,
            statusMessage: 'Failed to upload file',
        });
    }
});

