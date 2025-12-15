<script setup lang="ts">
import Button from '~/components/ui/Button.vue'
import Input from '~/components/ui/Input.vue'

const form = reactive({
  username: '',
  email: '',
  password: ''
})

const loading = ref(false)
const error = ref('')
const router = useRouter()

const handleSubmit = async () => {
  loading.value = true
  error.value = ''

  try {
    await $fetch('/api/users/create', {
      method: 'POST',
      body: form
    })
    router.push('/admin/users')
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
      <NuxtLink to="/admin/users" class="mr-4 text-text-muted hover:text-primary">
        &larr; Back
      </NuxtLink>
      <h1 class="text-h2">Create User</h1>
    </div>

    <div class="bg-surface p-8 rounded-2xl border border-border">
      <form @submit.prevent="handleSubmit" class="space-y-6">
        <div>
          <label class="block text-subtitle mb-2">Username</label>
          <Input v-model="form.username" placeholder="Enter username" required />
        </div>

        <div>
          <label class="block text-subtitle mb-2">Email</label>
          <Input v-model="form.email" type="email" placeholder="Enter email" required />
        </div>

        <div>
          <label class="block text-subtitle mb-2">Password</label>
          <Input v-model="form.password" type="password" placeholder="Enter password" required />
        </div>

        <div v-if="error" class="p-4 bg-error-bg text-error rounded-xl">
          {{ error }}
        </div>

        <div class="flex justify-end">
          <Button type="submit" :disabled="loading">
            {{ loading ? 'Creating...' : 'Create User' }}
          </Button>
        </div>
      </form>
    </div>
  </div>
</template>
