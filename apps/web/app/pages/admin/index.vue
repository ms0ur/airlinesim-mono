<script setup lang="ts">
// Dashboard can show some stats if available, or just a welcome message
</script>

<template>
  <div>
    <h2 class="text-h4 text-primary mb-6">Dashboard</h2>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div class="bg-surface p-6 rounded-xl border border-border shadow-sm">
        <h3 class="text-body font-semibold text-text-muted">Welcome</h3>
        <p class="text-h3 text-primary mt-2">Admin</p>
      </div>
      <!-- Add more stats cards here if we have stats endpoints -->
    </div>
    <div class="mt-8">
      <p class="text-body text-text-primary">
        Select a category from the sidebar to manage entities.
      </p>
    </div>
  </div>
</template>

