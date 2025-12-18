<script setup lang="ts">
import type { GlobeAirport, GlobeRoute } from '~/components/globe/types'
import Globe from '~/components/globe/Globe.vue'
import Button from '~/components/ui/Button.vue'
import DashboardHeader from '~/components/dashboard/DashboardHeader.vue'
import DashboardSidebar from '~/components/dashboard/DashboardSidebar.vue'
import LatestNews from '~/components/dashboard/LatestNews.vue'
import FuelPrice from '~/components/dashboard/FuelPrice.vue'
import LogsPanel from '~/components/dashboard/LogsPanel.vue'
import MapControls from '~/components/dashboard/MapControls.vue'

interface AirportResponse {
  id: string
  iata: string
  icao: string
  name: string
  lat: number
  lon: number
  timezone: string
}

const { isAuthenticated, airline, fetchUser, isLoading } = useAuth()
const config = useRuntimeConfig()
const apiBase = config.public.apiBase || 'http://localhost:3001'

const aircraftCount = ref(0)
const baseAirport = ref<AirportResponse | null>(null)
const mapProjection = ref<'globe' | 'mercator'>('globe')
const globeRef = ref<InstanceType<typeof Globe> | null>(null)
const sidebarsCollapsed = ref(false)

const fetchAircraftCount = async () => {
  if (!airline.value) return
  try {
    const response = await $fetch<{ data: any[]; total: number }>(`${apiBase}/airlines/${airline.value.id}/aircraft`, {
      credentials: 'include'
    })
    aircraftCount.value = response?.data?.length || 0
  } catch {
    aircraftCount.value = 0
  }
}

const fetchBaseAirport = async () => {
  if (!airline.value?.baseAirportId) return
  try {
    const response = await $fetch<{ data: AirportResponse }>(`${apiBase}/airports/${airline.value.baseAirportId}`, {
      credentials: 'include'
    })
    baseAirport.value = response.data
  } catch {
    baseAirport.value = null
  }
}

const dashboardAirports = computed<GlobeAirport[]>(() => {
  if (!baseAirport.value) return []
  return [{
    id: baseAirport.value.id,
    name: baseAirport.value.name,
    iata: baseAirport.value.iata,
    coords: [baseAirport.value.lon, baseAirport.value.lat],
    isHub: true,
    timezone: baseAirport.value.timezone,
    icao: baseAirport.value.icao
  }]
})

const dashboardCenter = computed<[number, number]>(() => {
  if (baseAirport.value) {
    return [baseAirport.value.lon, baseAirport.value.lat]
  }
  return [30, 30]
})

const demoAirports: GlobeAirport[] = [
  { id: '1', name: 'London Heathrow', iata: 'LHR', coords: [-0.45, 51.47] },
  { id: '2', name: 'Dubai International', iata: 'DXB', coords: [55.36, 25.25] },
  { id: '3', name: 'Johannesburg', iata: 'JNB', coords: [28.24, -26.13] },
  { id: '4', name: 'New York JFK', iata: 'JFK', coords: [-73.77, 40.64] },
  { id: '5', name: 'São Paulo GRU', iata: 'GRU', coords: [-46.47, -23.43] },
  { id: '6', name: 'Sydney', iata: 'SYD', coords: [151.17, -33.94] },
  { id: '7', name: 'Tokyo Haneda', iata: 'HND', coords: [139.78, 35.55] },
  { id: '8', name: 'Singapore Changi', iata: 'SIN', coords: [103.99, 1.36] },
  { id: '9', name: 'Frankfurt', iata: 'FRA', coords: [8.57, 50.03] },
  { id: '10', name: 'Los Angeles', iata: 'LAX', coords: [-118.40, 33.94] },
]

const demoRoutes: GlobeRoute[] = []
for (let i = 0; i < demoAirports.length; i++) {
  for (let j = i + 1; j < demoAirports.length; j++) {
    const from = demoAirports[i]
    const to = demoAirports[j]
    if (from && to) {
      demoRoutes.push({
        id: `${i + 1}-${j + 1}`,
        from,
        to,
        distanceKm: undefined
      })
    }
  }
}

const handleProjectionChange = (projection: 'globe' | 'mercator') => {
  mapProjection.value = projection
  globeRef.value?.setProjection(projection)
}

const handleZoomIn = () => {
  globeRef.value?.zoomIn()
}

const handleZoomOut = () => {
  globeRef.value?.zoomOut()
}

const handleAirportClick = (airport: GlobeAirport) => {
  console.log('Airport clicked:', airport)
}

const toggleSidebars = () => {
  sidebarsCollapsed.value = !sidebarsCollapsed.value
}

onMounted(async () => {
  await fetchUser()
  if (airline.value) {
    await Promise.all([fetchAircraftCount(), fetchBaseAirport()])
  }
})

watch(airline, async (newAirline) => {
  if (newAirline) {
    await Promise.all([fetchAircraftCount(), fetchBaseAirport()])
  }
})
</script>

<template>
  <div v-if="isLoading" class="min-h-screen bg-background flex items-center justify-center">
    <span class="text-text-muted text-subtitle">Loading...</span>
  </div>

  <div v-else-if="isAuthenticated && airline" class="flex flex-col h-screen bg-background overflow-hidden">
    <DashboardHeader
      :airline="airline"
      :aircraft-count="aircraftCount"
      @toggle-sidebars="toggleSidebars"
    />

    <div class="flex flex-1 overflow-hidden">
      <DashboardSidebar
        v-show="!sidebarsCollapsed"
        class="transition-all duration-300"
      />

      <main class="flex-1 flex overflow-hidden">
        <div class="flex-1 relative flex flex-col">

          <div class="flex-1 relative">
            <ClientOnly>
              <Globe
                ref="globeRef"
                :airports="dashboardAirports"
                :routes="[]"
                :interactive="true"
                :auto-rotate="false"
                :center="dashboardCenter"
                :zoom="3"
                :pitch="0"
                :projection="mapProjection"
                @airport-click="handleAirportClick"
              />
              <template #fallback>
                <div class="w-full h-full flex items-center justify-center bg-background">
                  <span class="text-text-muted">Loading globe...</span>
                </div>
              </template>
            </ClientOnly>

            <div class="absolute bottom-4 right-4">
              <MapControls
                :projection="mapProjection"
                @projection-change="handleProjectionChange"
                @zoom-in="handleZoomIn"
                @zoom-out="handleZoomOut"
              />
            </div>
          </div>

          <div class="p-4">
            <LogsPanel />
          </div>
        </div>

        <div
          v-show="!sidebarsCollapsed"
          class="w-80 border-l border-border bg-background p-4 space-y-4 overflow-y-auto transition-all duration-300"
        >
          <LatestNews />
          <FuelPrice />
        </div>
      </main>
    </div>
  </div>

  <div v-else class="flex flex-col lg:block w-full h-screen overflow-hidden bg-background relative">
    <div class="relative w-full h-[60vh] lg:absolute lg:top-[40%] lg:-translate-y-1/2 lg:-left-[35%] lg:w-[100%] lg:h-[160%] z-0">
      <ClientOnly>
        <Globe
          :airports="demoAirports"
          :routes="demoRoutes"
          :interactive="false"
          :auto-rotate="true"
          :rotate-speed="0.05"
          :center="[30, 15]"
          :zoom="2.8"
          :pitch="20"
          :padding="{ top: 0, bottom: 0, left: 0, right: 0 }"
          projection="globe"
        />
        <template #fallback>
          <div class="w-full h-full flex items-center justify-center bg-background">
            <span class="text-text-muted">Loading globe...</span>
          </div>
        </template>
      </ClientOnly>
    </div>

    <div class="relative z-10 flex flex-col justify-center items-center lg:items-start p-8 lg:p-12 w-full lg:w-1/2 lg:ml-auto h-full text-center lg:text-left">
      <h1 class="text-h1 text-text-primary mb-3">
        Build your own network
      </h1>
      <p class="text-subtitle text-text-primary mb-8">
        For free. Forever.
      </p>
      <NuxtLink to="/auth/login" class="no-underline">
        <Button variant="primary" size="md">
          Log in
        </Button>
      </NuxtLink>
    </div>
  </div>
</template>
