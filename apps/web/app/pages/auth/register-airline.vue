<script setup lang="ts">
interface AircraftType {
  id: string
  displayName: string
  manufacturer: string
  model: string
  seatCapacity: number
  rangeKm: number
  cruisingSpeedKph: number
}

interface Airport {
  id: string
  iata: string
  icao: string
  name: string
}

const { registerAirline, fetchUser } = useAuth()
const router = useRouter()
const config = useRuntimeConfig()
const apiBase = config.public.apiBase || 'http://localhost:3001'

const airlineName = ref('')
const airlineCode = ref('')
const selectedAirport = ref('')
const selectedAircraft = ref<string | null>(null)
const gameMode = ref('easy')
const isLoading = ref(false)
const error = ref('')

const aircraftTypes = ref<AircraftType[]>([])
const airports = ref<Airport[]>([])
const airportSearch = ref('')
const isSearchingAirports = ref(false)
const ignoreSearch = ref(false)

const gameModeOptions = [
  { value: 'easy', label: 'Easy mode' },
  { value: 'hard', label: 'Hard mode' }
]

const fetchAircraftTypes = async () => {
  try {
    const response = await $fetch<{ data: AircraftType[]; total: number }>(`${apiBase}/aircraft-types`, {
      params: { mode: 'all', limit: 10 }
    })
    if (response?.data) {
      aircraftTypes.value = response.data
    }
  } catch (e) {
    console.error('Failed to fetch aircraft types:', e)
  }
}

const searchAirports = async (query: string) => {
  if (query.length < 2) {
    airports.value = []
    return
  }
  isSearchingAirports.value = true
  try {
    const response = await $fetch<{ data: Airport[]; total: number }>(`${apiBase}/airports`, {
      params: { mode: 'text', text: query, limit: 10 }
    })
    if (response?.data) {
      airports.value = response.data
    }
  } catch (e) {
    console.error('Failed to search airports:', e)
  } finally {
    isSearchingAirports.value = false
  }
}

let searchTimeout: ReturnType<typeof setTimeout> | null = null

watch(airportSearch, (value) => {
  if (ignoreSearch.value) {
    ignoreSearch.value = false
    return
  }
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }
  searchTimeout = setTimeout(() => {
    searchAirports(value)
  }, 300)
})

const selectAirport = (airport: Airport) => {
  selectedAirport.value = airport.id
  ignoreSearch.value = true
  airportSearch.value = `${airport.iata} - ${airport.name}`
  airports.value = []
}

const handleSubmit = async () => {
  if (!airlineName.value || !airlineCode.value || !selectedAirport.value) {
    error.value = 'Please fill in all required fields'
    return
  }

  if (airlineCode.value.length !== 3) {
    error.value = 'Airline code must be exactly 3 characters'
    return
  }

  isLoading.value = true
  error.value = ''

  const iata = airlineCode.value.substring(0, 2).toUpperCase()
  const icao = airlineCode.value.toUpperCase()

  const success = await registerAirline({
    name: airlineName.value,
    iata,
    icao,
    baseAirportId: selectedAirport.value,
    startingAircraftTypeId: selectedAircraft.value || undefined
  })

  if (success) {
    await fetchUser()
    router.push('/')
  } else {
    error.value = 'Failed to create airline. Code may already be in use.'
  }

  isLoading.value = false
}

onMounted(async () => {
  //TODO activate
  // if (!isAuthenticated.value) {
  //   router.push('/auth/login')
  //   return
  // }
  await fetchAircraftTypes()
})
</script>

<template>
  <div class="min-h-screen bg-background flex items-center justify-center p-4 py-12">
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div class="absolute -left-32 top-1/2 -translate-y-1/2 w-[600px] h-[600px] opacity-20">
        <img src="/globe-bg.svg" alt="" class="w-full h-full object-contain" />
      </div>
    </div>

    <div class="relative z-10 w-full max-w-3xl">
      <h1 class="text-h1 text-text-primary text-center mb-12">Create your airline</h1>

      <form @submit.prevent="handleSubmit" class="space-y-6">
        <UiInput
          v-model="airlineName"
          type="text"
          placeholder="Airline name"
          :disabled="isLoading"
        />

        <UiInput
          v-model="airlineCode"
          type="text"
          placeholder="Airline code"
          :disabled="isLoading"
        />

        <div class="relative">
          <UiInput
            v-model="airportSearch"
            type="text"
            placeholder="Starting airport"
            :disabled="isLoading"
          />
          <div
            v-if="airports.length > 0"
            class="absolute top-full left-0 right-0 mt-2 bg-surface border border-border rounded-xl shadow-lg z-20 max-h-60 overflow-y-auto"
          >
            <button
              v-for="airport in airports"
              :key="airport.id"
              type="button"
              @click="selectAirport(airport)"
              class="w-full px-6 py-3 text-left text-body text-text-primary hover:bg-surface-subtle transition-colors border-b border-border last:border-b-0"
            >
              <span class="font-bold">{{ airport.iata }}</span> - {{ airport.name }}
            </button>
          </div>
        </div>

        <div v-if="aircraftTypes.length > 0" class="space-y-4">
          <h2 class="text-h4 text-text-primary">Select starting aircraft</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <UiAircraftCard
              v-for="aircraft in aircraftTypes.slice(0, 4)"
              :key="aircraft.id"
              :aircraft="aircraft"
              :selected="selectedAircraft === aircraft.id"
              @select="selectedAircraft = aircraft.id"
            />
          </div>
        </div>

        <UiToggleButtons
          v-model="gameMode"
          :options="gameModeOptions"
        />

        <p v-if="error" class="text-error text-body text-center">{{ error }}</p>

        <UiButton
          type="submit"
          :disabled="isLoading"
          class="w-full"
        >
          {{ isLoading ? 'Creating...' : 'Log in' }}
        </UiButton>
      </form>
    </div>
  </div>
</template>

