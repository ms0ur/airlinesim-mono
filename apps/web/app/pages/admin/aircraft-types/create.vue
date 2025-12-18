<script setup lang="ts">
import Button from '~/components/ui/Button.vue'
import Input from '~/components/ui/Input.vue'

const form = reactive({
  displayName: '',
  manufacturer: '',
  model: '',
  icao: '',
  iata: '',
  rangeKm: '',
  cruisingSpeedKph: '',
  seatCapacity: ''
})

const loading = ref(false)
const error = ref('')
const router = useRouter()

const handleSubmit = async () => {
  loading.value = true
  error.value = ''

  try {
    await $api('/aircraft-types/create', {
      method: 'POST',
      body: {
        ...form,
        rangeKm: Number(form.rangeKm),
        cruisingSpeedKph: Number(form.cruisingSpeedKph),
        seatCapacity: Number(form.seatCapacity),
        iata: form.iata || undefined
      }
    })
    router.push('/admin/aircraft-types')
  } catch (e: any) {
    error.value = e.data?.statusMessage || e.message || 'An error occurred'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="max-w-2xl mx-auto">
    <div class="flex items-center mb-6">
      <NuxtLink to="/admin/aircraft-types" class="mr-4 text-text-muted hover:text-primary">
        &larr; Back
      </NuxtLink>
      <h1 class="text-h2">Create Aircraft Type</h1>
    </div>

    <div class="bg-surface p-8 rounded-2xl border border-border">
      <form @submit.prevent="handleSubmit" class="space-y-6">
        <div>
          <label class="block text-subtitle mb-2">Display Name</label>
          <Input v-model="form.displayName" placeholder="e.g. Airbus A320-200" required />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-subtitle mb-2">Manufacturer</label>
            <Input v-model="form.manufacturer" placeholder="e.g. Airbus" required />
          </div>
          <div>
            <label class="block text-subtitle mb-2">Model</label>
            <Input v-model="form.model" placeholder="e.g. A320-200" required />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-subtitle mb-2">ICAO Code</label>
            <Input v-model="form.icao" placeholder="e.g. A320" maxlength="4" required />
          </div>
          <div>
            <label class="block text-subtitle mb-2">IATA Code (Optional)</label>
            <Input v-model="form.iata" placeholder="e.g. 320" maxlength="3" />
          </div>
        </div>

        <div class="grid grid-cols-3 gap-4">
          <div>
            <label class="block text-subtitle mb-2">Range (km)</label>
            <Input v-model="form.rangeKm" type="number" placeholder="e.g. 6100" required />
          </div>
          <div>
            <label class="block text-subtitle mb-2">Speed (km/h)</label>
            <Input v-model="form.cruisingSpeedKph" type="number" placeholder="e.g. 840" required />
          </div>
          <div>
            <label class="block text-subtitle mb-2">Capacity (pax)</label>
            <Input v-model="form.seatCapacity" type="number" placeholder="e.g. 180" required />
          </div>
        </div>

        <div v-if="error" class="p-4 bg-error-bg text-error rounded-xl">
          {{ error }}
        </div>

        <div class="flex justify-end">
          <Button type="submit" :disabled="loading">
            {{ loading ? 'Creating...' : 'Create Type' }}
          </Button>
        </div>
      </form>
    </div>
  </div>
</template>
