<script setup lang="ts">
import { Gift, Plus, Search, ShoppingCart, User, X } from 'lucide-vue-next';
import { computed, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useClickOutside, usePageHeader } from '../composables';
import { DEFAULT_SHOPPING_ITEM_COLOR } from '../constants';
import {
  createGift,
  createPerson,
  createShoppingItem,
  getEvents,
  getGiftStatuses,
  getPersons,
  getShoppingItemCategories,
  getShoppingItemStatuses,
} from '../services';
import type {
  Event,
  GiftFormData,
  GiftStatus,
  NewPersonDTO,
  Person,
  PersonFormData,
  ShoppingItemCategory,
  ShoppingItemFormData,
  ShoppingItemStatus,
} from '../types';
import GiftForm from './Gifts/GiftForm.vue';
import PersonForm from './Gifts/PersonForm.vue';
import ShoppingFilterDropdown from './shoppingList/ShoppingFilterDropdown.vue';
import ShoppingItemForm from './shoppingList/ShoppingItemForm.vue';
import BaseButton from './ui/BaseButton.vue';
import BaseModal from './ui/BaseModal.vue';
import BaseTextField from './ui/BaseTextField.vue';

type CreationType = 'gift' | 'person' | 'shoppingItem';

const route = useRoute();
const { pageHeaderState } = usePageHeader();
const isNewMenuOpen = ref<boolean>(false);
const newMenuRef = ref<HTMLElement | null>(null);
const activeCreationType = ref<CreationType | null>(null);
const persons = ref<Person[]>([]);
const events = ref<Event[]>([]);
const giftStatuses = ref<GiftStatus[]>([]);
const shoppingCategories = ref<ShoppingItemCategory[]>([]);
const shoppingStatuses = ref<ShoppingItemStatus[]>([]);
const isSaving = ref<boolean>(false);
const modalErrorMessage = ref<string>('');

const emptyGiftForm: GiftFormData = {
  title: '',
  link: '',
  personId: 0,
  event: '',
  status: '',
};

const emptyPersonForm: PersonFormData = {
  name: '',
  birthdayMonth: '',
  birthdayDay: '',
};

const emptyShoppingItemForm: ShoppingItemFormData = {
  title: '',
  link: '',
  price: 0,
  color: DEFAULT_SHOPPING_ITEM_COLOR,
  categoryId: 0,
  statusId: 0,
};

const giftForm = ref<GiftFormData>({ ...emptyGiftForm });
const personForm = ref<PersonFormData>({ ...emptyPersonForm });
const shoppingItemForm = ref<ShoppingItemFormData>({ ...emptyShoppingItemForm });

const creationOptions = [
  {
    type: 'gift' as const,
    label: 'Presente',
    icon: Gift,
  },
  {
    type: 'person' as const,
    label: 'Pessoa',
    icon: User,
  },
  {
    type: 'shoppingItem' as const,
    label: 'Item de compra',
    icon: ShoppingCart,
  },
];

const modalTitle = computed(() => {
  if (activeCreationType.value === 'gift') {
    return 'Novo presente';
  }

  if (activeCreationType.value === 'person') {
    return 'Nova pessoa';
  }

  if (activeCreationType.value === 'shoppingItem') {
    return 'Novo item';
  }

  return 'Novo';
});

const displayTitle = computed(() => {
  if (pageHeaderState.title) {
    return pageHeaderState.title;
  }

  if (route.name === 'shoppingList') {
    return 'Lista de compras';
  }

  if (route.name === 'gifts' || route.name === 'personGifts') {
    return 'Presentes';
  }

  if (route.name === 'settings') {
    return 'Aparencia';
  }

  return 'Dashboard';
});

function resetGiftForm() {
  giftForm.value = {
    title: '',
    link: '',
    personId: persons.value[0]?.id ?? 0,
    event: events.value[0]?.name ?? '',
    status: giftStatuses.value[0]?.name ?? '',
  };
}

function resetPersonForm() {
  personForm.value = { ...emptyPersonForm };
}

function resetShoppingItemForm() {
  shoppingItemForm.value = {
    ...emptyShoppingItemForm,
    categoryId: shoppingCategories.value[0]?.id ?? 0,
    statusId: shoppingStatuses.value[0]?.id ?? 0,
  };
}

function closeCreationModal() {
  activeCreationType.value = null;
  modalErrorMessage.value = '';
}

function toPersonPayload(): NewPersonDTO {
  return {
    name: personForm.value.name,
    birthdayMonth: personForm.value.birthdayMonth === '' ? undefined : personForm.value.birthdayMonth,
    birthdayDay: personForm.value.birthdayDay === '' ? undefined : personForm.value.birthdayDay,
  };
}

function notify(eventName: string) {
  window.dispatchEvent(new Event(eventName));
}

async function loadGiftOptions() {
  const [loadedPersons, loadedEvents, loadedStatuses] = await Promise.all([
    getPersons(),
    getEvents(),
    getGiftStatuses(),
  ]);

  persons.value = loadedPersons;
  events.value = loadedEvents;
  giftStatuses.value = loadedStatuses;
}

async function loadShoppingOptions() {
  const [loadedCategories, loadedStatuses] = await Promise.all([
    getShoppingItemCategories(),
    getShoppingItemStatuses(),
  ]);

  shoppingCategories.value = loadedCategories;
  shoppingStatuses.value = loadedStatuses;
}

async function openCreation(type: CreationType) {
  isNewMenuOpen.value = false;
  modalErrorMessage.value = '';

  try {
    if (type === 'gift') {
      await loadGiftOptions();
      resetGiftForm();
    }

    if (type === 'person') {
      resetPersonForm();
    }

    if (type === 'shoppingItem') {
      await loadShoppingOptions();
      resetShoppingItemForm();
    }

    activeCreationType.value = type;
  } catch {
    modalErrorMessage.value = 'Nao foi possivel carregar as opcoes.';
    activeCreationType.value = type;
  }
}

async function submitGift() {
  if (giftForm.value.personId === 0) {
    modalErrorMessage.value = 'Cadastre uma pessoa antes de salvar o presente.';
    return;
  }

  isSaving.value = true;
  modalErrorMessage.value = '';

  try {
    await createGift({
      title: giftForm.value.title,
      link: giftForm.value.link || undefined,
      personId: giftForm.value.personId,
      event: giftForm.value.event || undefined,
      status: giftForm.value.status || undefined,
    });
    closeCreationModal();
    notify('polaris:gifts-changed');
  } catch {
    modalErrorMessage.value = 'Nao foi possivel salvar o presente.';
  } finally {
    isSaving.value = false;
  }
}

async function submitPerson() {
  isSaving.value = true;
  modalErrorMessage.value = '';

  try {
    await createPerson(toPersonPayload());
    closeCreationModal();
    notify('polaris:persons-changed');
    notify('polaris:gifts-changed');
  } catch {
    modalErrorMessage.value = 'Nao foi possivel salvar a pessoa.';
  } finally {
    isSaving.value = false;
  }
}

async function submitShoppingItem() {
  isSaving.value = true;
  modalErrorMessage.value = '';

  try {
    await createShoppingItem(shoppingItemForm.value);
    closeCreationModal();
    notify('polaris:shopping-items-changed');
  } catch {
    modalErrorMessage.value = 'Nao foi possivel salvar o item.';
  } finally {
    isSaving.value = false;
  }
}

useClickOutside(newMenuRef, () => {
  isNewMenuOpen.value = false;
});
</script>

<template>
  <header class="relative z-30 w-full border-b-2 border-border bg-surface px-4 pb-4 pt-20 sm:px-6 lg:min-h-16 lg:px-10 lg:py-3 xl:px-12">
    <div class="mx-auto flex h-full w-full max-w-7xl flex-col gap-4 lg:relative lg:block lg:min-h-10">
      <div class="flex min-w-0 flex-col gap-1 lg:absolute lg:left-0 lg:top-1/2 lg:max-w-[18rem] lg:-translate-y-1/2">
        <h1 class="truncate text-2xl font-bold text-text-secondary">
          {{ displayTitle }}
        </h1>
        <p
          v-if="pageHeaderState.subtitle"
          class="text-sm text-text-muted"
        >
          {{ pageHeaderState.subtitle }}
        </p>
      </div>

      <BaseTextField
        v-if="pageHeaderState.hasSearch"
        :model-value="pageHeaderState.searchTerm"
        type="search"
        :placeholder="pageHeaderState.searchPlaceholder"
        :icon="Search"
        class="w-full lg:absolute lg:left-1/2 lg:top-1/2 lg:w-[min(28rem,36vw)] lg:-translate-x-1/2 lg:-translate-y-1/2"
        @update:model-value="pageHeaderState.onSearchTermChange?.(String($event))"
      />
      <div v-else />

      <div class="flex flex-wrap items-center gap-2 lg:absolute lg:right-0 lg:top-1/2 lg:-translate-y-1/2 lg:flex-nowrap lg:justify-end">
        <ShoppingFilterDropdown
          v-for="filter in pageHeaderState.filters"
          :key="filter.title"
          :title="filter.title"
          :items="filter.items"
          :selected-ids="filter.selectedIds"
          @toggle="filter.onToggle"
        />

        <BaseButton
          v-if="pageHeaderState.hasActiveFilters"
          variant="secondary"
          @click="pageHeaderState.onClearFilters?.()"
        >
          <template #icon>
            <X :size="16" />
          </template>
          Limpar
        </BaseButton>

        <div
          ref="newMenuRef"
          class="relative"
        >
          <BaseButton
            variant="primary"
            @click="isNewMenuOpen = !isNewMenuOpen"
          >
            <template #icon>
              <Plus :size="18" />
            </template>
            Novo
          </BaseButton>

          <div
            v-if="isNewMenuOpen"
            class="absolute right-0 top-12 z-50 flex w-48 flex-col gap-1 rounded-md border-2 border-border bg-surface p-2 shadow-xl"
          >
            <button
              v-for="option in creationOptions"
              :key="option.type"
              type="button"
              class="flex items-center gap-2 rounded-sm px-2 py-2 text-left text-sm text-text-secondary transition duration-150 hover:bg-card hover:text-text-primary"
              @click="openCreation(option.type)"
            >
              <component
                :is="option.icon"
                :size="16"
                class="shrink-0"
              />
              {{ option.label }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </header>

  <BaseModal
    :is-open="activeCreationType !== null"
    :title="modalTitle"
    @close="closeCreationModal"
  >
    <GiftForm
      v-if="activeCreationType === 'gift'"
      v-model="giftForm"
      :persons="persons"
      :events="events"
      :statuses="giftStatuses"
      :is-saving="isSaving"
      :error-message="modalErrorMessage"
      @submit="submitGift"
      @cancel="closeCreationModal"
    />

    <PersonForm
      v-else-if="activeCreationType === 'person'"
      v-model="personForm"
      :is-saving="isSaving"
      :error-message="modalErrorMessage"
      @submit="submitPerson"
      @cancel="closeCreationModal"
    />

    <ShoppingItemForm
      v-else-if="activeCreationType === 'shoppingItem'"
      v-model="shoppingItemForm"
      :categories="shoppingCategories"
      :statuses="shoppingStatuses"
      :is-saving="isSaving"
      :error-message="modalErrorMessage"
      @submit="submitShoppingItem"
      @cancel="closeCreationModal"
    />
  </BaseModal>
</template>
