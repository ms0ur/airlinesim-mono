<script setup lang="ts">
interface Props {
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
}

withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  disabled: false
})
</script>

<template>
  <button
    :disabled="disabled"
    class="inline-flex items-center justify-center font-tektur font-bold rounded-xl transition-all duration-200 cursor-pointer border-none outline-none"
    :class="[
      // Sizes
      size === 'sm' ? 'px-4 py-2 text-sm' : '',
      size === 'md' ? 'px-12 py-4 text-xl' : '',
      size === 'lg' ? 'px-16 py-5 text-2xl' : '',

      // Variants
      variant === 'primary' ? 'bg-primary text-on-primary hover:bg-brand-700 hover:brightness-110' : '',
      variant === 'secondary' ? 'bg-surface text-text-primary border border-border hover:bg-surface-subtle' : '',
      variant === 'ghost' ? 'bg-transparent text-primary hover:bg-primary-soft' : '',

      // Disabled
      disabled ? 'opacity-50 cursor-not-allowed' : ''
    ]"
  >
    <slot />
  </button>
</template>
