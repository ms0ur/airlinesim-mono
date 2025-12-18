import { defineEventHandler, readBody } from 'h3';
import { airror } from '@airlinesim/airror';
import { createEventSchema } from '@airlinesim/db/zod';
import { eventsRepo } from '../repo/eventsRepo';

export default defineEventHandler(async (event) => {
    try {
        const input = createEventSchema.parse(await readBody(event));
        return await eventsRepo.create(input);
    } catch (e) {
        throw airror('DB_ERROR', { cause: e });
    }
});
