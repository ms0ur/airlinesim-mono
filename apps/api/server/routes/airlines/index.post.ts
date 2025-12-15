import {airror, Airror, withAirror} from "@airlinesim/airror";
import {airlineRepo} from "../../repo/airlineRepo";
import {AirlineCreate} from "@airlinesim/db/zod";
import {validateAuth} from "../../utils/auth.utils";

export default defineEventHandler(withAirror(async (event) => {
    const token = getCookie(event, 'auth-token')
    let ownerId: string | undefined

    if (token) {
        const payload = await validateAuth(token)
        if (payload) {
            ownerId = payload.sub
        }
    }

    const body = await readValidatedBody(event, AirlineCreate.parse);
    let created;
    try {
        created = await airlineRepo.create({ ...body, ownerId });
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