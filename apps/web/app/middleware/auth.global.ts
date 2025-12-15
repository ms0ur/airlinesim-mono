export default defineNuxtRouteMiddleware(async (to) => {
  if (import.meta.dev) return //

  const { isAuthenticated, airline, fetchUser, isLoading } = useAuth()

  //TODO middleware disabled
  if (true) return

  if (isLoading.value) {
    await fetchUser()
  }

  const publicRoutes = ['/auth/login', '/auth/register']
  const airlineSetupRoute = '/auth/register-airline'

  if (publicRoutes.includes(to.path)) {
    if (isAuthenticated.value) {
      if (!airline.value) {
        return navigateTo(airlineSetupRoute)
      }
      return navigateTo('/')
    }
    return
  }

  if (to.path === airlineSetupRoute) {
    if (!isAuthenticated.value) {
      return navigateTo('/auth/login')
    }
    return
  }
})
