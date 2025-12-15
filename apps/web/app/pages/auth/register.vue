<script setup lang="ts">
const { register, login, isAuthenticated } = useAuth()
const router = useRouter()

const username = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const isLoading = ref(false)
const error = ref('')

const handleSubmit = async () => {
  if (!username.value || !email.value || !password.value || !confirmPassword.value) {
    error.value = 'Please fill in all fields'
    return
  }

  if (password.value !== confirmPassword.value) {
    error.value = 'Passwords do not match'
    return
  }

  if (password.value.length < 6) {
    error.value = 'Password must be at least 6 characters'
    return
  }

  isLoading.value = true
  error.value = ''

  const result = await register(username.value, email.value, password.value)

  if (result.success) {
    const loginSuccess = await login(email.value, password.value)
    if (loginSuccess) {
      router.push('/auth/register-airline')
    } else {
      router.push('/auth/login')
    }
  } else {
    error.value = 'Registration failed. Email or username may already be in use.'
  }

  isLoading.value = false
}

watch(isAuthenticated, (value) => {
  if (value) {
    router.push('/auth/register-airline')
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
      <h1 class="text-h1 text-text-primary text-center mb-12">Create account</h1>

      <form @submit.prevent="handleSubmit" class="space-y-6">
        <UiInput
          v-model="username"
          type="text"
          placeholder="Username"
          :disabled="isLoading"
        />

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

        <UiInput
          v-model="confirmPassword"
          type="password"
          placeholder="Confirm Password"
          :disabled="isLoading"
        />

        <p v-if="error" class="text-error text-body text-center">{{ error }}</p>

        <UiButton
          type="submit"
          :disabled="isLoading"
          class="w-full"
        >
          {{ isLoading ? 'Creating...' : 'Register' }}
        </UiButton>
      </form>

      <p class="text-body text-text-muted text-center mt-8">
        Already have an account?
        <NuxtLink to="/auth/login" class="text-link hover:underline">Log in</NuxtLink>
      </p>
    </div>
  </div>
</template>

