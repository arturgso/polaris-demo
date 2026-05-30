<script setup lang="ts">
import type { FunctionalComponent } from 'vue';
import type { LucideProps } from 'lucide-vue-next';

const props = withDefaults(defineProps<{
  modelValue: string | number;
  label?: string;
  type?: 'email' | 'number' | 'password' | 'search' | 'text' | 'url';
  placeholder?: string;
  required?: boolean;
  min?: string;
  step?: string;
  icon?: FunctionalComponent<LucideProps>;
}>(), {
  label: '',
  type: 'text',
  placeholder: '',
  required: false,
  min: undefined,
  step: undefined,
  icon: undefined,
});

const emit = defineEmits<{
  'update:modelValue': [value: string | number];
}>();

function handleInput(event: Event) {
  const target = event.target;

  if (!(target instanceof HTMLInputElement)) {
    return;
  }

  emit('update:modelValue', props.type === 'number' ? target.valueAsNumber : target.value);
}
</script>

<template>
  <label
    class="flex flex-col gap-2 text-sm font-semibold text-text-secondary"
    :class="label ? '' : 'relative'"
  >
    <span v-if="label">{{ label }}</span>
    <component
      :is="icon"
      v-if="icon"
      :size="16"
      class="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
    />
    <input
      :value="modelValue"
      :type="type"
      :placeholder="placeholder"
      :required="required"
      :min="min"
      :step="step"
      class="h-10 rounded-md border-2 border-border px-3 text-sm text-text-primary outline-none transition duration-150 placeholder:text-text-muted focus:border-accent"
      :class="[icon ? 'pl-9' : '', label ? 'bg-bg' : 'bg-card']"
      @input="handleInput"
    >
  </label>
</template>
