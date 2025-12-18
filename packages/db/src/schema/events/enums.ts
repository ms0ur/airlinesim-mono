import { pgEnum } from 'drizzle-orm/pg-core';

export const eventSeverityEnum = pgEnum('event_severity', ['minor', 'major', 'crisis']);
export const eventActionEnum = pgEnum('event_action', ['none', 'optional', 'required']);
export const eventStatusEnum = pgEnum('event_status', ['active', 'pendingDecision', 'resolved', 'expired']);

export const metricKeyEnum = pgEnum('metric_key', [
    'fuelPrice',
    'demand',
    'airportCapacity',
    'reputation',
    'costIndex',
]);

export const modifierKindEnum = pgEnum('modifier_kind', ['multiplier', 'delta']);
