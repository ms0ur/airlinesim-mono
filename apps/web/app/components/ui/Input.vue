<script setup lang="ts">
interface Props {
  modelValue: string
  placeholder?: string
  type?: 'text' | 'email' | 'password' | 'number'
  disabled?: boolean
  error?: string
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  disabled: false,
  placeholder: ''
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const handleInput = (event: Event) => {
  emit('update:modelValue', (event.target as HTMLInputElement).value)
}
</script>

<template>
  <div class="w-full">
    <input
      :type="props.type"
      :value="props.modelValue"
      :placeholder="props.placeholder"
      :disabled="props.disabled"
      @input="handleInput"
      class="w-full px-6 py-4 bg-surface text-text-primary text-body rounded-2xl border border-border outline-none transition-all duration-200 placeholder:text-text-muted focus:border-primary disabled:opacity-50 disabled:cursor-not-allowed"
      :class="{ 'border-error': error }"
    />
    <span v-if="error" class="text-caption text-error mt-1 block">{{ error }}</span>
  </div>
</template>

