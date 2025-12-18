
import Papa from 'papaparse';
import yaml from 'js-yaml';
import { aircraftTypeRepo } from '../repo/aircraftTypesRepo';
import { uploadRepo } from '../repo/uploadRepo';
import type { ImportStatus } from '@airlinesim/shared';

// --- Constants ---
const DATA_URLS = {
    openflights: 'https://raw.githubusercontent.com/jpatokal/openflights/refs/heads/master/data/planes.dat',
    openap: {
        synonyms: 'https://raw.githubusercontent.com/junzis/openap/refs/heads/master/openap/data/aircraft/_synonym.csv',
        fuel: 'https://raw.githubusercontent.com/junzis/openap/refs/heads/master/openap/data/fuel/fuel_models.csv',
        engines: 'https://raw.githubusercontent.com/junzis/openap/refs/heads/master/openap/data/engine/engines.csv',
        aircraftDataDir: 'https://raw.githubusercontent.com/junzis/openap/refs/heads/master/openap/data/aircraft/',
        // We will fetch file list from GitHub API or hardcode known list? 
        // GitHub API has rate limits. Better strategy for OpenAP:
        // We can try to fetch known ICAOs from some list, or use the Synonyms file unique targets + Origs as a discovery list.
        // Actually, the synonyms file target column + orig column gives us a good set of "valid" typecodes to try fetching YMLs for.
        // Let's use the set of (orig U target) from synonyms + some heuristic. 
        // Better: Fetch the file list from GitHub API:
        fileList: 'https://api.github.com/repos/junzis/openap/contents/openap/data/aircraft'
    }
};

const USER_AGENT = 'AirlineSim-Import-Agent/1.0';

// --- Types ---
interface ImportState extends ImportStatus {
    processedCount: number;
    successCount: number;
    errorCount: number;
}





interface OpenAPEngine {
    uid: string;
    name: string;
    manufacturer: string;
    type: string;
    max_thrust: number;
    bpr: number;
    bypass: number; // sometimes called bypass in yaml vs bpr in csv
    // add other fields as needed
    [key: string]: any;
}

// --- Service ---

let currentStatus: ImportState = {
    running: false,
    step: 'idle',
    progress: 0,
    total: 0,
    message: 'Ready to import',
    processedCount: 0,
    successCount: 0,
    errorCount: 0
};

// Map caches
const maps = {
    icaoToIata: new Map<string, string>(), // ICAO -> IATA
    icaoToName: new Map<string, string>(), // ICAO -> OpenFlights Name
    synonyms: new Map<string, string>(), // Orig -> Target (Canonical)
    fuelModels: new Map<string, { c1: number, c2: number, c3: number }>(), // TypeCode -> Model
    engines: new Map<string, OpenAPEngine>(), // Engine Name -> Engine Specs
};

export const aircraftTypeImportService = {
    getStatus: () => currentStatus,

    startImport: async (clearAll = false) => {
        if (currentStatus.running) return;

        currentStatus = {
            running: true,
            step: 'init',
            progress: 0,
            total: 0,
            message: 'Initializing import...',
            processedCount: 0,
            successCount: 0,
            errorCount: 0
        };

        (async () => {
            try {
                if (clearAll) {
                    currentStatus.message = 'Clearing old data...';
                    await aircraftTypeRepo.clearAllData();
                }

                // 1. Fetch Reference Data
                await aircraftTypeImportService.fetchReferenceData();

                // 2. Discover Aircraft Files
                const files = await aircraftTypeImportService.discoverAircraftFiles();
                currentStatus.total = files.length;

                // 3. Process each aircraft
                currentStatus.step = 'processing';
                for (let i = 0; i < files.length; i++) {
                    const filename = files[i];
                    currentStatus.message = `Processing ${filename} (${i + 1}/${files.length})`;
                    currentStatus.progress = i + 1;

                    try {
                        await aircraftTypeImportService.processAircraft(filename);
                        currentStatus.successCount++;
                    } catch (e: any) {
                        console.error(`Error processing ${filename}:`, e.message);
                        currentStatus.errorCount++;
                    }

                    // Optional: delay to avoid rate limits? import is slow enough usually.
                }

                currentStatus = {
                    ...currentStatus,
                    running: false,
                    step: 'finished',
                    message: `Import complete. Success: ${currentStatus.successCount}, Errors: ${currentStatus.errorCount}`
                };

            } catch (e: any) {
                console.error('Fatal import error:', e);
                currentStatus = {
                    ...currentStatus,
                    running: false,
                    step: 'error',
                    message: `Fatal error: ${e.message}`
                };
            }
        })();
    },

    fetchReferenceData: async () => {
        currentStatus.step = 'fetching_refs';
        currentStatus.message = 'Fetching reference data (OpenFlights, Synonyms, Fuel, Engines)...';

        // Helper for CSV fetching
        const fetchCsv = async (url: string) => {
            const res = await fetch(url);
            if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.statusText}`);
            const text = await res.text();
            return Papa.parse(text, { header: true, skipEmptyLines: true, dynamicTyping: true }).data as any[];
        };

        // OpenFlights
        try {
            // planes.dat is CSV but without headers usually. Let's check format.
            // Actually standard planes.dat is CSV without headers: "Name","IATA","ICAO"
            const res = await fetch(DATA_URLS.openflights);
            const text = await res.text();
            // Manual parse or Papaparse without header
            const rows = Papa.parse(text, { header: false }).data as any[];
            rows.forEach(r => {
                const name = r[0];
                const iata = r[1];
                const icao = r[2];
                if (icao && icao !== '\\N') {
                    if (iata && iata !== '\\N') maps.icaoToIata.set(icao, iata);
                    if (name) maps.icaoToName.set(icao, name);
                }
            });
        } catch (e) {
            console.error("Failed to fetch OpenFlights", e);
        }

        // Synonyms
        try {
            // _synonym.csv IS with headers: orig, target, use_synonym
            const rows = await fetchCsv(DATA_URLS.openap.synonyms);
            rows.forEach((r: any) => {
                if (r.orig && r.target) {
                    maps.synonyms.set(r.orig.toLowerCase(), r.target.toLowerCase());
                }
            });
        } catch (e) {
            console.error("Failed to fetch Synonyms", e);
        }

        // Fuel Models
        try {
            // typecode, engine_type, c1, c2, c3
            const rows = await fetchCsv(DATA_URLS.openap.fuel);
            rows.forEach((r: any) => {
                if (r.typecode && r.c1 != null) {
                    maps.fuelModels.set(r.typecode.toLowerCase(), {
                        c1: r.c1, c2: r.c2, c3: r.c3
                    });
                }
            });
        } catch (e) {
            console.error("Failed to fetch Fuel Models", e);
        }

        // Engines
        try {
            // uid,name,manufacturer,max_thrust,...
            const rows = await fetchCsv(DATA_URLS.openap.engines);
            rows.forEach((r: any) => {
                if (r.name) {
                    maps.engines.set(r.name, r);
                }
            });
        } catch (e) {
            console.error("Failed to fetch Engines", e);
        }
    },

    discoverAircraftFiles: async (): Promise<string[]> => {
        // Use GitHub API to list files in directory
        // Fallback: if API fails (rate limit), usage a gathered list or try brute force based on known ICAOs?
        // Let's rely on API for now.
        const res = await fetch(DATA_URLS.openap.fileList, {
            headers: { 'User-Agent': USER_AGENT }
        });
        if (!res.ok) throw new Error('Failed to list OpenAP files');
        const data = await res.json() as any[];
        return data
            .filter((f: any) => f.name.endsWith('.yml'))
            .map((f: any) => f.name);
    },

    processAircraft: async (filename: string) => {
        const typeCode = filename.replace('.yml', '').toLowerCase();

        // 1. Fetch YAML
        const url = `${DATA_URLS.openap.aircraftDataDir}${filename}`;
        const res = await fetch(url);
        if (!res.ok) return; // Skip invalid
        const text = await res.text();
        const yml = yaml.load(text) as any;

        if (!yml) return;

        // 2. Resolve Basics
        // ICAO is the typeCode (canonical).
        // Check if this typeCode maps to another canonical? 
        // Actually the file IS the canonical usually.
        // Synonyms map TO this file. 

        const icao = typeCode.toUpperCase();

        // Skip if strictly NO performance data is calculate-able
        // Required: Capacity, Range, Speed

        // Capacity
        let seatCapacity = yml.pax?.max || yml.pax?.high || yml.pax?.std;
        if (!seatCapacity) {
            // console.warn(`Skipping ${icao}: No seat capacity`);
            return;
        }

        // Range
        let rangeKm = 0;
        if (yml.cruise?.range) rangeKm = yml.cruise.range;
        else if (yml.range) rangeKm = yml.range;

        // Convert NM or Miles? OpenAP docs say SI units usually (km, m/s) but sometimes mixed?
        // OpenAP `cruise.range` is usually in KM. `range` at root? 
        // Let's assume KM. If < 500 and not heli/small, suspicion? 
        // Checking sample: A320 range 5000 (km). B738 range 5765. Sounds like km.
        if (!rangeKm) return;

        // Speed
        // cruise.mach and cruise.height
        let cruisingSpeedKph = 0;
        if (yml.cruise?.mach && yml.cruise?.height) {
            // Calculate TAS
            // ISA Temp at Altitude (h in meters)
            // T = T0 - L * h (Troposphere)
            // h < 11000m
            const h = yml.cruise.height; // meters
            const mach = yml.cruise.mach;

            // Standard Atmosphere
            const T0 = 288.15; // K
            const L = 0.0065; // K/m
            let T = T0 - L * h;
            if (h > 11000) T = 216.65; // Stratosphere constant

            // Speed of sound a = sqrt(gamma * R * T)
            // gamma = 1.4, R = 287.05
            const a = Math.sqrt(1.4 * 287.05 * T); // m/s
            const tasMs = mach * a;
            cruisingSpeedKph = Math.round(tasMs * 3.6);
        } else if (yml.cruise?.speed) {
            // Direct speed in m/s?
            cruisingSpeedKph = Math.round(yml.cruise.speed * 3.6);
        } else if (yml.vmo) {
            // Fallback to VMO * 0.8?
            cruisingSpeedKph = Math.round((yml.vmo * 3.6) * 0.8);
        }

        if (!cruisingSpeedKph) return;

        // Manufacturer/Model Parsing
        let rawName = (yml.aircraft || maps.icaoToName.get(icao) || icao).trim();
        let { manufacturer, model } = parseManModel(rawName);

        // 3. Enrichments
        const characteristics: any = {
            source: 'openap',
            specs: yml
        };

        // Fuel Model
        const fuelModel = maps.fuelModels.get(typeCode) || maps.fuelModels.get('default');
        if (fuelModel) {
            characteristics.fuel_model = fuelModel;
        }

        // Engines
        // Resolve engine options
        const engineOptionsStr = yml.engine?.options || {};
        const engineDefault = yml.engine?.default;

        let engineNames: string[] = [];
        if (typeof engineOptionsStr === 'object') {
            engineNames = Object.values(engineOptionsStr);
        } else if (Array.isArray(engineOptionsStr)) {
            engineNames = engineOptionsStr;
        }
        if (engineDefault && !engineNames.includes(engineDefault)) engineNames.push(engineDefault);

        // Map to full specs
        const enginesArr = engineNames.map(name => {
            const spec = maps.engines.get(name);
            return spec ? spec : { name: name, missing: true };
        });

        characteristics.engines = enginesArr;

        // Wikidata (Best Effort)
        // Check if we have an image
        let imageId = null;
        try {
            const wikiData = await fetchWikidata(manufacturer, model);
            if (wikiData) {
                characteristics.wikidata = wikiData;
                if (wikiData.imageUrl) {
                    // Try to upload
                    // Rate limit protection/check if already exists? 
                    // For now, simple upload if new
                    const uploaded = await uploadImageFromUrl(wikiData.imageUrl, `${icao}_${manufacturer}_${model}`);
                    if (uploaded) imageId = uploaded.id;
                }
            }
        } catch (e) {
            // Ignore wiki errors
        }

        // 4. Upsert
        const iata = maps.icaoToIata.get(icao) || null;

        await aircraftTypeRepo.upsertAircraftType({
            icao,
            iata,
            displayName: rawName,
            manufacturer,
            model,
            seatCapacity,
            rangeKm,
            cruisingSpeedKph,
            imageId,
            characteristics
        });
    }
};

// --- Helpers ---

function parseManModel(raw: string): { manufacturer: string, model: string } {
    // Basic Heuristic
    const parts = raw.split(' ');
    let manufacturer = parts[0];
    let model = parts.slice(1).join(' ');

    // Overrides


    // Check if raw starts with any known multi-word
    // Actually McDonnell Douglas is the main culprit for splitting.
    if (raw.startsWith('McDonnell Douglas')) {
        manufacturer = 'McDonnell Douglas';
        model = raw.substring('McDonnell Douglas'.length).trim();
    } else if (raw.startsWith('De Havilland')) {
        manufacturer = 'De Havilland';
        model = raw.substring('De Havilland'.length).trim();
    }

    // Fallback if model is empty (e.g. raw was just "Concorde")
    if (!model) {
        model = raw;
        manufacturer = 'Unknown';
    }

    return { manufacturer, model };
}

async function fetchWikidata(man: string, model: string) {
    const queries = [
        `${man} ${model} aircraft`,
        `${model} aircraft`,
        `${man} ${model}`
    ];

    for (const query of queries) {
        try {
            const url = `https://www.wikidata.org/w/api.php?action=wbsearchentities&search=${encodeURIComponent(query)}&language=en&format=json&limit=1`;
            const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
            const data = await res.json();

            if (data.search && data.search.length > 0) {
                const qid = data.search[0].id;
                const details = await fetchWikidataDetails(qid);
                if (details) return details;
            }
        } catch (e) {
            console.error(`Wikidata search failed for query "${query}":`, e);
        }
    }

    return null;
}

async function fetchWikidataDetails(qid: string) {
    try {
        const url = `https://www.wikidata.org/wiki/Special:EntityData/${qid}.json`;
        const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
        const data = await res.json();
        const entity = data.entities[qid];

        let imageUrl = null;
        if (entity.claims && entity.claims.P18) {
            const title = entity.claims.P18[0].mainsnak.datavalue.value;
            // Convert file title to URL via Commons API
            const imgApi = `https://commons.wikimedia.org/w/api.php?action=query&titles=File:${encodeURIComponent(title)}&prop=imageinfo&iiprop=url&format=json`;
            const res3 = await fetch(imgApi, { headers: { 'User-Agent': USER_AGENT } });
            const data3 = await res3.json() as any;
            const pages = data3.query.pages;
            const pageId = Object.keys(pages)[0];
            if (pageId !== "-1" && pages[pageId].imageinfo) {
                imageUrl = pages[pageId].imageinfo[0].url;
            }
        }

        return { qid, imageUrl };
    } catch (e) {
        console.error(`Failed to fetch Wikidata details for ${qid}:`, e);
        return null;
    }
}

async function uploadImageFromUrl(url: string, baseName: string) {
    try {
        const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
        if (!res.ok) return null;
        const arrayBuf = await res.arrayBuffer();
        const buffer = Buffer.from(arrayBuf);

        // Get extension
        let ext = 'jpg';
        const ct = res.headers.get('content-type');
        if (ct === 'image/png') ext = 'png';
        else if (ct === 'image/jpeg') ext = 'jpg';

        return await uploadRepo.create({
            buffer,
            originalName: `${baseName}.${ext}`,
            mimeType: ct || 'image/jpeg'
        });
    } catch (e) {
        return null;
    }
}
