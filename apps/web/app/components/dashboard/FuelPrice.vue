<script setup lang="ts">
interface FuelPriceData {
  id: string
  pricePerTon: number
  recordedAt: string
}

interface FuelPriceResponse {
  data: FuelPriceData[]
  currentPrice: number
  nextUpdateAt: string
}

const fuelData = ref<FuelPriceResponse | null>(null)
const isLoading = ref(true)
const countdown = ref('')

const currentPrice = computed(() => fuelData.value?.currentPrice || 0)

const chartData = computed(() => {
  if (!fuelData.value?.data.length) return []
  return fuelData.value.data.slice(-12).map(d => ({
    time: new Date(d.recordedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
    price: d.pricePerTon
  }))
})

const chartPath = computed(() => {
  if (!chartData.value.length) return ''

  const width = 280
  const height = 80
  const padding = 10
  const prices = chartData.value.map(d => d.price)
  const minPrice = Math.min(...prices) - 10
  const maxPrice = Math.max(...prices) + 10

  if (maxPrice === minPrice) return ''

  const points = chartData.value.map((d, i) => {
    const x = padding + (i / Math.max(chartData.value.length - 1, 1)) * (width - padding * 2)
    const y = height - padding - ((d.price - minPrice) / (maxPrice - minPrice)) * (height - padding * 2)
    return `${x},${y}`
  })

  return `M ${points.join(' L ')}`
})

const displayedLabels = computed(() => {
  const data = chartData.value
  if (data.length <= 5) return data
  const step = Math.ceil(data.length / 5)
  return data.filter((_, i) => i % step === 0 || i === data.length - 1)
})

const fetchFuelPrices = async () => {
  try {
    const response = await $api<FuelPriceResponse>('/fuel', {
      credentials: 'include'
    })
    fuelData.value = response
  } catch (e) {
    console.error('Failed to fetch fuel prices:', e)
  } finally {
    isLoading.value = false
  }
}

const updateCountdown = () => {
  if (!fuelData.value?.nextUpdateAt) {
    countdown.value = ''
    return
  }

  const next = new Date(fuelData.value.nextUpdateAt).getTime()
  const now = Date.now()
  const diff = next - now

  if (diff <= 0) {
    countdown.value = 'Updating...'
    fetchFuelPrices()
    return
  }

  const minutes = Math.floor(diff / 60000)
  const seconds = Math.floor((diff % 60000) / 1000)
  countdown.value = `${minutes}:${seconds.toString().padStart(2, '0')}`
}

let countdownInterval: ReturnType<typeof setInterval> | null = null

onMounted(async () => {
  await fetchFuelPrices()
  updateCountdown()
  countdownInterval = setInterval(updateCountdown, 1000)
})

onUnmounted(() => {
  if (countdownInterval) {
    clearInterval(countdownInterval)
  }
})
</script>

<template>
  <div class="p-0">
    <div class="flex items-center justify-between mb-2">
      <h3 class="text-h4 text-text-primary">Fuel price</h3>
      <span v-if="countdown" class="text-caption text-text-muted">
        Update in {{ countdown }}
      </span>
    </div>

    <p class="text-subtitle text-primary font-bold mb-4">
      ${{ currentPrice }}/ton
    </p>

    <div v-if="isLoading" class="w-full h-24 flex items-center justify-center">
      <span class="text-text-muted text-caption">Loading...</span>
    </div>

    <div v-else-if="chartData.length" class="w-full h-24 relative">
      <svg class="w-full h-full" viewBox="0 0 280 80" preserveAspectRatio="none">
        <path
          :d="chartPath"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          class="text-primary"
        />
      </svg>

      <div class="absolute bottom-0 left-0 right-0 flex justify-between text-caption text-text-muted px-2">
        <span v-for="(point, index) in displayedLabels" :key="index">
          {{ point.time }}
        </span>
      </div>
    </div>

    <div v-else class="w-full h-24 flex items-center justify-center">
      <span class="text-text-muted text-caption">No data available</span>
    </div>

    <button class="mt-6 w-full py-3 bg-primary text-on-primary rounded-xl text-subtitle font-bold hover:brightness-110 transition-all">
      Fuel management
    </button>
  </div>
</template>

