<script setup lang="ts">
import Button from '~/components/ui/Button.vue'
import Input from '~/components/ui/Input.vue'
import Select from '~/components/ui/Select.vue'

interface Airline {
  id: string
  name: string
  iata: string
  icao: string
  baseAirportId: string
  ownerId?: string
}

interface Airport {
  id: string
  name: string
  iata: string
  icao: string
}

interface User {
  id: string
  username: string
}

interface PaginatedResponse<T> {
  data: T[]
  total: number
  limit: number
  offset: number
}

interface AirportListResponse {
  items: Airport[]
  total: number
  limit: number
  offset: number
}

// Use useApi for non-blocking parallel requests
const { data: airlinesResponse, refresh: refreshAirlines, status: airlinesStatus } = useApi<PaginatedResponse<Airline>>('/airlines', {
  query: { mode: 'all', limit: 50 },
  lazy: true
})
const { data: airportsResponse, status: airportsStatus } = useApi<AirportListResponse>('/airports', {
  query: { mode: 'all', limit: 50 },
  lazy: true
})
const { data: usersResponse, status: usersStatus } = useApi<PaginatedResponse<User>>('/users', {
  query: { mode: 'all', limit: 50 },
  lazy: true
})

const airlines = computed(() => airlinesResponse.value?.data ?? [])
const airports = computed(() => airportsResponse.value?.items ?? [])
const users = computed(() => usersResponse.value?.data ?? [])

const isLoading = computed(() =>
  airlinesStatus.value === 'pending' ||
  airportsStatus.value === 'pending' ||
  usersStatus.value === 'pending'
)

const airportOptions = computed(() =>
  airports.value.map(a => ({ value: a.id, label: `${a.name} (${a.iata}/${a.icao})` }))
)

const userOptions = computed(() =>
  users.value.map(u => ({ value: u.id, label: u.username }))
)

const newAirline = reactive({
  name: '',
  iata: '',
  icao: '',
  baseAirportId: '',
  ownerId: ''
})

const isCreating = ref(false)

// Edit mode
const editingAirline = ref<Airline | null>(null)
const editForm = reactive({
  name: '',
  iata: '',
  icao: '',
  baseAirportId: '',
  ownerId: ''
})
const isEditing = ref(false)

// Delete confirmation
const deletingId = ref<string | null>(null)
const isDeleting = ref(false)

async function createAirline() {
  isCreating.value = true
  try {
    await $api('/airlines', {
      method: 'POST',
      body: {
        ...newAirline,
        ownerId: newAirline.ownerId || undefined
      }
    })
    // Reset form
    newAirline.name = ''
    newAirline.iata = ''
    newAirline.icao = ''
    newAirline.baseAirportId = ''
    newAirline.ownerId = ''
    await refreshAirlines()
  } catch (e) {
    console.error(e)
    alert('Failed to create airline')
  } finally {
    isCreating.value = false
  }
}

function startEdit(airline: Airline) {
  editingAirline.value = airline
  editForm.name = airline.name
  editForm.iata = airline.iata
  editForm.icao = airline.icao
  editForm.baseAirportId = airline.baseAirportId
  editForm.ownerId = airline.ownerId || ''
}

function cancelEdit() {
  editingAirline.value = null
}

async function saveEdit() {
  if (!editingAirline.value) return

  isEditing.value = true
  try {
    await $api(`/airlines/${editingAirline.value.id}`, {
      method: 'PATCH',
      body: {
        name: editForm.name,
        iata: editForm.iata,
        icao: editForm.icao,
        baseAirportId: editForm.baseAirportId,
        ownerId: editForm.ownerId || undefined
      }
    })

    cancelEdit()
    await refreshAirlines()
  } catch (e) {
    console.error(e)
    alert('Failed to update airline')
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

async function deleteAirline() {
  if (!deletingId.value) return

  isDeleting.value = true
  try {
    await $api(`/airlines/${deletingId.value}`, {
      method: 'DELETE'
    })
    deletingId.value = null
    await refreshAirlines()
  } catch (e) {
    console.error(e)
    alert('Failed to delete airline')
  } finally {
    isDeleting.value = false
  }
}

function getAirportName(id: string): string {
  const airport = airports.value.find(a => a.id === id)
  return airport ? `${airport.name} (${airport.iata})` : id.slice(0, 8) + '...'
}

function getUsername(id: string | undefined): string {
  if (!id) return '-'
  const user = users.value.find(u => u.id === id)
  return user ? user.username : id.slice(0, 8) + '...'
}
</script>

<template>
  <div>
    <h2 class="text-h4 text-primary mb-6">Airlines Management</h2>

    <!-- Create Airline Form -->
    <div class="bg-surface p-6 rounded-xl border border-border mb-8">
      <h3 class="text-h5 text-text-primary mb-4">Create New Airline</h3>
      <form @submit.prevent="createAirline" class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input v-model="newAirline.name" placeholder="Airline Name" />
          <div class="grid grid-cols-2 gap-4">
            <Input v-model="newAirline.iata" placeholder="IATA (2 chars)" maxlength="2" />
            <Input v-model="newAirline.icao" placeholder="ICAO (3 chars)" maxlength="3" />
          </div>
          <Select
            v-model="newAirline.baseAirportId"
            :options="airportOptions"
            placeholder="Select Base Airport"
          />
          <Select
            v-model="newAirline.ownerId"
            :options="userOptions"
            placeholder="Select Owner (Optional)"
          />
        </div>
        <div class="flex justify-end">
          <Button type="submit" size="sm" :disabled="isCreating">
            {{ isCreating ? 'Creating...' : 'Create Airline' }}
          </Button>
        </div>
      </form>
    </div>

    <!-- Airlines List -->
    <div class="bg-surface rounded-xl border border-border overflow-hidden">
      <div v-if="isLoading" class="p-8 text-center text-text-muted">Loading...</div>
      <table v-else class="w-full text-left border-collapse">
        <thead>
          <tr class="bg-surface-subtle border-b border-border">
            <th class="p-4 text-caption font-bold text-text-muted uppercase">Name</th>
            <th class="p-4 text-caption font-bold text-text-muted uppercase">Codes</th>
            <th class="p-4 text-caption font-bold text-text-muted uppercase">Base Airport</th>
            <th class="p-4 text-caption font-bold text-text-muted uppercase">Owner</th>
            <th class="p-4 text-caption font-bold text-text-muted uppercase">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="airline in airlines" :key="airline.id" class="border-b border-border last:border-0 hover:bg-surface-subtle/50">
            <td class="p-4 text-body text-text-primary">{{ airline.name }}</td>
            <td class="p-4 text-body text-text-primary">
              <span class="font-mono bg-surface-subtle px-2 py-1 rounded text-xs">{{ airline.iata }}</span> /
              <span class="font-mono bg-surface-subtle px-2 py-1 rounded text-xs">{{ airline.icao }}</span>
            </td>
            <td class="p-4 text-body text-text-muted">{{ getAirportName(airline.baseAirportId) }}</td>
            <td class="p-4 text-body text-text-muted">{{ getUsername(airline.ownerId) }}</td>
            <td class="p-4">
              <div class="flex gap-2">
                <button
                  @click="startEdit(airline)"
                  class="px-3 py-1 bg-primary-soft text-on-primary-soft rounded text-caption font-medium hover:bg-primary hover:text-on-primary transition-colors"
                >
                  Edit
                </button>
                <button
                  @click="confirmDelete(airline.id)"
                  class="px-3 py-1 bg-red-500/10 text-red-500 rounded text-caption font-medium hover:bg-red-500 hover:text-white transition-colors"
                >
                  Delete
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="!airlines.length">
            <td colspan="5" class="p-8 text-center text-text-muted">No airlines found.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Edit Modal -->
    <Teleport to="body">
      <div v-if="editingAirline" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div class="bg-surface rounded-xl border border-border p-6 max-w-lg w-full">
          <h3 class="text-h5 text-text-primary mb-4">Edit Airline</h3>
          <form @submit.prevent="saveEdit" class="space-y-4">
            <Input v-model="editForm.name" placeholder="Airline Name" />
            <div class="grid grid-cols-2 gap-4">
              <Input v-model="editForm.iata" placeholder="IATA (2 chars)" maxlength="2" />
              <Input v-model="editForm.icao" placeholder="ICAO (3 chars)" maxlength="3" />
            </div>
            <Select
              v-model="editForm.baseAirportId"
              :options="airportOptions"
              placeholder="Select Base Airport"
            />
            <Select
              v-model="editForm.ownerId"
              :options="userOptions"
              placeholder="Select Owner (Optional)"
            />
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
          <p class="text-body text-text-muted mb-6">Are you sure you want to delete this airline? This action cannot be undone.</p>
          <div class="flex justify-end gap-2">
            <Button type="button" variant="ghost" @click="cancelDelete">Cancel</Button>
            <Button type="button" variant="destructive" @click="deleteAirline" :disabled="isDeleting">
              {{ isDeleting ? 'Deleting...' : 'Delete' }}
            </Button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
