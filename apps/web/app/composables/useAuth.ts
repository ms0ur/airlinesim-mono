export interface User {
  id: string
  username: string
  email: string
  createdAt: string
}

export interface Airline {
  id: string
  name: string
  iata: string
  icao: string
  baseAirportId: string
  ownerId: string | null
  balance: number
  fuelTons: number
  createdAt: string
}

export interface AuthState {
  user: User | null
  airline: Airline | null
  isAuthenticated: boolean
  isLoading: boolean
}

const state = reactive<AuthState>({
  user: null,
  airline: null,
  isAuthenticated: false,
  isLoading: true
})

export const useAuth = () => {

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await $api<boolean>('/auth/login', {
        method: 'POST',
        body: { email, password },
        credentials: 'include'
      })
      if (response) {
        await fetchUser()
        return true
      }
      return false
    } catch (error) {
      console.error('Login error:', error)
      return false
    }
  }

  const register = async (username: string, email: string, password: string): Promise<{ success: boolean; userId?: string }> => {
    try {
      const response = await $api<{ data: User }>('/users', {
        method: 'POST',
        body: { username, email, password }
      })
      if (response?.data) {
        return { success: true, userId: response.data.id }
      }
      return { success: false }
    } catch (error) {
      console.error('Register error:', error)
      return { success: false }
    }
  }

  const registerAirline = async (data: {
    name: string
    iata: string
    icao: string
    baseAirportId: string
    startingAircraftTypeId?: string
  }): Promise<boolean> => {
    try {
      const response = await $api<{ data: Airline }>('/airlines', {
        method: 'POST',
        body: data,
        credentials: 'include'
      })
      if (response?.data) {
        state.airline = response.data
        return true
      }
      return false
    } catch (error) {
      console.error('Register airline error:', error)
      return false
    }
  }

  const logout = async (): Promise<boolean> => {
    try {
      await $api('/auth/logout', {
        method: 'POST',
        credentials: 'include'
      })
      state.user = null
      state.airline = null
      state.isAuthenticated = false
      return true
    } catch (error) {
      console.error('Logout error:', error)
      return false
    }
  }

  const fetchUser = async () => {
    try {
      state.isLoading = true
      const response = await $api<{ user: User; airline: Airline | null }>('/auth/me', {
        credentials: 'include'
      })
      if (response?.user) {
        state.user = response.user
        state.airline = response.airline
        state.isAuthenticated = true
      }
    } catch {
      state.user = null
      state.airline = null
      state.isAuthenticated = false
    } finally {
      state.isLoading = false
    }
  }

  return {
    user: computed(() => state.user),
    airline: computed(() => state.airline),
    isAuthenticated: computed(() => state.isAuthenticated),
    isLoading: computed(() => state.isLoading),
    login,
    register,
    registerAirline,
    logout,
    fetchUser
  }
}

