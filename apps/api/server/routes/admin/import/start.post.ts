import { importService } from "../../../utils/importService";

export default defineEventHandler(async (event) => {
    const query = getQuery(event);
    const clearAll = query.clearAll === 'true';

    await importService.startImport(clearAll);

    return { success: true, message: "Import started in background" };
});
