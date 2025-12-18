<script setup lang="ts">
import Button from '~/components/ui/Button.vue'
import Input from '~/components/ui/Input.vue'

interface Airport {
  id: string
  name: string
  iata: string
  icao: string
  lat: number
  lon: number
  timezone: string
}

interface AirportListResponse {
  data: Airport[]
  total: number
  limit: number
  offset: number
}

const searchQuery = ref('')
const limit = ref(50)
const currentPage = ref(1)

const offset = computed(() => (currentPage.value - 1) * limit.value)

const { data: airportsResponse, refresh, status } = useApi<AirportListResponse>('/airports', {
  query: computed(() => ({
    mode: searchQuery.value ? 'text' : 'all',
    text: searchQuery.value,
    limit: limit.value,
    offset: offset.value
  })),
  watch: [currentPage, limit],
  lazy: true
})

watch(searchQuery, () => {
  currentPage.value = 1
})

const airports = computed(() => airportsResponse.value?.data ?? [])
const total = computed(() => airportsResponse.value?.total ?? 0)
const totalPages = computed(() => Math.ceil(total.value / limit.value))
const isLoading = computed(() => status.value === 'pending')

const newAirport = reactive({
  name: '',
  iata: '',
  icao: '',
  lat: '',
  lon: '',
  timezone: 'UTC'
})

const isCreating = ref(false)

// Edit mode
const editingAirport = ref<Airport | null>(null)
const editForm = reactive({
  name: '',
  iata: '',
  icao: '',
  lat: '',
  lon: '',
  timezone: ''
})
const isEditing = ref(false)

// Delete confirmation
const deletingId = ref<string | null>(null)
const isDeleting = ref(false)

async function createAirport() {
  isCreating.value = true
  try {
    await $api('/airports', {
      method: 'POST',
      body: {
        ...newAirport,
        lat: parseFloat(newAirport.lat),
        lon: parseFloat(newAirport.lon)
      }
    })
    // Reset form
    newAirport.name = ''
    newAirport.iata = ''
    newAirport.icao = ''
    newAirport.lat = ''
    newAirport.lon = ''
    newAirport.timezone = 'UTC'
    await refresh()
  } catch (e) {
    console.error(e)
    alert('Failed to create airport')
  } finally {
    isCreating.value = false
  }
}

function startEdit(airport: Airport) {
  editingAirport.value = airport
  editForm.name = airport.name
  editForm.iata = airport.iata
  editForm.icao = airport.icao
  editForm.lat = airport.lat.toString()
  editForm.lon = airport.lon.toString()
  editForm.timezone = airport.timezone
}

function cancelEdit() {
  editingAirport.value = null
}

async function saveEdit() {
  if (!editingAirport.value) return

  isEditing.value = true
  try {
    await $api(`/airports/${editingAirport.value.id}`, {
      method: 'PATCH',
      body: {
        name: editForm.name,
        iata: editForm.iata,
        icao: editForm.icao,
        lat: parseFloat(editForm.lat),
        lon: parseFloat(editForm.lon),
        timezone: editForm.timezone
      }
    })

    cancelEdit()
    await refresh()
  } catch (e) {
    console.error(e)
    alert('Failed to update airport')
  } finally {
    isEditing.value = false
  }
}

function confirmDelete(id: string) {
  deletingId.value = id
}

function cancelDelete() {
  deletingId.value = null
}

async function deleteAirport() {
  if (!deletingId.value) return

  isDeleting.value = true
  try {
    await $api(`/airports/${deletingId.value}`, {
      method: 'DELETE'
    })
    deletingId.value = null
    await refresh()
  } catch (e) {
    console.error(e)
    alert('Failed to delete airport')
  } finally {
    isDeleting.value = false
  }
}
</script>

<template>
  <div>
    <h2 class="text-h4 text-primary mb-6">Airports Management</h2>

    <!-- Create Airport Form -->
    <div class="bg-surface p-6 rounded-xl border border-border mb-8">
      <h3 class="text-h5 text-text-primary mb-4">Create New Airport</h3>
      <form @submit.prevent="createAirport" class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input v-model="newAirport.name" placeholder="Airport Name" />
          <div class="grid grid-cols-2 gap-4">
            <Input v-model="newAirport.iata" placeholder="IATA (3 chars)" maxlength="3" />
            <Input v-model="newAirport.icao" placeholder="ICAO (4 chars)" maxlength="4" />
          </div>
          <div class="grid grid-cols-2 gap-4">
            <Input v-model="newAirport.lat" placeholder="Latitude" type="number" step="any" />
            <Input v-model="newAirport.lon" placeholder="Longitude" type="number" step="any" />
          </div>
          <Input v-model="newAirport.timezone" placeholder="Timezone (e.g. Europe/London)" />
        </div>
        <div class="flex justify-end">
          <Button type="submit" size="sm" :disabled="isCreating">
            {{ isCreating ? 'Creating...' : 'Create Airport' }}
          </Button>
        </div>
      </form>
    </div>

    <!-- Airports List -->
    <div class="mb-4">
      <Input v-model="searchQuery" placeholder="Search by name, IATA, ICAO or timezone..." />
    </div>

    <div class="bg-surface rounded-xl border border-border overflow-hidden">
      <div v-if="isLoading" class="p-8 text-center text-text-muted">Loading...</div>
      <table v-else class="w-full text-left border-collapse">
        <thead>
          <tr class="bg-surface-subtle border-b border-border">
            <th class="p-4 text-caption font-bold text-text-muted uppercase">Name</th>
            <th class="p-4 text-caption font-bold text-text-muted uppercase">Codes</th>
            <th class="p-4 text-caption font-bold text-text-muted uppercase">Coordinates</th>
            <th class="p-4 text-caption font-bold text-text-muted uppercase">Timezone</th>
            <th class="p-4 text-caption font-bold text-text-muted uppercase">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="airport in airports" :key="airport.id" class="border-b border-border last:border-0 hover:bg-surface-subtle/50">
            <td class="p-4 text-body text-text-primary">{{ airport.name }}</td>
            <td class="p-4 text-body text-text-primary">
              <span class="font-mono bg-surface-subtle px-2 py-1 rounded text-xs">{{ airport.iata }}</span> /
              <span class="font-mono bg-surface-subtle px-2 py-1 rounded text-xs">{{ airport.icao }}</span>
            </td>
            <td class="p-4 text-body text-text-muted">{{ airport.lat.toFixed(4) }}, {{ airport.lon.toFixed(4) }}</td>
            <td class="p-4 text-body text-text-muted">{{ airport.timezone }}</td>
            <td class="p-4">
              <div class="flex gap-2">
                <button
                  @click="startEdit(airport)"
                  class="px-3 py-1 bg-primary-soft text-on-primary-soft rounded text-caption font-medium hover:bg-primary hover:text-on-primary transition-colors"
                >
                  Edit
                </button>
                <button
                  @click="confirmDelete(airport.id)"
                  class="px-3 py-1 bg-red-500/10 text-red-500 rounded text-caption font-medium hover:bg-red-500 hover:text-white transition-colors"
                >
                  Delete
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="!airports.length">
            <td colspan="5" class="p-8 text-center text-text-muted">No airports found.</td>
          </tr>
        </tbody>
      </table>

      <!-- Pagination Controls -->
      <div v-if="totalPages > 1" class="p-4 bg-surface-subtle border-t border-border flex items-center justify-between">
        <div class="text-caption text-text-muted">
          Showing {{ offset + 1 }} to {{ Math.min(offset + limit, total) }} of {{ total }} entries
        </div>
        <div class="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            :disabled="currentPage === 1"
            @click="currentPage--"
          >
            Previous
          </Button>
          <div class="flex items-center px-4 text-body font-medium text-text-primary">
            Page {{ currentPage }} of {{ totalPages }}
          </div>
          <Button
            variant="ghost"
            size="sm"
            :disabled="currentPage === totalPages"
            @click="currentPage++"
          >
            Next
          </Button>
        </div>
      </div>
    </div>

    <!-- Edit Modal -->
    <Teleport to="body">
      <div v-if="editingAirport" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div class="bg-surface rounded-xl border border-border p-6 max-w-lg w-full">
          <h3 class="text-h5 text-text-primary mb-4">Edit Airport</h3>
          <form @submit.prevent="saveEdit" class="space-y-4">
            <Input v-model="editForm.name" placeholder="Airport Name" />
            <div class="grid grid-cols-2 gap-4">
              <Input v-model="editForm.iata" placeholder="IATA (3 chars)" maxlength="3" />
              <Input v-model="editForm.icao" placeholder="ICAO (4 chars)" maxlength="4" />
            </div>
            <div class="grid grid-cols-2 gap-4">
              <Input v-model="editForm.lat" placeholder="Latitude" type="number" step="any" />
              <Input v-model="editForm.lon" placeholder="Longitude" type="number" step="any" />
            </div>
            <Input v-model="editForm.timezone" placeholder="Timezone (e.g. Europe/London)" />
            <div class="flex justify-end gap-2">
              <Button type="button" variant="ghost" @click="cancelEdit">Cancel</Button>
              <Button type="submit" :disabled="isEditing">
                {{ isEditing ? 'Saving...' : 'Save Changes' }}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- Delete Confirmation Modal -->
    <Teleport to="body">
      <div v-if="deletingId" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div class="bg-surface rounded-xl border border-border p-6 max-w-md w-full">
          <h3 class="text-h5 text-text-primary mb-4">Confirm Delete</h3>
          <p class="text-body text-text-muted mb-6">Are you sure you want to delete this airport? This action cannot be undone.</p>
          <div class="flex justify-end gap-2">
            <Button type="button" variant="ghost" @click="cancelDelete">Cancel</Button>
            <Button type="button" variant="destructive" @click="deleteAirport" :disabled="isDeleting">
              {{ isDeleting ? 'Deleting...' : 'Delete' }}
            </Button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
