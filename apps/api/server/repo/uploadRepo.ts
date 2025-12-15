import { db, schema } from '@airlinesim/db/client';
import { eq, lt, isNull, sql } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import { mkdir, writeFile, unlink } from 'fs/promises';
import { join } from 'path';

type UploadInsert = typeof schema.uploads.$inferInsert;
type UploadSelect = typeof schema.uploads.$inferSelect;

const UPLOAD_DIR = join(process.cwd(), 'uploads');

// Ensure upload directory exists
async function ensureUploadDir() {
    try {
        await mkdir(UPLOAD_DIR, { recursive: true });
    } catch (e) {
        // Directory already exists
    }
}

export const uploadRepo = {
    /**
     * Save file to disk and create DB record
     */
    create: async (file: {
        buffer: Buffer;
        originalName: string;
        mimeType: string;
    }): Promise<UploadSelect> => {
        await ensureUploadDir();

        const id = randomUUID();
        const ext = file.originalName.split('.').pop() || 'bin';
        const filename = `${id}.${ext}`;
        const path = join(UPLOAD_DIR, filename);

        // Write file to disk
        await writeFile(path, file.buffer);

        // Create DB record
        const values: UploadInsert = {
            id,
            filename,
            originalName: file.originalName,
            mimeType: file.mimeType,
            size: file.buffer.length,
            path: `uploads/${filename}`,
        };

        const [row] = await db
            .insert(schema.uploads)
            .values(values)
            .returning();

        return row;
    },

    /**
     * Get upload by ID
     */
    findById: async (id: string): Promise<UploadSelect | null> => {
        const rows = await db
            .select()
            .from(schema.uploads)
            .where(eq(schema.uploads.id, id))
            .limit(1);

        return rows[0] || null;
    },

    /**
     * Get upload by ID and update lastAccessedAt
     */
    findByIdAndUpdateAccess: async (id: string): Promise<UploadSelect | null> => {
        const [row] = await db
            .update(schema.uploads)
            .set({ lastAccessedAt: new Date() })
            .where(eq(schema.uploads.id, id))
            .returning();

        return row || null;
    },

    /**
     * Delete upload (file + DB record)
     */
    delete: async (id: string): Promise<boolean> => {
        const upload = await uploadRepo.findById(id);
        if (!upload) return false;

        try {
            // Delete file from disk
            const filePath = join(process.cwd(), upload.path);
            await unlink(filePath);
        } catch (e) {
            // File may not exist
        }

        // Delete DB record
        const deleted = await db
            .delete(schema.uploads)
            .where(eq(schema.uploads.id, id))
            .returning({ id: schema.uploads.id });

        return deleted.length > 0;
    },

    /**
     * Get full file path for serving
     */
    getFilePath: (upload: UploadSelect): string => {
        return join(process.cwd(), upload.path);
    },

    /**
     * Find all unused uploads (not referenced by any entity)
     * Returns uploads that are not used in aircraft_types.image_id
     */
    findUnused: async (): Promise<UploadSelect[]> => {
        const rows = await db
            .select({
                id: schema.uploads.id,
                filename: schema.uploads.filename,
                originalName: schema.uploads.originalName,
                mimeType: schema.uploads.mimeType,
                size: schema.uploads.size,
                path: schema.uploads.path,
                createdAt: schema.uploads.createdAt,
                lastAccessedAt: schema.uploads.lastAccessedAt,
            })
            .from(schema.uploads)
            .leftJoin(
                schema.aircraftTypes,
                eq(schema.uploads.id, schema.aircraftTypes.imageId)
            )
            .where(isNull(schema.aircraftTypes.id));

        return rows;
    },

    /**
     * Find uploads not accessed for specified days that are not in use
     */
    findStaleUnused: async (days: number = 30): Promise<UploadSelect[]> => {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);

        const rows = await db
            .select({
                id: schema.uploads.id,
                filename: schema.uploads.filename,
                originalName: schema.uploads.originalName,
                mimeType: schema.uploads.mimeType,
                size: schema.uploads.size,
                path: schema.uploads.path,
                createdAt: schema.uploads.createdAt,
                lastAccessedAt: schema.uploads.lastAccessedAt,
            })
            .from(schema.uploads)
            .leftJoin(
                schema.aircraftTypes,
                eq(schema.uploads.id, schema.aircraftTypes.imageId)
            )
            .where(
                sql`${schema.aircraftTypes.id} IS NULL AND ${schema.uploads.lastAccessedAt} < ${cutoffDate}`
            );

        return rows;
    },

    /**
     * Cleanup stale unused uploads
     * Deletes uploads not referenced and not accessed for specified days
     */
    cleanupStaleUnused: async (days: number = 30): Promise<{ deletedCount: number; deletedIds: string[] }> => {
        const staleUploads = await uploadRepo.findStaleUnused(days);
        const deletedIds: string[] = [];

        for (const upload of staleUploads) {
            const success = await uploadRepo.delete(upload.id);
            if (success) {
                deletedIds.push(upload.id);
            }
        }

        return {
            deletedCount: deletedIds.length,
            deletedIds,
        };
    },
};

