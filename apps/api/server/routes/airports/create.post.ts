import {AirportCreate} from "~~/packages/db/src/zod";
import {z} from "zod";
import {airportRepo} from "server/repo/airportRepo";

export default defineEventHandler(async (event) => {
    const body = await readBody(event)

    const data = body.data as z.infer<typeof AirportCreate>

    const created = await airportRepo.create(data)

})