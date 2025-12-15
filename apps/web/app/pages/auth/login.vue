<script setup lang="ts">
const { login, isAuthenticated } = useAuth()
const router = useRouter()

const email = ref('')
const password = ref('')
const isLoading = ref(false)
const error = ref('')

const handleSubmit = async () => {
  if (!email.value || !password.value) {
    error.value = 'Please fill in all fields'
    return
  }

  isLoading.value = true
  error.value = ''

  const success = await login(email.value, password.value)

  if (success) {
    router.push('/')
  } else {
    error.value = 'Invalid email or password'
  }

  isLoading.value = false
}

watch(isAuthenticated, (value) => {
  if (value) {
    router.push('/')
  }
})
</script>

<template>
  <div class="min-h-screen bg-background flex items-center justify-center p-4">
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div class="absolute -left-32 top-1/2 -translate-y-1/2 w-[600px] h-[600px] opacity-20">
        <img src="/globe-bg.svg" alt="" class="w-full h-full object-contain" />
      </div>
    </div>

    <div class="relative z-10 w-full max-w-md">
      <h1 class="text-h1 text-text-primary text-center mb-12">Log in or register</h1>

      <form @submit.prevent="handleSubmit" class="space-y-6">
        <UiInput
          v-model="email"
          type="email"
          placeholder="Email"
          :disabled="isLoading"
        />

        <UiInput
          v-model="password"
          type="password"
          placeholder="Password"
          :disabled="isLoading"
        />

        <p v-if="error" class="text-error text-body text-center">{{ error }}</p>

        <UiButton
          type="submit"
          :disabled="isLoading"
          class="w-full"
        >
          {{ isLoading ? 'Loading...' : 'Log in' }}
        </UiButton>
      </form>

      <p class="text-body text-text-muted text-center mt-8">
        Don't have an account?
        <NuxtLink to="/auth/register" class="text-link hover:underline">Register</NuxtLink>
      </p>
    </div>
  </div>
</template>

