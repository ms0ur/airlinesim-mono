<script setup lang="ts">
const links = [
  { name: 'Dashboard', to: '/admin' },
  { name: 'Users', to: '/admin/users' },
  { name: 'Airlines', to: '/admin/airlines' },
  { name: 'Airports', to: '/admin/airports' },
  { name: 'Aircraft Types', to: '/admin/aircraft-types' },
]
</script>

<template>
  <div class="min-h-screen bg-background text-text-primary flex">
    <!-- Sidebar -->
    <aside class="w-64 bg-surface border-r border-border flex flex-col">
      <div class="p-6 border-b border-border">
        <h1 class="text-h3 text-primary">Admin Panel</h1>
      </div>
      <nav class="flex-1 p-4 space-y-2">
        <NuxtLink
          v-for="link in links"
          :key="link.to"
          :to="link.to"
          class="block px-4 py-3 rounded-xl text-body transition-colors hover:bg-surface-subtle"
          active-class="bg-primary-soft text-primary font-semibold"
        >
          {{ link.name }}
        </NuxtLink>
      </nav>
      <div class="p-4 border-t border-border">
        <NuxtLink to="/" class="text-caption text-text-muted hover:text-primary">
          &larr; Back to App
        </NuxtLink>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 p-8 overflow-y-auto">
      <NuxtPage />
    </main>
  </div>
</template>
