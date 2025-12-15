import { db, schema } from '@airlinesim/db/client';
import { desc, gte } from 'drizzle-orm';
import { airror } from '@airlinesim/airror';

const BASE_PRICE = 200;
const VOLATILITY = 30;
const UPDATE_INTERVAL_MS = 15 * 60 * 1000;

function generatePrice(previousPrice?: number): number {
    if (!previousPrice) {
        return BASE_PRICE + Math.floor((Math.random() - 0.5) * VOLATILITY * 2);
    }

    const change = (Math.random() - 0.5) * VOLATILITY;
    let newPrice = previousPrice + change;

    if (newPrice < BASE_PRICE - VOLATILITY * 2) {
        newPrice = BASE_PRICE - VOLATILITY * 2 + Math.random() * 10;
    } else if (newPrice > BASE_PRICE + VOLATILITY * 2) {
        newPrice = BASE_PRICE + VOLATILITY * 2 - Math.random() * 10;
    }

    return Math.round(newPrice);
}

function getNextUpdateTime(): Date {
    const now = new Date();
    const minutes = now.getUTCMinutes();
    const nextInterval = Math.ceil((minutes + 1) / 15) * 15;
    const next = new Date(now);
    next.setUTCMinutes(nextInterval, 0, 0);
    if (next <= now) {
        next.setUTCMinutes(next.getUTCMinutes() + 15);
    }
    return next;
}

export const fuelPriceRepo = {
    getCurrentPrice: async () => {
        try {
            const latest = await db
                .select()
                .from(schema.fuelPrices)
                .orderBy(desc(schema.fuelPrices.recordedAt))
                .limit(1)
                .then(r => r[0]);

            if (!latest) {
                return await fuelPriceRepo.generateNewPrice();
            }

            const now = new Date();
            const lastUpdate = new Date(latest.recordedAt);
            const timeSinceUpdate = now.getTime() - lastUpdate.getTime();

            if (timeSinceUpdate >= UPDATE_INTERVAL_MS) {
                return await fuelPriceRepo.generateNewPrice(latest.pricePerTon);
            }

            return {
                id: latest.id,
                pricePerTon: latest.pricePerTon,
                recordedAt: latest.recordedAt instanceof Date ? latest.recordedAt.toISOString() : latest.recordedAt,
                nextUpdateAt: getNextUpdateTime().toISOString(),
            };
        } catch (e) {
            throw airror("DB_ERROR", { cause: e });
        }
    },

    generateNewPrice: async (previousPrice?: number) => {
        try {
            const newPrice = generatePrice(previousPrice);

            const [row] = await db
                .insert(schema.fuelPrices)
                .values({ pricePerTon: newPrice })
                .returning();

            return {
                id: row.id,
                pricePerTon: row.pricePerTon,
                recordedAt: row.recordedAt instanceof Date ? row.recordedAt.toISOString() : row.recordedAt,
                nextUpdateAt: getNextUpdateTime().toISOString(),
            };
        } catch (e) {
            throw airror("DB_ERROR", { cause: e });
        }
    },

    forceGenerateNewPrice: async () => {
        try {
            const latest = await db
                .select()
                .from(schema.fuelPrices)
                .orderBy(desc(schema.fuelPrices.recordedAt))
                .limit(1)
                .then(r => r[0]);

            const newPrice = generatePrice(latest?.pricePerTon);

            const [row] = await db
                .insert(schema.fuelPrices)
                .values({ pricePerTon: newPrice })
                .returning();

            return {
                id: row.id,
                pricePerTon: row.pricePerTon,
                recordedAt: row.recordedAt instanceof Date ? row.recordedAt.toISOString() : row.recordedAt,
                nextUpdateAt: getNextUpdateTime().toISOString(),
            };
        } catch (e) {
            throw airror("DB_ERROR", { cause: e });
        }
    },

    getHistory: async (hours: number = 24) => {
        try {
            const since = new Date(Date.now() - hours * 60 * 60 * 1000);

            const rows = await db
                .select()
                .from(schema.fuelPrices)
                .where(gte(schema.fuelPrices.recordedAt, since))
                .orderBy(schema.fuelPrices.recordedAt)
                .limit(100);

            const current = await fuelPriceRepo.getCurrentPrice();

            return {
                data: rows.map(row => ({
                    id: row.id,
                    pricePerTon: row.pricePerTon,
                    recordedAt: row.recordedAt instanceof Date ? row.recordedAt.toISOString() : row.recordedAt,
                })),
                currentPrice: current.pricePerTon,
                nextUpdateAt: current.nextUpdateAt,
            };
        } catch (e) {
            throw airror("DB_ERROR", { cause: e });
        }
    },
};

