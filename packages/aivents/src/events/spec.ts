import type { z } from 'zod';
import type { EventDefinition } from '../core/types';

export type EventSpec<P> = {
    id: string;
    payloadSchema: z.ZodType<P>;
    define: (payload: P) => EventDefinition;
};
