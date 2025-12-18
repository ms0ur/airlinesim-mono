<script setup lang="ts">
interface AircraftType {
  id: string
  displayName: string
  manufacturer: string
  model: string
  seatCapacity: number
  rangeKm: number
  cruisingSpeedKph: number
  imageId?: string | null
}

interface Props {
  aircraft: AircraftType
  selected?: boolean
  showButton?: boolean
  buttonText?: string
  selectedButtonText?: string
}

withDefaults(defineProps<Props>(), {
  selected: false,
  showButton: true,
  buttonText: 'Choose',
  selectedButtonText: 'Selected'
})

const emit = defineEmits<{
  select: [aircraft: AircraftType]
}>()

function getImageUrl(imageId: string | null | undefined): string | null {
  if (!imageId) return null
  const config = useRuntimeConfig()
  return `${config.public.apiBase}/uploads/${imageId}`
}

function handleImageError(event: Event) {
  const target = event.target as HTMLImageElement
  target.style.display = 'none'
}
</script>

<template>
  <div
    @click="emit('select', aircraft)"
    class="bg-surface border rounded-2xl p-6 cursor-pointer transition-all duration-200 hover:border-primary"
    :class="selected ? 'border-primary border-2' : 'border-border'"
  >
    <div class="flex flex-col items-center">
      <div class="w-48 h-24 mb-4 flex items-center justify-center overflow-hidden rounded-lg">
        <img
          v-if="aircraft.imageId"
          :src="getImageUrl(aircraft.imageId)!"
          :alt="aircraft.displayName"
          class="max-w-full max-h-full object-contain"
        />
        <img
          v-else
          :src="`/aircraft/${aircraft.manufacturer.toLowerCase()}.png`"
          :alt="aircraft.manufacturer"
          class="max-w-full max-h-full object-contain"
          @error="handleImageError"
        />
      </div>
      <div class="text-center mb-4">
        <p class="text-caption text-text-muted">{{ aircraft.manufacturer }}</p>
        <h3 class="text-h4 text-text-primary">{{ aircraft.displayName }}</h3>
      </div>
      <div class="grid grid-cols-2 gap-x-8 gap-y-2 text-body text-text-muted w-full">
        <div class="flex items-center gap-2">
          <Icon name="lucide:users" class="w-4 h-4" />
          <span>{{ aircraft.seatCapacity }} seats</span>
        </div>
        <div class="flex items-center gap-2">
          <Icon name="lucide:plane" class="w-4 h-4" />
          <span>{{ aircraft.rangeKm }} km</span>
        </div>
        <div class="flex items-center gap-2">
          <Icon name="lucide:gauge" class="w-4 h-4" />
          <span>{{ aircraft.cruisingSpeedKph }} km/h</span>
        </div>
      </div>
    </div>
    <div v-if="showButton" class="mt-4 flex justify-center">
      <button
        class="px-6 py-2 rounded-full text-body font-bold transition-all duration-200"
        :class="selected
          ? 'bg-primary text-on-primary'
          : 'bg-primary-soft text-on-primary-soft hover:bg-primary hover:text-on-primary'"
      >
        {{ selected ? selectedButtonText : buttonText }}
      </button>
    </div>
  </div>
</template>

