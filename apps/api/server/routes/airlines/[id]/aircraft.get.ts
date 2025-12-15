import { withAirror } from "@airlinesim/airror";
import { aircraftRepo } from "../../../repo/aircraftRepo";
import { z } from 'zod';

const ParamsSchema = z.object({
    id: z.string().uuid(),
});

export default defineEventHandler(withAirror(async (event) => {
    const params = await getValidatedRouterParams(event, ParamsSchema.parse);
    const aircraft = await aircraftRepo.findByAirlineId(params.id);

    return {
        data: aircraft,
        total: aircraft.length
    };
}));

