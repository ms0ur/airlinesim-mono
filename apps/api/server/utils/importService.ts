import Papa from 'papaparse';
import { airportRepo } from '../repo/airportRepo';
import { getTimezone } from './timezone';
import type { ImportStatus } from '@airlinesim/shared';

const DATA_URLS = {
    countries: 'https://davidmegginson.github.io/ourairports-data/countries.csv',
    regions: 'https://davidmegginson.github.io/ourairports-data/regions.csv',
    airports: 'https://davidmegginson.github.io/ourairports-data/airports.csv',
    runways: 'https://davidmegginson.github.io/ourairports-data/runways.csv',
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

                // 2. Regions
                await importService.importRegions();

                // 3. Airports
                await importService.importAirports();

                // 4. Runways
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

    importRegions: async () => {
        currentStatus.step = 'regions';
        currentStatus.message = 'Fetching regions...';
        console.log('[Import] Phase 2: Importing regions...');
        const response = await fetch(DATA_URLS.regions);
        const csv = await response.text();

        const results = Papa.parse(csv, { header: true, skipEmptyLines: true });
        const rows = results.data as any[];
        currentStatus.total = rows.length;
        console.log(`[Import] Fetched ${rows.length} regions.`);

        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];

            if (!row.code || !row.name) continue;

            try {
                await airportRepo.upsertRegion({
                    code: row.code,
                    localCode: row.local_code,
                    name: row.name,
                    continent: row.continent,
                    isoCountry: row.iso_country,
                    wikipediaLink: row.wikipedia_link,
                    keywords: row.keywords,
                });
            } catch (e: any) {
                console.warn(`[Import] Skipping region ${row.code} due to error: ${e.message}`);
            }

            currentStatus.progress = i + 1;
            if (i % 500 === 0) {
                currentStatus.message = `Importing regions: ${i + 1}/${rows.length}`;
                console.log(`[Import] Regions progress: ${i + 1}/${rows.length}`);
            }
        }
        console.log('[Import] Regions import finished.');
    },

    importAirports: async () => {
        currentStatus.step = 'airports';
        currentStatus.message = 'Fetching airports...';
        console.log('[Import] Phase 3: Importing airports...');
        const response = await fetch(DATA_URLS.airports);
        const csv = await response.text();

        const results = Papa.parse(csv, { header: true, skipEmptyLines: true });

        // Filter criteria:
        // 1. Must have a valid 4-letter ICAO (ident or gps_code)
        // 2. IATA (if present) must be 3 uppercase letters
        const rows = (results.data as any[]).filter(row => {
            const ident = (row.ident || '').toUpperCase();
            const gpsCode = (row.gps_code || '').toUpperCase();
            const iata = (row.iata_code || '').toUpperCase();

            // We prefer gps_code if it's a valid 4-letter ICAO, otherwise ident
            const validIcao = /^[A-Z]{4}$/.test(gpsCode) ? gpsCode : (/^[A-Z]{4}$/.test(ident) ? ident : null);
            const isStandardIATA = iata === '' || /^[A-Z]{3}$/.test(iata);

            // We also want to prioritize commercial/scheduled or at least medium-large
            const isMajor = ['large_airport', 'medium_airport', 'small_airport'].includes(row.type);

            return validIcao && isMajor && isStandardIATA;
        });

        currentStatus.total = rows.length;
        console.log(`[Import] Fetched ${rows.length} airports (filtered to strict ICAO).`);

        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];

            const ident = (row.ident || '').toUpperCase();
            const gpsCode = (row.gps_code || '').toUpperCase();
            const icao = /^[A-Z]{4}$/.test(gpsCode) ? gpsCode : ident; // Row passed filter, so one must be 4-chars

            if (!icao || !row.name || !row.latitude_deg || !row.longitude_deg) continue;

            const lat = parseFloat(row.latitude_deg);
            const lon = parseFloat(row.longitude_deg);

            if (isNaN(lat) || isNaN(lon)) continue;

            try {
                await airportRepo.upsertAirport({
                    icao,
                    iata: row.iata_code || null,
                    name: row.name,
                    lat,
                    lon,
                    timezone: getTimezone(lat, lon),
                    type: row.type || 'small_airport',
                    continent: row.continent,
                    isoCountry: row.iso_country,
                    isoRegion: row.iso_region,
                    municipality: row.municipality,
                    scheduledService: row.scheduled_service || 'no',
                    gpsCode: row.gps_code,
                    localCode: row.local_code,
                    elevationFt: row.elevation_ft ? parseInt(row.elevation_ft) : null,
                    homeLink: row.home_link,
                    wikipediaLink: row.wikipedia_link,
                    keywords: row.keywords,
                });
            } catch (e: any) {
                if (i % 100 === 0) {
                    console.warn(`[Import] Skipping airport ${row.ident} due to error: ${e.message}`);
                }
            }

            currentStatus.progress = i + 1;
            if (i % 500 === 0) {
                currentStatus.message = `Importing airports: ${i + 1}/${rows.length}`;
                console.log(`[Import] Airports progress: ${i + 1}/${rows.length}`);
            }
        }
        console.log('[Import] Airports import finished.');
    },

    importRunways: async () => {
        currentStatus.step = 'runways';
        currentStatus.message = 'Fetching runways...';
        console.log('[Import] Phase 4: Importing runways...');
        const response = await fetch(DATA_URLS.runways);
        const csv = await response.text();

        const results = Papa.parse(csv, { header: true, skipEmptyLines: true });
        const rows = results.data as any[];
        currentStatus.total = rows.length;
        console.log(`[Import] Fetched ${rows.length} runways.`);

        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];

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
