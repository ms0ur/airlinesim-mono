<script setup lang="ts">
import Button from '~/components/ui/Button.vue'
import Input from '~/components/ui/Input.vue'
import Select from '~/components/ui/Select.vue'

const form = reactive({
  name: '',
  iata: '',
  icao: '',
  baseAirportId: '',
  ownerId: ''
})

const loading = ref(false)
const error = ref('')
const router = useRouter()

// Fetch airports for selection
const { data: airportsData } = await useFetch('/api/airports', {
  query: { mode: 'all', limit: 100 }
})

// Fetch users for selection
const { data: usersData } = await useFetch('/api/users', {
  query: { mode: 'all', limit: 100 }
})

const airportOptions = computed(() => {
  return (airportsData.value as any)?.data?.map((a: any) => ({
    value: a.id,
    label: `${a.name} (${a.iata}/${a.icao})`
  })) || []
})

const userOptions = computed(() => {
  return (usersData.value as any)?.map((u: any) => ({
    value: u.id,
    label: `${u.username} (${u.email})`
  })) || []
})

const handleSubmit = async () => {
  loading.value = true
  error.value = ''

  try {
    await $fetch('/api/airlines/create', {
      method: 'POST',
      body: {
        ...form,
        ownerId: form.ownerId || undefined // Send undefined if empty string
      }
    })
    router.push('/admin/airlines')
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
      <NuxtLink to="/admin/airlines" class="mr-4 text-text-muted hover:text-primary">
        &larr; Back
      </NuxtLink>
      <h1 class="text-h2">Create Airline</h1>
    </div>

    <div class="bg-surface p-8 rounded-2xl border border-border">
      <form @submit.prevent="handleSubmit" class="space-y-6">
        <div>
          <label class="block text-subtitle mb-2">Name</label>
          <Input v-model="form.name" placeholder="Enter airline name" required />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-subtitle mb-2">IATA Code</label>
            <Input v-model="form.iata" placeholder="e.g. AA" maxlength="2" required />
          </div>
          <div>
            <label class="block text-subtitle mb-2">ICAO Code</label>
            <Input v-model="form.icao" placeholder="e.g. AAL" maxlength="3" required />
          </div>
        </div>

        <div>
          <label class="block text-subtitle mb-2">Base Airport</label>
          <Select v-model="form.baseAirportId" :options="airportOptions" placeholder="Select base airport" />
        </div>

        <div>
          <label class="block text-subtitle mb-2">Owner (Optional)</label>
          <Select v-model="form.ownerId" :options="userOptions" placeholder="Select owner" />
        </div>

        <div v-if="error" class="p-4 bg-error-bg text-error rounded-xl">
          {{ error }}
        </div>

        <div class="flex justify-end">
          <Button type="submit" :disabled="loading">
            {{ loading ? 'Creating...' : 'Create Airline' }}
          </Button>
        </div>
      </form>
    </div>
  </div>
</template>

