<script setup lang="ts">
import Button from '~/components/ui/Button.vue'
import Input from '~/components/ui/Input.vue'

const form = reactive({
  name: '',
  iata: '',
  icao: '',
  lat: '',
  lon: '',
  timezone: ''
})

const loading = ref(false)
const error = ref('')
const router = useRouter()

const handleSubmit = async () => {
  loading.value = true
  error.value = ''

  try {
    await $api('/airports/create', {
      method: 'POST',
      body: form
    })
    router.push('/admin/airports')
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
      <NuxtLink to="/admin/airports" class="mr-4 text-text-muted hover:text-primary">
        &larr; Back
      </NuxtLink>
      <h1 class="text-h2">Create Airport</h1>
    </div>

    <div class="bg-surface p-8 rounded-2xl border border-border">
      <form @submit.prevent="handleSubmit" class="space-y-6">
        <div>
          <label class="block text-subtitle mb-2">Name</label>
          <Input v-model="form.name" placeholder="Enter airport name" required />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-subtitle mb-2">IATA Code</label>
            <Input v-model="form.iata" placeholder="e.g. JFK" maxlength="3" required />
          </div>
          <div>
            <label class="block text-subtitle mb-2">ICAO Code</label>
            <Input v-model="form.icao" placeholder="e.g. KJFK" maxlength="4" required />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-subtitle mb-2">Latitude</label>
            <Input v-model="form.lat" placeholder="e.g. 40.6413" required />
          </div>
          <div>
            <label class="block text-subtitle mb-2">Longitude</label>
            <Input v-model="form.lon" placeholder="e.g. -73.7781" required />
          </div>
        </div>

        <div>
          <label class="block text-subtitle mb-2">Timezone</label>
          <Input v-model="form.timezone" placeholder="e.g. America/New_York" required />
        </div>

        <div v-if="error" class="p-4 bg-error-bg text-error rounded-xl">
          {{ error }}
        </div>

        <div class="flex justify-end">
          <Button type="submit" :disabled="loading">
            {{ loading ? 'Creating...' : 'Create Airport' }}
          </Button>
        </div>
      </form>
    </div>
  </div>
</template>
