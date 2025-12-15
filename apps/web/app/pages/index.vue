<script setup lang="ts">
import type { GlobeAirport, GlobeRoute } from '~/components/globe/types'
import Globe from '~/components/globe/Globe.vue'
import Button from '~/components/ui/Button.vue'

const demoAirports: GlobeAirport[] = [
  { id: '1', name: 'London Heathrow', iata: 'LHR', coords: [-0.45, 51.47], pax: '80M/yr' }, // Европа
  { id: '2', name: 'Dubai International', iata: 'DXB', coords: [55.36, 25.25], pax: '89M/yr' }, // Азия/Ближний Восток
  { id: '3', name: 'Johannesburg', iata: 'JNB', coords: [28.24, -26.13], pax: '21M/yr' }, // Африка
  { id: '4', name: 'New York JFK', iata: 'JFK', coords: [-73.77, 40.64], pax: '62M/yr' }, // Северная Америка
  { id: '5', name: 'São Paulo GRU', iata: 'GRU', coords: [-46.47, -23.43], pax: '43M/yr' }, // Южная Америка
  { id: '6', name: 'Sydney', iata: 'SYD', coords: [151.17, -33.94], pax: '44M/yr' }, // Австралия
  { id: '7', name: 'Tokyo Haneda', iata: 'HND', coords: [139.78, 35.55], pax: '85M/yr' }, // Азия
  { id: '8', name: 'Singapore Changi', iata: 'SIN', coords: [103.99, 1.36], pax: '68M/yr' }, // Азия/Океания
  { id: '9', name: 'Frankfurt', iata: 'FRA', coords: [8.57, 50.03], pax: '70M/yr' }, // Европа
  { id: '10', name: 'Los Angeles', iata: 'LAX', coords: [-118.40, 33.94], pax: '88M/yr' }, // Северная Америка
]

// Автоматически сгенерируем маршруты между всеми аэропортами (для наглядности)
const demoRoutes: GlobeRoute[] = []
for (let i = 0; i < demoAirports.length; i++) {
  for (let j = i + 1; j < demoAirports.length; j++) {
    demoRoutes.push({
      id: `${i + 1}-${j + 1}`,
      from: demoAirports[i],
      to: demoAirports[j],
      distanceKm: undefined
    })
  }
}
</script>

<template>
  <div class="flex flex-col lg:block w-full h-screen overflow-hidden bg-background relative">
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
