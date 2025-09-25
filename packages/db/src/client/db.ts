import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "../schema";
import { env } from "./env";

const g = globalThis as unknown as {
    __airlinesim_pool?: Pool;
    __airlinesim_db?: ReturnType<typeof drizzle>;
};

export const pool =
    g.__airlinesim_pool ?? (g.__airlinesim_pool = new Pool({ connectionString: env.DATABASE_URL }));

export const db =
    g.__airlinesim_db ?? (g.__airlinesim_db = drizzle(pool, { schema }));

export type Db = typeof db;
export { schema };
