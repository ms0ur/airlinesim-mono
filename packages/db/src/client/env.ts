import { z } from 'zod';

const Env = z.object({
    DATABASE_URL: z.string().url(),
});

export const env = Env.parse({
    DATABASE_URL: process.env.DATABASE_URL,
});
