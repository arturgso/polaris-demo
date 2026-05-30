<script setup lang="ts">
import BaseButton from '../ui/BaseButton.vue';
import BaseSelect from '../ui/BaseSelect.vue';
import BaseTextField from '../ui/BaseTextField.vue';
import { SHOPPING_ITEM_COLORS } from '../../constants/shoppingItemColors';
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

function updateColorFromEvent(event: Event) {
  updateField('color', (event.target as HTMLInputElement).value);
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
    <div class="flex flex-col gap-2 text-sm font-semibold text-text-secondary">
      <span>Cor</span>
      <div class="flex flex-wrap items-center gap-2">
        <button
          v-for="color in SHOPPING_ITEM_COLORS"
          :key="color"
          type="button"
          class="h-8 w-8 rounded-md border-2 border-border outline-none transition duration-150 hover:border-accent focus:border-accent"
          :class="modelValue.color === color ? 'border-accent ring-2 ring-accent/30' : ''"
          :style="{ backgroundColor: color }"
          :aria-label="`Selecionar cor ${color}`"
          @click="updateField('color', color)"
        />
        <label
          class="relative h-8 w-8 cursor-pointer overflow-hidden rounded-md border-2 border-border transition duration-150 hover:border-accent focus-within:border-accent"
          :class="!SHOPPING_ITEM_COLORS.includes(modelValue.color) ? 'border-accent ring-2 ring-accent/30' : ''"
          aria-label="Escolher cor personalizada"
        >
          <input
            :value="modelValue.color"
            type="color"
            class="h-full w-full cursor-pointer border-0 bg-transparent p-0"
            @input="updateColorFromEvent"
          >
        </label>
      </div>
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
