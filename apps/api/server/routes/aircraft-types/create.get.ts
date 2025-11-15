import { aircraftTypeRepo } from '../../repo/aircraftTypesRepo';
import { AircraftTypeCreate } from '@airlinesim/db/zod';

export default defineEventHandler(async (event) => {
    const body = await readValidatedBody(event, AircraftTypeCreate.parse);

    try {
        const created = await aircraftTypeRepo.createType(body);
        setResponseStatus(event, 201);
        return { data: created };
    } catch (error) {
        console.error(error);
        setResponseStatus(event, 500);
        return { error };
    }
});
