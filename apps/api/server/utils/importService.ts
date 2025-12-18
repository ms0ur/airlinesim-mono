import Papa from 'papaparse';
import { airportRepo } from '../repo/airportRepo';
import { getTimezone } from './timezone';
import type { ImportStatus } from '@airlinesim/shared';

const DATA_URLS = {
    countries: 'https://raw.githubusercontent.com/davidmegginson/ourairports-data/master/countries.csv',
    airports: 'https://raw.githubusercontent.com/davidmegginson/ourairports-data/master/airports.csv',
    runways: 'https://raw.githubusercontent.com/davidmegginson/ourairports-data/master/runways.csv',
};


let currentStatus: ImportStatus = {
    running: false,
    step: 'idle',
    progress: 0,
    total: 0,
    message: 'Ready to import',
};

export const importService = {
    getStatus: () => currentStatus,

    startImport: async (clearAll = false) => {
        if (currentStatus.running) return;

        currentStatus = {
            running: true,
            step: 'countries',
            progress: 0,
            total: 0,
            message: 'Starting import...',
        };

        console.log(`[Import] Starting background import process (clearAll: ${clearAll})`);

        // Run in background
        (async () => {
            try {
                if (clearAll) {
                    currentStatus.message = 'Clearing old data...';
                    console.log('[Import] Clearing existing data from database...');
                    await airportRepo.clearAllData();
                }

                // 1. Countries
                await importService.importCountries();

                // 2. Airports
                await importService.importAirports();

                // 3. Runways
                await importService.importRunways();

                currentStatus = {
                    running: false,
                    step: 'finished',
                    progress: 100,
                    total: 100,
                    message: 'Import completed successfully',
                };
                console.log('[Import] Background import completed successfully.');
            } catch (e: any) {
                console.error('Import error:', e);
                currentStatus = {
                    running: false,
                    step: 'error',
                    progress: 0,
                    total: 0,
                    message: `Error: ${e.message}`,
                };
            }
        })();
    },

    importCountries: async () => {
        currentStatus.step = 'countries';
        currentStatus.message = 'Fetching countries...';
        console.log('[Import] Phase 1: Importing countries...');
        const response = await fetch(DATA_URLS.countries);
        const csv = await response.text();

        const results = Papa.parse(csv, { header: true, skipEmptyLines: true });
        const rows = results.data as any[];
        currentStatus.total = rows.length;
        console.log(`[Import] Fetched ${rows.length} countries.`);

        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];

            // Validation: skip if required fields are missing
            if (!row.code || !row.name) continue;

            try {
                await airportRepo.upsertCountry({
                    code: row.code,
                    name: row.name,
                    continent: row.continent,
                    wikipediaLink: row.wikipedia_link,
                });
            } catch (e: any) {
                console.warn(`[Import] Skipping country ${row.code} due to error: ${e.message}`);
            }

            currentStatus.progress = i + 1;
            if (i % 100 === 0) {
                currentStatus.message = `Importing countries: ${i + 1}/${rows.length}`;
                console.log(`[Import] Countries progress: ${i + 1}/${rows.length}`);
            }
        }
        console.log('[Import] Countries import finished.');
    },

    importAirports: async () => {
        currentStatus.step = 'airports';
        currentStatus.message = 'Fetching airports...';
        console.log('[Import] Phase 2: Importing airports...');
        const response = await fetch(DATA_URLS.airports);
        const csv = await response.text();

        const results = Papa.parse(csv, { header: true, skipEmptyLines: true });

        // Filter criteria:
        // 1. Must be large or medium airport
        // 2. Ident (ICAO) must be exactly 4 uppercase letters (excludes local 3-char codes and codes with digits like 4A2)
        // 3. IATA (if present) must be 3 uppercase letters
        const rows = (results.data as any[]).filter(row => {
            const isMajor = ['large_airport', 'medium_airport'].includes(row.type);
            const ident = row.ident || '';
            const iata = row.iata_code || '';

            const isStandardICAO = /^[A-Z]{4}$/.test(ident);
            const isStandardIATA = iata === '' || /^[A-Z]{3}$/.test(iata);

            return isMajor && isStandardICAO && isStandardIATA;
        });

        currentStatus.total = rows.length;
        console.log(`[Import] Fetched ${rows.length} airports (filtered to major/standard).`);

        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];

            if (!row.ident || !row.name || !row.latitude_deg || !row.longitude_deg) continue;

            const lat = parseFloat(row.latitude_deg);
            const lon = parseFloat(row.longitude_deg);

            if (isNaN(lat) || isNaN(lon)) continue;

            try {
                await airportRepo.upsertAirport({
                    icao: row.ident,
                    iata: row.iata_code || null,
                    name: row.name,
                    lat,
                    lon,
                    timezone: getTimezone(lat, lon),
                    type: row.type,
                    continent: row.continent,
                    isoCountry: row.iso_country,
                    isoRegion: row.iso_region,
                    municipality: row.municipality,
                    gpsCode: row.gps_code,
                    localCode: row.local_code,
                    elevationFt: row.elevation_ft ? parseInt(row.elevation_ft) : null,
                });
            } catch (e: any) {
                if (i % 100 === 0) {
                    console.warn(`[Import] Skipping airport ${row.ident} due to error: ${e.message}`);
                }
            }

            currentStatus.progress = i + 1;
            if (i % 100 === 0) {
                currentStatus.message = `Importing airports: ${i + 1}/${rows.length}`;
                console.log(`[Import] Airports progress: ${i + 1}/${rows.length}`);
            }
        }
        console.log('[Import] Airports import finished.');
    },

    importRunways: async () => {
        currentStatus.step = 'runways';
        currentStatus.message = 'Fetching runways...';
        console.log('[Import] Phase 3: Importing runways...');
        const response = await fetch(DATA_URLS.runways);
        const csv = await response.text();

        const results = Papa.parse(csv, { header: true, skipEmptyLines: true });
        const rows = results.data as any[];
        currentStatus.total = rows.length;
        console.log(`[Import] Fetched ${rows.length} runways.`);

        // Optimization: Get a map of ICAO -> ID
        // But our airport data is too large to load all at once efficiently in one go maybe?
        // Let's just do it by ICAO matching if we added ICAO to runways, but we didn't.
        // We need to find airport by ICAO.

        // Actually, OurAirports runways.csv has airport_ident.
        // Let's find airports in chunks to speed up.

        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];

            // Validation: skip if required fields are missing
            if (!row.airport_ident || !row.le_ident) continue;

            try {
                const airport = await airportRepo.findByIcao(row.airport_ident);
                if (airport) {
                    await airportRepo.upsertRunway({
                        airportId: airport.id,
                        ident: row.le_ident + '/' + (row.he_ident || 'XX'),
                        lengthFt: row.length_ft ? parseInt(row.length_ft) : null,
                        widthFt: row.width_ft ? parseInt(row.width_ft) : null,
                        surface: row.surface || null,
                        lighted: row.lighted === '1',
                        closed: row.closed === '1',
                        leIdent: row.le_ident || null,
                        heIdent: row.he_ident || null,
                        leLat: row.le_latitude_deg ? parseFloat(row.le_latitude_deg) : null,
                        leLon: row.le_longitude_deg ? parseFloat(row.le_longitude_deg) : null,
                        heLat: row.he_latitude_deg ? parseFloat(row.he_latitude_deg) : null,
                        heLon: row.he_longitude_deg ? parseFloat(row.he_longitude_deg) : null,
                    });
                }
            } catch (e: any) {
                if (i % 1000 === 0) {
                    console.warn(`[Import] Skipping runway at ${row.airport_ident} due to error: ${e.message}`);
                }
            }

            currentStatus.progress = i + 1;
            if (i % 1000 === 0) {
                currentStatus.message = `Importing runways: ${i + 1}/${rows.length}`;
                console.log(`[Import] Runways progress: ${i + 1}/${rows.length}`);
            }
        }
        console.log('[Import] Runways import finished.');
    },
};
