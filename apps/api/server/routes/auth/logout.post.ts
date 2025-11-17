export default defineEventHandler(async (event) => {
    try {
        deleteCookie(event, 'auth-token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/',
        })

        setResponseStatus(event, 200, 'Logged out')
        return true
    } catch (e) {
        setResponseStatus(event, 500, 'Server Error')
        return false
    }
})
