import { UserRepo } from '../../repo/userRepo'
import { userCreate } from '@airlinesim/db/zod'

export default defineEventHandler(async (event) => {
    const body = await readValidatedBody(event, userCreate.parse)

    try {
        const created = await UserRepo.create(body)
        setResponseStatus(event, 201)
        return { data: created }
    } catch (error) {
        console.error(error)
        setResponseStatus(event, 500)
        return { error: error }
    }
})
