<script setup lang="ts">
import type { GlobeAirport, GlobeRoute } from '~/components/globe/types'
import Globe from '~/components/globe/Globe.vue'
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

const { airline } = useAuth()
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

/**
 * Calculate padding for the globe to keep it centered in the "free" space.
 * The right panel is 320px (w-80) and the bottom panel is roughly 200px.
 */
const globePadding = computed(() => {
  return {
    top: 40,
    bottom: 240, // Account for logs panel (roughly 200px) + some buffer
    left: 20,
    right: sidebarsCollapsed.value ? 340 : 340 // Account for right panel (320px) + some buffer
  }
})

// Actually, if they are floating, they are just over the globe.
// If sidebarsCollapsed is false, we have Sidebar on the left.
// Right panel is on the right.
// Logs are at the bottom.

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
  <div v-if="airline" class="flex flex-col h-screen bg-background overflow-hidden">
    <DashboardHeader
      :airline="airline"
      :aircraft-count="aircraftCount"
      @toggle-sidebars="toggleSidebars"
    />

    <div class="flex flex-1 overflow-hidden relative">
      <!-- Sidebar -->
      <DashboardSidebar
        v-show="!sidebarsCollapsed"
        class="transition-all duration-300 z-20"
      />

      <!-- Main content area (Globe) -->
      <main class="flex-1 relative overflow-hidden bg-background">
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
            :padding="globePadding"
            @airport-click="handleAirportClick"
          />
          <template #fallback>
            <div class="w-full h-full flex items-center justify-center bg-background">
              <span class="text-text-muted">Loading globe...</span>
            </div>
          </template>
        </ClientOnly>

        <!-- Floating Map Controls -->
        <div class="absolute top-4 left-4 z-30">
          <MapControls
            :projection="mapProjection"
            @projection-change="handleProjectionChange"
            @zoom-in="handleZoomIn"
            @zoom-out="handleZoomOut"
          />
        </div>

        <!-- Floating Logs Panel -->
        <div class="absolute bottom-4 right-[340px] left-4 z-20 pointer-events-none">
          <div class="pointer-events-auto">
            <LogsPanel class="bg-background/10 backdrop-blur-lg rounded-xl border border-white/5 shadow-2xl" />
          </div>
        </div>
      </main>

      <!-- Floating Right Panel -->
      <div
        v-show="!sidebarsCollapsed"
        class="absolute top-4 right-4 bottom-4 w-80 z-20 flex flex-col space-y-4 overflow-y-auto pointer-events-none"
      >
        <div class="pointer-events-auto space-y-4">
          <LatestNews class="bg-background/10 backdrop-blur-lg rounded-xl border border-white/5 p-4 shadow-2xl" />
          <FuelPrice class="bg-background/10 backdrop-blur-lg rounded-xl border border-white/5 p-4 shadow-2xl" />
        </div>
      </div>
    </div>
  </div>
</template>
