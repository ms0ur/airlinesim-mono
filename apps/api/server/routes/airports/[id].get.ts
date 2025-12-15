import { withAirror, airror } from "@airlinesim/airror";
import { airportRepo } from "../../repo/airportRepo";
import { z } from 'zod';

const ParamsSchema = z.object({
    id: z.string().uuid(),
});

export default defineEventHandler(withAirror(async (event) => {
    const params = await getValidatedRouterParams(event, ParamsSchema.parse);
    const airport = await airportRepo.findById(params.id);

    if (!airport) {
        throw airror("NOT_FOUND");
    }

    return { data: airport };
}));

