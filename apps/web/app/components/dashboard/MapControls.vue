<script setup lang="ts">
interface Props {
  projection: 'globe' | 'mercator'
}

defineProps<Props>()

const emit = defineEmits<{
  projectionChange: [projection: 'globe' | 'mercator']
  zoomIn: []
  zoomOut: []
}>()
</script>

<template>
  <div class="flex flex-col gap-2">
    <div class="bg-surface rounded-xl border border-border p-1 flex">
      <button
        class="px-3 py-2 rounded-lg text-caption font-bold transition-all"
        :class="projection === 'globe' ? 'bg-primary text-on-primary' : 'text-text-muted hover:text-text-primary'"
        @click="emit('projectionChange', 'globe')"
      >
        3D
      </button>
      <button
        class="px-3 py-2 rounded-lg text-caption font-bold transition-all"
        :class="projection === 'mercator' ? 'bg-primary text-on-primary' : 'text-text-muted hover:text-text-primary'"
        @click="emit('projectionChange', 'mercator')"
      >
        2D
      </button>
    </div>

    <div class="bg-surface rounded-xl border border-border p-1 flex flex-col">
      <button
        class="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-subtle transition-all"
        @click="emit('zoomIn')"
      >
        <Icon name="heroicons:plus" class="w-5 h-5" />
      </button>
      <div class="h-px bg-border mx-1" />
      <button
        class="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-subtle transition-all"
        @click="emit('zoomOut')"
      >
        <Icon name="heroicons:minus" class="w-5 h-5" />
      </button>
    </div>
  </div>
</template>

