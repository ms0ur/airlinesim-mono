<script setup lang="ts">
import Button from '~/components/ui/Button.vue'
import Input from '~/components/ui/Input.vue'

interface User {
  id: string
  username: string
  email: string
  createdAt: string
}

interface UsersResponse {
  data: User[]
  total: number
  limit: number
  offset: number
}

const { data: usersResponse, refresh, status } = useApi<UsersResponse>('/users', {
  query: { mode: 'all', limit: 50 },
  lazy: true
})

const users = computed(() => usersResponse.value?.data ?? [])
const isLoading = computed(() => status.value === 'pending')

const newUser = reactive({
  username: '',
  email: '',
  password: ''
})

const isCreating = ref(false)

// Edit mode
const editingUser = ref<User | null>(null)
const editForm = reactive({
  username: '',
  email: '',
  password: ''
})
const isEditing = ref(false)

// Delete confirmation
const deletingId = ref<string | null>(null)
const isDeleting = ref(false)

async function createUser() {
  isCreating.value = true
  try {
    await $api('/users', {
      method: 'POST',
      body: newUser
    })
    // Reset form
    newUser.username = ''
    newUser.email = ''
    newUser.password = ''
    await refresh()
  } catch (e) {
    console.error(e)
    alert('Failed to create user')
  } finally {
    isCreating.value = false
  }
}

function startEdit(user: User) {
  editingUser.value = user
  editForm.username = user.username
  editForm.email = user.email
  editForm.password = ''
}

function cancelEdit() {
  editingUser.value = null
  editForm.password = ''
}

async function saveEdit() {
  if (!editingUser.value) return

  isEditing.value = true
  try {
    const body: Record<string, string> = {
      username: editForm.username,
      email: editForm.email
    }
    // Only include password if it's not empty
    if (editForm.password) {
      body.password = editForm.password
    }

    await $api(`/users/${editingUser.value.id}`, {
      method: 'PATCH',
      body
    })

    cancelEdit()
    await refresh()
  } catch (e) {
    console.error(e)
    alert('Failed to update user')
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

async function deleteUser() {
  if (!deletingId.value) return

  isDeleting.value = true
  try {
    await $api(`/users/${deletingId.value}`, {
      method: 'DELETE'
    })
    deletingId.value = null
    await refresh()
  } catch (e) {
    console.error(e)
    alert('Failed to delete user')
  } finally {
    isDeleting.value = false
  }
}
</script>

<template>
  <div>
    <h2 class="text-h4 text-primary mb-6">Users Management</h2>

    <!-- Create User Form -->
    <div class="bg-surface p-6 rounded-xl border border-border mb-8">
      <h3 class="text-h5 text-text-primary mb-4">Create New User</h3>
      <form @submit.prevent="createUser" class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input v-model="newUser.username" placeholder="Username" />
          <Input v-model="newUser.email" type="email" placeholder="Email" />
          <Input v-model="newUser.password" type="password" placeholder="Password" />
        </div>
        <div class="flex justify-end">
          <Button type="submit" size="sm" :disabled="isCreating">
            {{ isCreating ? 'Creating...' : 'Create User' }}
          </Button>
        </div>
      </form>
    </div>

    <!-- Users List -->
    <div class="bg-surface rounded-xl border border-border overflow-hidden">
      <div v-if="isLoading" class="p-8 text-center text-text-muted">Loading...</div>
      <table v-else class="w-full text-left border-collapse">
        <thead>
          <tr class="bg-surface-subtle border-b border-border">
            <th class="p-4 text-caption font-bold text-text-muted uppercase">ID</th>
            <th class="p-4 text-caption font-bold text-text-muted uppercase">Username</th>
            <th class="p-4 text-caption font-bold text-text-muted uppercase">Email</th>
            <th class="p-4 text-caption font-bold text-text-muted uppercase">Created At</th>
            <th class="p-4 text-caption font-bold text-text-muted uppercase">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in users" :key="user.id" class="border-b border-border last:border-0 hover:bg-surface-subtle/50">
            <td class="p-4 text-body font-mono text-xs text-text-muted">{{ user.id.slice(0, 8) }}...</td>
            <td class="p-4 text-body text-text-primary">{{ user.username }}</td>
            <td class="p-4 text-body text-text-primary">{{ user.email }}</td>
            <td class="p-4 text-body text-text-muted">{{ new Date(user.createdAt).toLocaleDateString() }}</td>
            <td class="p-4">
              <div class="flex gap-2">
                <button
                  @click="startEdit(user)"
                  class="px-3 py-1 bg-primary-soft text-on-primary-soft rounded text-caption font-medium hover:bg-primary hover:text-on-primary transition-colors"
                >
                  Edit
                </button>
                <button
                  @click="confirmDelete(user.id)"
                  class="px-3 py-1 bg-red-500/10 text-red-500 rounded text-caption font-medium hover:bg-red-500 hover:text-white transition-colors"
                >
                  Delete
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="!users.length">
            <td colspan="5" class="p-8 text-center text-text-muted">No users found.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Edit Modal -->
    <Teleport to="body">
      <div v-if="editingUser" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div class="bg-surface rounded-xl border border-border p-6 max-w-lg w-full">
          <h3 class="text-h5 text-text-primary mb-4">Edit User</h3>
          <form @submit.prevent="saveEdit" class="space-y-4">
            <Input v-model="editForm.username" placeholder="Username" />
            <Input v-model="editForm.email" type="email" placeholder="Email" />
            <Input v-model="editForm.password" type="password" placeholder="New Password (leave empty to keep current)" />
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
          <p class="text-body text-text-muted mb-6">Are you sure you want to delete this user? This action cannot be undone.</p>
          <div class="flex justify-end gap-2">
            <Button type="button" variant="ghost" @click="cancelDelete">Cancel</Button>
            <Button type="button" variant="destructive" @click="deleteUser" :disabled="isDeleting">
              {{ isDeleting ? 'Deleting...' : 'Delete' }}
            </Button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
