import { importService } from "../../../utils/importService";
import { aircraftTypeImportService } from "../../../utils/aircraftTypeImportService";

export default defineEventHandler(async (event) => {
    const query = getQuery(event);
    const dataset = query.dataset || 'airports';

    if (dataset === 'aircraft-types') {
        return aircraftTypeImportService.getStatus();
    }

    return importService.getStatus();
});
