<script setup lang="ts">
withDefaults(defineProps<{
  type?: 'button' | 'submit';
  variant?: 'primary' | 'secondary' | 'ghost';
  disabled?: boolean;
}>(), {
  type: 'button',
  variant: 'secondary',
  disabled: false,
});
</script>

<template>
  <button
    :type="type"
    :disabled="disabled"
    class="flex h-10 items-center gap-2 rounded-md px-4 text-sm font-semibold transition duration-150 disabled:cursor-not-allowed disabled:opacity-60"
    :class="{
      'bg-accent text-bg hover:bg-accent-hover': variant === 'primary',
      'border-2 border-border text-text-secondary hover:border-accent hover:text-text-primary': variant === 'secondary',
      'px-3 text-text-secondary hover:bg-card hover:text-text-primary': variant === 'ghost',
    }"
  >
    <slot name="icon" />
    <slot />
  </button>
</template>
