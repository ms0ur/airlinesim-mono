<script setup lang="ts">
import GuestView from '~/components/auth/GuestView.vue'
import DashboardView from '~/components/dashboard/DashboardView.vue'

const { isAuthenticated, fetchUser, isLoading } = useAuth()

onMounted(async () => {
  await fetchUser()
})
</script>

<template>
  <div v-if="isLoading" class="min-h-screen bg-background flex items-center justify-center">
    <span class="text-text-muted text-subtitle">Loading...</span>
  </div>

  <template v-else>
    <DashboardView v-if="isAuthenticated" />
    <GuestView v-else />
  </template>
</template>
