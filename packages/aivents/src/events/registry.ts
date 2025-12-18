import { fuelShockSpec } from './global/market/fuelShock';

export const eventRegistry = {
    [fuelShockSpec.id]: fuelShockSpec,
} as const;

export type EventId = keyof typeof eventRegistry;
