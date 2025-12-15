<script setup lang="ts">
interface LogEntry {
  id: string
  timestamp: string
  message: string
  type: 'success' | 'warning' | 'error' | 'info'
}

const isCollapsed = ref(false)

const logs = ref<LogEntry[]>([
  {
    id: '1',
    timestamp: '12:36, 02.12.25',
    message: 'CCA862 Flight departed from GVA with no delay!',
    type: 'success'
  },
  {
    id: '2',
    timestamp: '12:37, 02.12.25',
    message: 'CCA863 Flight arrived to GVA with 34 min delay.',
    type: 'warning'
  },
  {
    id: '3',
    timestamp: '12:37, 02.12.25',
    message: 'CCA870 Flight was canceled in PEK. We lost 98,367$.',
    type: 'error'
  },
])

const getTypeColor = (type: LogEntry['type']): string => {
  switch (type) {
    case 'success': return 'text-success'
    case 'warning': return 'text-warning'
    case 'error': return 'text-error'
    default: return 'text-text-muted'
  }
}

const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value
}
</script>

<template>
  <div class="bg-surface rounded-xl border border-border overflow-hidden transition-all duration-300">
    <div
      class="flex items-center justify-between p-4 cursor-pointer hover:bg-surface-subtle transition-colors"
      @click="toggleCollapse"
    >
      <h3 class="text-h4 text-text-primary">Logs</h3>
      <div class="flex items-center gap-2">
        <button
          class="p-1 hover:bg-surface-subtle rounded transition-colors"
          @click.stop
        >
          <Icon name="heroicons:arrows-pointing-out" class="w-5 h-5 text-text-muted" />
        </button>
        <Icon
          name="heroicons:chevron-up"
          class="w-5 h-5 text-text-muted transition-transform duration-300"
          :class="{ 'rotate-180': isCollapsed }"
        />
      </div>
    </div>

    <div
      class="overflow-hidden transition-all duration-300"
      :class="isCollapsed ? 'max-h-0' : 'max-h-96'"
    >
      <div class="px-4 pb-4 space-y-3 font-mono text-caption">
        <div v-for="log in logs" :key="log.id" class="flex gap-3">
          <span class="text-text-muted whitespace-nowrap">[{{ log.timestamp }}]</span>
          <span :class="getTypeColor(log.type)">{{ log.message }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

