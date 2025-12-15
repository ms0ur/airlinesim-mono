<script setup lang="ts">
interface Props {
  modelValue: string
  options: Array<{ value: string; label: string }>
  placeholder?: string
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  placeholder: 'Select...'
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const handleChange = (event: Event) => {
  emit('update:modelValue', (event.target as HTMLSelectElement).value)
}
</script>

<template>
  <select
    :value="props.modelValue"
    :disabled="props.disabled"
    @change="handleChange"
    class="w-full px-6 py-4 bg-surface text-text-primary text-body rounded-2xl border border-border outline-none transition-all duration-200 cursor-pointer focus:border-primary disabled:opacity-50 disabled:cursor-not-allowed appearance-none"
  >
    <option value="" disabled>{{ props.placeholder }}</option>
    <option
      v-for="option in props.options"
      :key="option.value"
      :value="option.value"
    >
      {{ option.label }}
    </option>
  </select>
</template>

