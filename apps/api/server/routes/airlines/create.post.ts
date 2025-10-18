import {airror, Airror, withAirror} from "@airlinesim/airror";
import {airlineRepo} from "../../repo/airlineRepo";
import {AirlineCreate} from "@airlinesim/db/zod";

export default defineEventHandler(withAirror(async (event) => {
    const body = await readValidatedBody(event, AirlineCreate.parse);
    let created;
    try {
        created = await airlineRepo.create(body);
    } catch (e) {
        if (e instanceof Airror) {
            throw e
        } else {
            throw airror("INTERNAL_ERROR", {cause: e} );
        }
    }
    setResponseStatus(event, 201);
    return {data: created};
}))