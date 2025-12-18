import { find } from 'geo-tz';

/**
 * Finds the first timezone for a given set of coordinates.
 */
export const getTimezone = (lat: number, lon: number): string => {
    try {
        const tzs = find(lat, lon);
        return tzs[0] || 'UTC';
    } catch (e) {
        console.error(`Error finding timezone for ${lat}, ${lon}:`, e);
        return 'UTC';
    }
};
