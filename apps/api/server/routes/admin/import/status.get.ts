import { importService } from "../../../utils/importService";

export default defineEventHandler(async () => {
    return importService.getStatus();
});
