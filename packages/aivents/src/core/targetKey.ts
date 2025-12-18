export type TargetKey =
    | 'world'
    | `region:${string}`
    | `airport:${string}`
    | `route:${string}`
    | `airline:${string}`;

export const TK = {
    world: 'world' as const,
    region: (id: string) => `region:${id}` as const,
    airport: (id: string) => `airport:${id}` as const,
    route: (id: string) => `route:${id}` as const,
    airline: (id: string) => `airline:${id}` as const,
};
