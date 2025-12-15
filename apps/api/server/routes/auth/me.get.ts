import { validateAuth } from "../../utils/auth.utils"
import { UserRepo } from "../../repo/userRepo"
import { airlineRepo } from "../../repo/airlineRepo"

export default defineEventHandler(async (event) => {
    const token = getCookie(event, 'auth-token')

    if (!token) {
        setResponseStatus(event, 401, 'Unauthorized')
        return { user: null, airline: null }
    }

    const payload = await validateAuth(token)

    if (!payload) {
        setResponseStatus(event, 401, 'Invalid token')
        return { user: null, airline: null }
    }

    const user = await UserRepo.findById(payload.sub)

    if (!user) {
        setResponseStatus(event, 404, 'User not found')
        return { user: null, airline: null }
    }

    const airline = await airlineRepo.findByOwnerId(payload.sub)

    return {
        user,
        airline
    }
})
