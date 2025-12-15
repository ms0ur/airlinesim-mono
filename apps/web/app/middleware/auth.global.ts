export default defineNuxtRouteMiddleware(async (to) => {
  // Skip middleware in development for faster iteration
  // Remove this in production
  if (import.meta.dev) return

  const { isAuthenticated, airline, fetchUser, isLoading } = useAuth()

  // Fetch user if not already loaded
  if (isLoading.value) {
    await fetchUser()
  }

  const publicRoutes = ['/auth/login', '/auth/register', '/']
  const airlineSetupRoute = '/auth/register-airline'

  // Allow public routes
  if (publicRoutes.includes(to.path)) {
    // If authenticated and going to login/register, redirect appropriately
    if (to.path !== '/' && isAuthenticated.value) {
      if (!airline.value) {
        return navigateTo(airlineSetupRoute)
      }
      return navigateTo('/')
    }
    return
  }

  // Airline setup route
  if (to.path === airlineSetupRoute) {
    if (!isAuthenticated.value) {
      return navigateTo('/auth/login')
    }
    // If already has airline, redirect to dashboard
    if (airline.value) {
      return navigateTo('/')
    }
    return
  }

  // All other routes require authentication
  if (!isAuthenticated.value) {
    return navigateTo('/auth/login')
  }

  // All dashboard routes require an airline
  if (!airline.value) {
    return navigateTo(airlineSetupRoute)
  }
})
