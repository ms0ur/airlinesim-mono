// server/api/airports.post.ts
import { z } from 'zod'
import { readValidatedBody, setResponseStatus, createError } from 'h3'
import { airportRepo } from '../../repo/airportRepo'
import { AirportCreate } from '@airlinesim/db/zod'
const BodySchema = z.object({ data: AirportCreate })

defineRouteMeta({
    openAPI: {
        tags: ['Airports'],
        operationId: 'CreateAirport',
        summary: 'Создать аэропорт',
        description: 'Создаёт аэропорт и возвращает публичное представление.',
        requestBody: {
            required: true,
            content: {
                'application/json': {
                    schema: { $ref: '#/components/schemas/AirportCreate' }
                }
            }
        },
        responses: {
            201: {
                description: 'Создано',
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            required: ['data'],
                            properties: { data: { $ref: '#/components/schemas/AirportPublic' } }
                        }
                    }
                }
            },
            400: {
                description: 'Ошибка валидации',
                content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } }
            },
            409: {
                description: 'Конфликт IATA/ICAO',
                content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } }
            },
            500: {
                description: 'Внутренняя ошибка',
                content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } }
            }
        }
    }
})

export default defineEventHandler(async (event) => {
    // Runtime-валидация (H3 util + Zod)
    const { data } = await readValidatedBody(event, BodySchema.parse)

    try {
        const created = await airportRepo.create(data)
        setResponseStatus(event, 201)
        return { data: created }
    } catch (e: any) {
        if (e?.code === '23505' || /уже существует/i.test(String(e?.message))) {
            throw createError({ statusCode: 409, statusMessage: 'Аэропорт с таким IATA/ICAO уже существует' })
        }
        throw createError({ statusCode: 500, statusMessage: 'Internal Server Error' })
    }
})
