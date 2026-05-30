<script setup lang="ts">
defineProps<{
  modelValue: number;
  label: string;
  options: Array<{
    id: number;
    name: string;
  }>;
  required?: boolean;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: number];
}>();

function handleChange(event: Event) {
  const target = event.target;

  if (!(target instanceof HTMLSelectElement)) {
    return;
  }

  emit('update:modelValue', Number(target.value));
}
</script>

<template>
  <label class="flex flex-col gap-2 text-sm font-semibold text-text-secondary">
    {{ label }}
    <select
      :value="modelValue"
      :required="required"
      class="h-10 rounded-md border-2 border-border bg-bg px-3 text-sm text-text-primary outline-none transition duration-150 focus:border-accent"
      @change="handleChange"
    >
      <option
        v-for="option in options"
        :key="option.id"
        :value="option.id"
      >
        {{ option.name }}
      </option>
    </select>
  </label>
</template>
