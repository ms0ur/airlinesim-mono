<script setup lang="ts">
import Button from '~/components/ui/Button.vue'
import Input from '~/components/ui/Input.vue'

interface AircraftType {
  id: string
  displayName: string
  manufacturer: string
  model: string
  icao: string
  iata?: string
  imageId?: string | null
  rangeKm: number
  cruisingSpeedKph: number
  seatCapacity: number
}

interface PaginatedResponse<T> {
  data: T[]
  total: number
  limit: number
  offset: number
}

const { data: aircraftTypesResponse, refresh, status } = useApi<PaginatedResponse<AircraftType>>('/aircraft-types', {
  query: { mode: 'all', limit: 50 },
  lazy: true
})

const aircraftTypes = computed(() => aircraftTypesResponse.value?.data ?? [])
const isLoading = computed(() => status.value === 'pending')

const newType = reactive({
  displayName: '',
  manufacturer: '',
  model: '',
  icao: '',
  iata: '',
  rangeKm: '',
  cruisingSpeedKph: '',
  seatCapacity: ''
})

const isCreating = ref(false)
const selectedFile = ref<File | null>(null)
const imagePreview = ref<string | null>(null)
const uploadedImageId = ref<string | null>(null)

// Edit mode
const editingType = ref<AircraftType | null>(null)
const editForm = reactive({
  displayName: '',
  manufacturer: '',
  model: '',
  icao: '',
  iata: '',
  rangeKm: '',
  cruisingSpeedKph: '',
  seatCapacity: ''
})
const editSelectedFile = ref<File | null>(null)
const editImagePreview = ref<string | null>(null)
const isEditing = ref(false)

// Delete confirmation
const deletingId = ref<string | null>(null)
const isDeleting = ref(false)

function getImageUrl(imageId: string | null | undefined): string | null {
  if (!imageId) return null
  const config = useRuntimeConfig()
  return `${config.public.apiBase}/uploads/${imageId}`
}

function handleFileSelect(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (file) {
    selectedFile.value = file
    imagePreview.value = URL.createObjectURL(file)
    uploadedImageId.value = null
  }
}

function handleEditFileSelect(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (file) {
    editSelectedFile.value = file
    editImagePreview.value = URL.createObjectURL(file)
  }
}

async function uploadImage(file: File): Promise<string | null> {
  const formData = new FormData()
  formData.append('file', file)

  try {
    const response = await $api<{ data: { id: string } }>('/uploads', {
      method: 'POST',
      body: formData
    })
    return response.data.id
  } catch (e) {
    console.error('Upload failed:', e)
    return null
  }
}

async function createAircraftType() {
  isCreating.value = true
  try {
    // Upload image first if selected
    let imageId: string | undefined
    if (selectedFile.value) {
      const id = await uploadImage(selectedFile.value)
      if (id) imageId = id
    }

    await $api('/aircraft-types', {
      method: 'POST',
      body: {
        ...newType,
        rangeKm: parseInt(newType.rangeKm),
        cruisingSpeedKph: parseInt(newType.cruisingSpeedKph),
        seatCapacity: parseInt(newType.seatCapacity),
        iata: newType.iata || undefined,
        imageId
      }
    })
    // Reset form
    newType.displayName = ''
    newType.manufacturer = ''
    newType.model = ''
    newType.icao = ''
    newType.iata = ''
    newType.rangeKm = ''
    newType.cruisingSpeedKph = ''
    newType.seatCapacity = ''
    selectedFile.value = null
    imagePreview.value = null
    uploadedImageId.value = null
    await refresh()
  } catch (e) {
    console.error(e)
    alert('Failed to create aircraft type')
  } finally {
    isCreating.value = false
  }
}

function startEdit(type: AircraftType) {
  editingType.value = type
  editForm.displayName = type.displayName
  editForm.manufacturer = type.manufacturer
  editForm.model = type.model
  editForm.icao = type.icao
  editForm.iata = type.iata || ''
  editForm.rangeKm = type.rangeKm.toString()
  editForm.cruisingSpeedKph = type.cruisingSpeedKph.toString()
  editForm.seatCapacity = type.seatCapacity.toString()
  editSelectedFile.value = null
  editImagePreview.value = type.imageId ? getImageUrl(type.imageId) : null
}

function cancelEdit() {
  editingType.value = null
  editSelectedFile.value = null
  editImagePreview.value = null
}

async function saveEdit() {
  if (!editingType.value) return

  isEditing.value = true
  try {
    let imageId: string | null | undefined = undefined

    // Upload new image if selected
    if (editSelectedFile.value) {
      const id = await uploadImage(editSelectedFile.value)
      if (id) imageId = id
    }

    await $api(`/aircraft-types/${editingType.value.id}`, {
      method: 'PATCH',
      body: {
        displayName: editForm.displayName,
        manufacturer: editForm.manufacturer,
        model: editForm.model,
        icao: editForm.icao,
        iata: editForm.iata || null,
        rangeKm: parseInt(editForm.rangeKm),
        cruisingSpeedKph: parseInt(editForm.cruisingSpeedKph),
        seatCapacity: parseInt(editForm.seatCapacity),
        ...(imageId !== undefined ? { imageId } : {})
      }
    })

    cancelEdit()
    await refresh()
  } catch (e) {
    console.error(e)
    alert('Failed to update aircraft type')
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

async function deleteType() {
  if (!deletingId.value) return

  isDeleting.value = true
  try {
    await $api(`/aircraft-types/${deletingId.value}`, {
      method: 'DELETE'
    })
    deletingId.value = null
    await refresh()
  } catch (e) {
    console.error(e)
    alert('Failed to delete aircraft type')
  } finally {
    isDeleting.value = false
  }
}
</script>

<template>
  <div>
    <h2 class="text-h4 text-primary mb-6">Aircraft Types Management</h2>

    <!-- Create Aircraft Type Form -->
    <div class="bg-surface p-6 rounded-xl border border-border mb-8">
      <h3 class="text-h5 text-text-primary mb-4">Create New Aircraft Type</h3>
      <form @submit.prevent="createAircraftType" class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input v-model="newType.displayName" placeholder="Display Name" />
          <Input v-model="newType.manufacturer" placeholder="Manufacturer" />
          <Input v-model="newType.model" placeholder="Model" />
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input v-model="newType.icao" placeholder="ICAO Code" />
          <Input v-model="newType.iata" placeholder="IATA Code (Optional)" />
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input v-model="newType.rangeKm" placeholder="Range (km)" type="number" />
          <Input v-model="newType.cruisingSpeedKph" placeholder="Speed (km/h)" type="number" />
          <Input v-model="newType.seatCapacity" placeholder="Seats" type="number" />
        </div>

        <!-- Image Upload -->
        <div class="space-y-2">
          <label class="block text-body text-text-primary">Aircraft Image</label>
          <div class="flex items-center gap-4">
            <label class="cursor-pointer px-4 py-2 bg-surface-subtle border border-border rounded-lg hover:bg-surface-subtle/80 transition-colors">
              <span class="text-body text-text-primary">Choose Image</span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                class="hidden"
                @change="handleFileSelect"
              />
            </label>
            <span v-if="selectedFile" class="text-caption text-text-muted">
              {{ selectedFile.name }}
            </span>
          </div>
          <div v-if="imagePreview" class="mt-2">
            <img :src="imagePreview" alt="Preview" class="h-24 w-auto rounded-lg object-cover" />
          </div>
        </div>

        <div class="flex justify-end">
          <Button type="submit" size="sm" :disabled="isCreating">
            {{ isCreating ? 'Creating...' : 'Create Type' }}
          </Button>
        </div>
      </form>
    </div>

    <!-- Aircraft Types List -->
    <div class="bg-surface rounded-xl border border-border overflow-hidden">
      <div v-if="isLoading" class="p-8 text-center text-text-muted">Loading...</div>
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
        <div
          v-for="type in aircraftTypes"
          :key="type.id"
          class="bg-surface-subtle rounded-xl p-4 border border-border hover:border-primary transition-colors"
        >
          <!-- Image -->
          <div class="aspect-video bg-background rounded-lg overflow-hidden mb-3">
            <img
              v-if="type.imageId"
              :src="getImageUrl(type.imageId)!"
              :alt="type.displayName"
              class="w-full h-full object-cover"
            />
            <div v-else class="w-full h-full flex items-center justify-center text-text-muted">
              <span class="text-4xl">✈️</span>
            </div>
          </div>

          <!-- Info -->
          <h4 class="text-body font-semibold text-text-primary mb-1">{{ type.displayName }}</h4>
          <p class="text-caption text-text-muted mb-2">{{ type.manufacturer }} {{ type.model }}</p>

          <div class="flex gap-2 mb-2">
            <span class="font-mono bg-background px-2 py-1 rounded text-xs text-text-primary">{{ type.icao }}</span>
            <span v-if="type.iata" class="font-mono bg-background px-2 py-1 rounded text-xs text-text-primary">{{ type.iata }}</span>
          </div>

          <div class="text-caption text-text-muted space-y-1">
            <div>Range: {{ type.rangeKm.toLocaleString() }} km</div>
            <div>Speed: {{ type.cruisingSpeedKph.toLocaleString() }} km/h</div>
            <div>Seats: {{ type.seatCapacity }}</div>
          </div>

          <!-- Action Buttons -->
          <div class="mt-4 flex gap-2">
            <button
              @click="startEdit(type)"
              class="flex-1 px-3 py-2 bg-primary-soft text-on-primary-soft rounded-lg text-caption font-medium hover:bg-primary hover:text-on-primary transition-colors"
            >
              Edit
            </button>
            <button
              @click="confirmDelete(type.id)"
              class="px-3 py-2 bg-red-500/10 text-red-500 rounded-lg text-caption font-medium hover:bg-red-500 hover:text-white transition-colors"
            >
              Delete
            </button>
          </div>
        </div>

        <div v-if="!aircraftTypes.length" class="col-span-full p-8 text-center text-text-muted">
          No aircraft types found.
        </div>
      </div>
    </div>

    <!-- Edit Modal -->
    <Teleport to="body">
      <div v-if="editingType" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div class="bg-surface rounded-xl border border-border p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <h3 class="text-h5 text-text-primary mb-4">Edit Aircraft Type</h3>
          <form @submit.prevent="saveEdit" class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input v-model="editForm.displayName" placeholder="Display Name" />
              <Input v-model="editForm.manufacturer" placeholder="Manufacturer" />
              <Input v-model="editForm.model" placeholder="Model" />
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input v-model="editForm.icao" placeholder="ICAO Code" />
              <Input v-model="editForm.iata" placeholder="IATA Code (Optional)" />
            </div>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input v-model="editForm.rangeKm" placeholder="Range (km)" type="number" />
              <Input v-model="editForm.cruisingSpeedKph" placeholder="Speed (km/h)" type="number" />
              <Input v-model="editForm.seatCapacity" placeholder="Seats" type="number" />
            </div>

            <!-- Image Upload -->
            <div class="space-y-2">
              <label class="block text-body text-text-primary">Aircraft Image</label>
              <div class="flex items-center gap-4">
                <label class="cursor-pointer px-4 py-2 bg-surface-subtle border border-border rounded-lg hover:bg-surface-subtle/80 transition-colors">
                  <span class="text-body text-text-primary">Change Image</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    class="hidden"
                    @change="handleEditFileSelect"
                  />
                </label>
              </div>
              <div v-if="editImagePreview" class="mt-2">
                <img :src="editImagePreview" alt="Preview" class="h-24 w-auto rounded-lg object-cover" />
              </div>
            </div>

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
          <p class="text-body text-text-muted mb-6">Are you sure you want to delete this aircraft type? This action cannot be undone.</p>
          <div class="flex justify-end gap-2">
            <Button type="button" variant="ghost" @click="cancelDelete">Cancel</Button>
            <Button type="button" variant="destructive" @click="deleteType" :disabled="isDeleting">
              {{ isDeleting ? 'Deleting...' : 'Delete' }}
            </Button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

