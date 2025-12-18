import { importService } from "../../../utils/importService";
import { aircraftTypeImportService } from "../../../utils/aircraftTypeImportService";

export default defineEventHandler(async (event) => {
    // Try to read body for dataset param
    const body = await readBody(event).catch(() => ({}));
    const query = getQuery(event);

    // Support clearAll from body or query
    const clearAll = body?.clearAll === true || query.clearAll === 'true';
    const dataset = body?.dataset || query.dataset || 'airports';

    if (dataset === 'aircraft-types') {
        await aircraftTypeImportService.startImport(clearAll);
        return { success: true, message: "Aircraft Types import started in background" };
    } else {
        // Default to airports import
        await importService.startImport(clearAll);
        return { success: true, message: "Airport import started in background" };
    }
});
