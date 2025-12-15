<script setup lang="ts">
interface Props {
  options: Array<{ value: string; label: string }>
  modelValue: string
}

defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>

<template>
  <div class="flex gap-4">
    <button
      v-for="option in options"
      :key="option.value"
      type="button"
      @click="emit('update:modelValue', option.value)"
      class="flex-1 px-6 py-4 rounded-2xl border text-body font-medium transition-all duration-200"
      :class="modelValue === option.value
        ? 'bg-surface border-primary text-text-primary'
        : 'bg-surface border-border text-text-muted hover:border-primary'"
    >
      {{ option.label }}
    </button>
  </div>
</template>

