<script setup lang="ts">
import type { Airline } from '~/composables/useAuth'

interface Props {
  airline: Airline
  aircraftCount: number
}

defineProps<Props>()

const emit = defineEmits<{
  toggleSidebars: []
}>()

const currentTime = ref('')
const currentDate = ref('')

const formatNumber = (num: number): string => {
  return num.toLocaleString('en-US')
}

const formatBalance = (balance: number): string => {
  if (balance >= 1000000) {
    return `${(balance / 1000000).toFixed(0)}M$`
  }
  return `${formatNumber(balance)}$`
}

const updateTime = () => {
  const now = new Date()
  currentTime.value = now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'UTC'
  })
  currentDate.value = now.toLocaleDateString('en-US', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'UTC'
  }).replace(/\//g, '.')
}

onMounted(() => {
  updateTime()
  const interval = setInterval(updateTime, 1000)
  onUnmounted(() => clearInterval(interval))
})
</script>

<template>
  <header class="h-16 bg-surface border-b border-border px-6 flex items-center justify-between">
    <div class="flex items-center gap-4">
      <h1 class="text-h3 text-text-primary">{{ airline.name }}</h1>
      <button
        class="p-2 hover:bg-surface-subtle rounded-lg transition-colors"
        @click="emit('toggleSidebars')"
      >
        <Icon name="heroicons:bars-3" class="w-6 h-6 text-text-muted" />
      </button>
    </div>

    <div class="flex items-center gap-8">
      <div class="flex items-center gap-2">
        <Icon name="heroicons:currency-dollar" class="w-5 h-5 text-text-muted" />
        <span class="text-subtitle text-text-primary">Account</span>
        <span class="text-subtitle text-text-primary font-bold">{{ formatBalance(airline.balance) }}</span>
      </div>

      <div class="flex items-center gap-2">
        <Icon name="heroicons:fire" class="w-5 h-5 text-text-muted" />
        <span class="text-subtitle text-text-primary">Fuel</span>
        <span class="text-subtitle text-text-primary font-bold">{{ formatNumber(airline.fuelTons) }} tons</span>
      </div>

      <div class="flex items-center gap-2">
        <Icon name="heroicons:paper-airplane" class="w-5 h-5 text-text-muted" />
        <span class="text-subtitle text-text-primary">Planes</span>
        <span class="text-subtitle text-text-primary font-bold">{{ aircraftCount }}</span>
      </div>
    </div>

    <div class="flex items-center gap-4">
      <span class="text-body text-text-muted">{{ currentTime }} UTC | {{ currentDate }}</span>
      <button class="p-2 hover:bg-surface-subtle rounded-lg transition-colors">
        <Icon name="heroicons:user-circle" class="w-6 h-6 text-text-muted" />
      </button>
    </div>
  </header>
</template>

