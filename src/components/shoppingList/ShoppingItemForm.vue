<script setup lang="ts">
import BaseButton from '../ui/BaseButton.vue';
import BaseSelect from '../ui/BaseSelect.vue';
import BaseTextField from '../ui/BaseTextField.vue';
import type { ShoppingItemCategory, ShoppingItemStatus } from '../../types/ShoppingList';
import type { ShoppingItemFormData } from '../../types/ShoppingItemForm';

const props = defineProps<{
  modelValue: ShoppingItemFormData;
  categories: ShoppingItemCategory[];
  statuses: ShoppingItemStatus[];
  isSaving: boolean;
  errorMessage: string;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: ShoppingItemFormData];
  submit: [];
  cancel: [];
}>();

function updateField<Key extends keyof ShoppingItemFormData>(key: Key, value: ShoppingItemFormData[Key]) {
  emit('update:modelValue', {
    ...props.modelValue,
    [key]: value,
  });
}
</script>

<template>
  <form
    class="flex flex-col gap-4"
    @submit.prevent="emit('submit')"
  >
    <BaseTextField
      :model-value="modelValue.title"
      label="Titulo"
      required
      @update:model-value="updateField('title', String($event))"
    />
    <BaseTextField
      :model-value="modelValue.link"
      label="Link"
      type="url"
      required
      @update:model-value="updateField('link', String($event))"
    />
    <BaseTextField
      :model-value="modelValue.price"
      label="Valor"
      type="number"
      min="0"
      step="0.01"
      required
      @update:model-value="updateField('price', Number($event))"
    />
    <div class="grid grid-cols-2 gap-3">
      <BaseSelect
        :model-value="modelValue.categoryId"
        label="Categoria"
        :options="categories"
        required
        @update:model-value="updateField('categoryId', $event)"
      />
      <BaseSelect
        :model-value="modelValue.statusId"
        label="Status"
        :options="statuses"
        required
        @update:model-value="updateField('statusId', $event)"
      />
    </div>
    <p
      v-if="errorMessage"
      class="text-sm text-text-secondary"
    >
      {{ errorMessage }}
    </p>
    <div class="flex justify-end gap-2">
      <BaseButton
        type="button"
        variant="secondary"
        :disabled="isSaving"
        @click="emit('cancel')"
      >
        Cancelar
      </BaseButton>
      <BaseButton
        type="submit"
        variant="primary"
        :disabled="isSaving"
      >
        {{ isSaving ? 'Salvando...' : 'Salvar' }}
      </BaseButton>
    </div>
  </form>
</template>
