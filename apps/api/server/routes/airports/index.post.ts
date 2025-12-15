import { readValidatedBody, setResponseStatus, createError } from 'h3'
import { airportRepo } from '../../repo/airportRepo'
import { AirportCreate } from '@airlinesim/db/zod'

export default defineEventHandler(async (event) => {
    const body = await readValidatedBody(event, AirportCreate.parse)

    try {
        const created = await airportRepo.create(body)
        setResponseStatus(event, 201)
        return { data: created }
    } catch (e: any) {

        if (e?.code === '23505' || /уже существует/i.test(String(e?.message))) {
            throw createError({ statusCode: 409, statusMessage: 'Аэропорт с таким IATA/ICAO уже существует' })
        }
        throw createError({ statusCode: 500, statusMessage: 'Internal Server Error', data: e })
    }
})