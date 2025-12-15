import { withAirror } from "@airlinesim/airror";
import { fuelPriceRepo } from "../../repo/fuelPriceRepo";

export default defineEventHandler(withAirror(async () => {
    const history = await fuelPriceRepo.getHistory(24);
    return history;
}));

