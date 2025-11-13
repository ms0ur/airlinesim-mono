import { UserRepo } from '../../repo/userRepo'

export default defineEventHandler(async (event) => {
    const body = await readBody(event)

    try {
        const user = UserRepo.find(body.string, Number(body.limit), Number(body.offset))
        if (!user) {
            setResponseStatus(event, 404, 'User Not Found')
            return
        }
        setResponseStatus(event, 200, '')
        return { data: user }

    } catch (err) {
        console.error(err)
        setResponseStatus(event, 500, '')
        return { data: undefined, error: err }
    }
})