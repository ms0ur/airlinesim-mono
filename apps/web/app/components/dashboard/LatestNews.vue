<script setup lang="ts">
interface NewsItem {
  id: string
  title: string
  timestamp: Date
}

const news = ref<NewsItem[]>([
  { id: '1', title: 'JFK closes one of its runways for maintenance', timestamp: new Date() },
  { id: '2', title: 'Global Airlines Report Strong Q4 Growth Amid Rising Travel Demand', timestamp: new Date() },
  { id: '3', title: 'LHR Unveils New Expansion Plan to Boost Capacity by 12%', timestamp: new Date() },
])
</script>

<template>
  <div class="bg-surface rounded-xl border border-border p-6">
    <h3 class="text-h4 text-text-primary mb-4">Latest news</h3>

    <ul class="space-y-3">
      <li v-for="item in news" :key="item.id" class="flex items-start gap-2">
        <span class="text-body text-text-muted">•</span>
        <p class="text-body text-text-primary">{{ item.title }}</p>
      </li>
    </ul>

    <button class="mt-6 w-full py-3 bg-primary text-on-primary rounded-xl text-subtitle font-bold hover:brightness-110 transition-all">
      More news
    </button>
  </div>
</template>

