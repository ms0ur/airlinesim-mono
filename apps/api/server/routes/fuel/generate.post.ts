import { withAirror } from "@airlinesim/airror";
import { fuelPriceRepo } from "../../repo/fuelPriceRepo";

export default defineEventHandler(withAirror(async () => {
    return await fuelPriceRepo.forceGenerateNewPrice();
}));

