<script setup lang="ts">
import { CalendarDays, Flower2, Gift, Plus, Search, ShoppingCart, Tags, User, UserPlus, X } from 'lucide-vue-next';
import { computed, ref } from 'vue';
import { useRoute } from 'vue-router';
import { BEATRIZ_PERSON_ID } from '../constants';
import {
  showErrorToast,
  showSuccessToast,
  useClickOutside,
  usePageHeader,
} from '../composables';
import {
  createEvent,
  createGift,
  createVaultGiftItem,
  createPerson,
  createShoppingItem,
  createShoppingItemCategory,
  getEvents,
  getGiftStatuses,
  getPersons,
  getShoppingItemCategories,
  getShoppingItemStatuses,
  getVaultGiftLists,
  signup,
} from '../services';
import type {
  Event,
  GiftFormData,
  GiftStatus,
  NewEventDTO,
  NewPersonDTO,
  NewShoppingItemCategoryDTO,
  Person,
  PersonFormData,
  ShoppingItemCategory,
  ShoppingItemFormData,
  ShoppingItemStatus,
  VaultGiftFormData,
  VaultGiftList,
} from '../types';
import GiftForm from './Gifts/GiftForm.vue';
import PersonForm from './Gifts/PersonForm.vue';
import ShoppingFilterDropdown from './shoppingList/ShoppingFilterDropdown.vue';
import ShoppingItemForm from './shoppingList/ShoppingItemForm.vue';
import BaseButton from './ui/BaseButton.vue';
import BaseModal from './ui/BaseModal.vue';
import BaseSelect from './ui/BaseSelect.vue';
import BaseTextField from './ui/BaseTextField.vue';

type CreationType = 'gift' | 'beatriz' | 'person' | 'shoppingItem' | 'shoppingCategory' | 'event' | 'user';

interface NameColorFormData {
  name: string;
  color: string;
}

interface UserFormData {
  username: string;
  password: string;
  passwordConfirmation: string;
}

const route = useRoute();
const { pageHeaderState } = usePageHeader();
const isNewMenuOpen = ref<boolean>(false);
const newMenuRef = ref<HTMLElement | null>(null);
const activeCreationType = ref<CreationType | null>(null);
const persons = ref<Person[]>([]);
const events = ref<Event[]>([]);
const giftStatuses = ref<GiftStatus[]>([]);
const vaultGiftLists = ref<VaultGiftList[]>([]);
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
  categoryId: 0,
  statusId: 0,
};

const emptyNameColorForm: NameColorFormData = {
  name: '',
  color: '',
};

const emptyUserForm: UserFormData = {
  username: '',
  password: '',
  passwordConfirmation: '',
};

const giftForm = ref<GiftFormData>({ ...emptyGiftForm });
const vaultGiftForm = ref<VaultGiftFormData>({
  title: '',
  link: '',
  event: '',
  status: '',
  giftListId: 0,
});
const personForm = ref<PersonFormData>({ ...emptyPersonForm });
const shoppingItemForm = ref<ShoppingItemFormData>({ ...emptyShoppingItemForm });
const shoppingCategoryForm = ref<NameColorFormData>({ ...emptyNameColorForm });
const eventForm = ref<NameColorFormData>({ ...emptyNameColorForm });
const userForm = ref<UserFormData>({ ...emptyUserForm });

const creationOptions = [
  {
    type: 'gift' as const,
    label: 'Presente',
    icon: Gift,
  },
  {
    type: 'beatriz' as const,
    label: 'Beatriz',
    icon: Flower2,
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
  {
    type: 'shoppingCategory' as const,
    label: 'Categoria de compra',
    icon: Tags,
  },
  {
    type: 'event' as const,
    label: 'Evento',
    icon: CalendarDays,
  },
  {
    type: 'user' as const,
    label: 'Usuario',
    icon: UserPlus,
  },
];

const modalTitle = computed(() => {
  if (activeCreationType.value === 'gift') {
    return 'Novo presente';
  }

  if (activeCreationType.value === 'beatriz') {
    return 'Novo presente da Beatriz';
  }

  if (activeCreationType.value === 'person') {
    return 'Nova pessoa';
  }

  if (activeCreationType.value === 'shoppingItem') {
    return 'Novo item';
  }

  if (activeCreationType.value === 'shoppingCategory') {
    return 'Nova categoria';
  }

  if (activeCreationType.value === 'event') {
    return 'Novo evento';
  }

  if (activeCreationType.value === 'user') {
    return 'Novo usuario';
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

  if (route.name === 'gifts') {
    return 'Presentes';
  }

  if (route.name === 'settings') {
    return 'Aparencia';
  }

  if (route.name === 'vault') {
    return 'Cofre';
  }

  return 'Dashboard';
});
const isDashboardHeader = computed(() => route.name === 'dashboard');
const vaultGiftListOptions = computed(() => [
  {
    id: 0,
    name: 'Sem lista',
  },
  ...vaultGiftLists.value.map((list) => ({
    id: list.id,
    name: list.name,
  })),
]);

function resetGiftForm() {
  giftForm.value = {
    title: '',
    link: '',
    personId: persons.value[0]?.id ?? 0,
    event: events.value[0]?.tag ?? '',
    status: giftStatuses.value[0]?.tag ?? '',
  };
}

function resetVaultGiftForm() {
  vaultGiftForm.value = {
    title: '',
    link: '',
    event: events.value[0]?.tag ?? '',
    status: giftStatuses.value[0]?.tag ?? '',
    giftListId: 0,
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

function resetShoppingCategoryForm() {
  shoppingCategoryForm.value = { ...emptyNameColorForm };
}

function resetEventForm() {
  eventForm.value = { ...emptyNameColorForm };
}

function resetUserForm() {
  userForm.value = { ...emptyUserForm };
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

function toNameColorPayload(form: NameColorFormData): NewEventDTO | NewShoppingItemCategoryDTO {
  const color = form.color.trim();

  return {
    name: form.name,
    color: color || undefined,
  };
}

function updateColor(form: NameColorFormData, event: globalThis.Event) {
  const target = event.target;

  if (!(target instanceof HTMLInputElement)) {
    return;
  }

  form.color = target.value;
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

  persons.value = loadedPersons.filter((person) => person.id !== BEATRIZ_PERSON_ID);
  events.value = loadedEvents;
  giftStatuses.value = loadedStatuses;
}

async function loadVaultGiftOptions() {
  const [loadedEvents, loadedStatuses] = await Promise.all([
    getEvents(),
    getGiftStatuses(),
  ]);

  events.value = loadedEvents;
  giftStatuses.value = loadedStatuses;
  vaultGiftLists.value = getVaultGiftLists();
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

    if (type === 'beatriz') {
      await loadVaultGiftOptions();
      resetVaultGiftForm();
    }

    if (type === 'person') {
      resetPersonForm();
    }

    if (type === 'shoppingItem') {
      await loadShoppingOptions();
      resetShoppingItemForm();
    }

    if (type === 'shoppingCategory') {
      resetShoppingCategoryForm();
    }

    if (type === 'event') {
      resetEventForm();
    }

    if (type === 'user') {
      resetUserForm();
    }

    activeCreationType.value = type;
  } catch {
    modalErrorMessage.value = 'Nao foi possivel carregar as opcoes.';
    showErrorToast('Nao foi possivel carregar as opcoes.');
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
    notify(giftForm.value.personId === BEATRIZ_PERSON_ID ? 'polaris:vault-changed' : 'polaris:gifts-changed');
    showSuccessToast('Presente salvo.');
  } catch {
    modalErrorMessage.value = 'Nao foi possivel salvar o presente.';
    showErrorToast('Nao foi possivel salvar o presente.');
  } finally {
    isSaving.value = false;
  }
}

function submitVaultGift() {
  if (!vaultGiftForm.value.title.trim()) {
    modalErrorMessage.value = 'Informe o titulo.';
    return;
  }

  isSaving.value = true;
  modalErrorMessage.value = '';

  try {
    createVaultGiftItem({
      title: vaultGiftForm.value.title,
      link: vaultGiftForm.value.link || undefined,
      personId: BEATRIZ_PERSON_ID,
      event: vaultGiftForm.value.event || undefined,
      status: vaultGiftForm.value.status || undefined,
      giftListId: vaultGiftForm.value.giftListId || undefined,
    });
    closeCreationModal();
    notify('polaris:vault-changed');
    showSuccessToast('Presente salvo.');
  } catch {
    modalErrorMessage.value = 'Nao foi possivel salvar o presente.';
    showErrorToast('Nao foi possivel salvar o presente.');
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
    showSuccessToast('Pessoa salva.');
  } catch {
    modalErrorMessage.value = 'Nao foi possivel salvar a pessoa.';
    showErrorToast('Nao foi possivel salvar a pessoa.');
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
    showSuccessToast('Item salvo.');
  } catch {
    modalErrorMessage.value = 'Nao foi possivel salvar o item.';
    showErrorToast('Nao foi possivel salvar o item.');
  } finally {
    isSaving.value = false;
  }
}

async function submitShoppingCategory() {
  isSaving.value = true;
  modalErrorMessage.value = '';

  try {
    await createShoppingItemCategory(toNameColorPayload(shoppingCategoryForm.value));
    closeCreationModal();
    notify('polaris:shopping-categories-changed');
    notify('polaris:shopping-items-changed');
    showSuccessToast('Categoria salva.');
  } catch {
    modalErrorMessage.value = 'Nao foi possivel salvar a categoria.';
    showErrorToast('Nao foi possivel salvar a categoria.');
  } finally {
    isSaving.value = false;
  }
}

async function submitEvent() {
  isSaving.value = true;
  modalErrorMessage.value = '';

  try {
    await createEvent(toNameColorPayload(eventForm.value));
    closeCreationModal();
    notify('polaris:events-changed');
    notify('polaris:gifts-changed');
    showSuccessToast('Evento salvo.');
  } catch {
    modalErrorMessage.value = 'Nao foi possivel salvar o evento.';
    showErrorToast('Nao foi possivel salvar o evento.');
  } finally {
    isSaving.value = false;
  }
}

async function submitUser() {
  const username = userForm.value.username.trim();

  if (username === '') {
    modalErrorMessage.value = 'Informe o usuario.';
    return;
  }

  if (userForm.value.password.length < 6) {
    modalErrorMessage.value = 'A senha deve ter pelo menos 6 caracteres.';
    return;
  }

  if (userForm.value.password !== userForm.value.passwordConfirmation) {
    modalErrorMessage.value = 'A confirmacao de senha deve ser igual a senha.';
    return;
  }

  isSaving.value = true;
  modalErrorMessage.value = '';

  try {
    await signup({
      username,
      password: userForm.value.password,
    });
    closeCreationModal();
    showSuccessToast('Usuario criado.');
  } catch {
    modalErrorMessage.value = 'Nao foi possivel criar o usuario.';
    showErrorToast('Nao foi possivel criar o usuario.');
  } finally {
    isSaving.value = false;
  }
}

useClickOutside(newMenuRef, () => {
  isNewMenuOpen.value = false;
});
</script>

<template>
  <header class="relative z-30 w-full border-b-2 border-border bg-surface px-4 pb-4 pt-16 sm:px-6 lg:min-h-16 lg:px-10 lg:py-3 xl:px-12">
    <div
      :class="[
        'mx-auto flex h-full w-full max-w-7xl gap-3 lg:relative lg:block lg:min-h-10',
        isDashboardHeader ? 'flex-row items-center justify-between' : 'flex-col'
      ]"
    >
      <div
        :class="[
          'flex min-w-0 flex-col gap-1 lg:absolute lg:left-0 lg:top-1/2 lg:max-w-[18rem] lg:-translate-y-1/2',
          isDashboardHeader ? 'flex-1' : ''
        ]"
      >
        <h1 class="truncate text-xl font-bold text-text-secondary sm:text-2xl">
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

      <div
        :class="[
          'flex flex-wrap items-center gap-2 lg:absolute lg:right-0 lg:top-1/2 lg:-translate-y-1/2 lg:flex-nowrap lg:justify-end',
          isDashboardHeader ? 'shrink-0 justify-end' : ''
        ]"
      >
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

          <Transition name="fade-scale">
            <div
              v-if="isNewMenuOpen"
              class="absolute right-0 top-12 z-50 flex w-48 origin-top-right flex-col gap-1 rounded-md border-2 border-border bg-surface p-2 shadow-xl"
            >
              <button
                v-for="option in creationOptions"
                :key="option.type"
                type="button"
                class="interactive-nudge flex items-center gap-2 rounded-sm px-2 py-2 text-left text-sm text-text-secondary hover:bg-card hover:text-text-primary"
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
          </Transition>
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

    <form
      v-else-if="activeCreationType === 'beatriz'"
      class="flex flex-col gap-4"
      @submit.prevent="submitVaultGift"
    >
      <BaseTextField
        v-model="vaultGiftForm.title"
        label="Titulo"
        required
      />
      <BaseTextField
        v-model="vaultGiftForm.link"
        label="Link"
        type="url"
      />
      <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <BaseSelect
          :model-value="events.find((event) => event.tag === vaultGiftForm.event)?.id ?? 0"
          label="Evento"
          :options="events.map((event) => ({ id: event.id, name: event.name }))"
          @update:model-value="vaultGiftForm.event = events.find((event) => event.id === $event)?.tag ?? ''"
        />
        <BaseSelect
          :model-value="giftStatuses.find((status) => status.tag === vaultGiftForm.status)?.id ?? 0"
          label="Status"
          :options="giftStatuses.map((status) => ({ id: status.id, name: status.name }))"
          @update:model-value="vaultGiftForm.status = giftStatuses.find((status) => status.id === $event)?.tag ?? ''"
        />
      </div>
      <BaseSelect
        v-model="vaultGiftForm.giftListId"
        label="Lista de presentes"
        :options="vaultGiftListOptions"
      />
      <p
        v-if="modalErrorMessage"
        class="text-sm text-text-secondary"
      >
        {{ modalErrorMessage }}
      </p>
      <div class="flex flex-wrap justify-end gap-2">
        <BaseButton
          type="button"
          variant="secondary"
          :disabled="isSaving"
          @click="closeCreationModal"
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

    <form
      v-else-if="activeCreationType === 'shoppingCategory'"
      class="flex flex-col gap-4"
      @submit.prevent="submitShoppingCategory"
    >
      <BaseTextField
        :model-value="shoppingCategoryForm.name"
        label="Nome"
        required
        @update:model-value="shoppingCategoryForm.name = String($event)"
      />
      <div class="flex items-end gap-3">
        <BaseTextField
          :model-value="shoppingCategoryForm.color"
          label="Cor"
          placeholder="#22c55e"
          class="flex-1"
          @update:model-value="shoppingCategoryForm.color = String($event)"
        />
        <label class="flex size-10 shrink-0 cursor-pointer rounded-md border-2 border-border bg-bg p-1 transition duration-150 hover:border-accent">
          <span class="sr-only">Selecionar cor da categoria</span>
          <input
            :value="shoppingCategoryForm.color || '#22c55e'"
            type="color"
            class="size-full cursor-pointer rounded-sm border-0 bg-transparent p-0"
            @input="updateColor(shoppingCategoryForm, $event)"
          >
        </label>
      </div>
      <p
        v-if="modalErrorMessage"
        class="text-sm text-text-secondary"
      >
        {{ modalErrorMessage }}
      </p>
      <div class="flex flex-wrap justify-end gap-2">
        <BaseButton
          type="button"
          variant="secondary"
          :disabled="isSaving"
          @click="closeCreationModal"
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

    <form
      v-else-if="activeCreationType === 'event'"
      class="flex flex-col gap-4"
      @submit.prevent="submitEvent"
    >
      <BaseTextField
        :model-value="eventForm.name"
        label="Nome"
        required
        @update:model-value="eventForm.name = String($event)"
      />
      <div class="flex items-end gap-3">
        <BaseTextField
          :model-value="eventForm.color"
          label="Cor"
          placeholder="#22c55e"
          class="flex-1"
          @update:model-value="eventForm.color = String($event)"
        />
        <label class="flex size-10 shrink-0 cursor-pointer rounded-md border-2 border-border bg-bg p-1 transition duration-150 hover:border-accent">
          <span class="sr-only">Selecionar cor do evento</span>
          <input
            :value="eventForm.color || '#22c55e'"
            type="color"
            class="size-full cursor-pointer rounded-sm border-0 bg-transparent p-0"
            @input="updateColor(eventForm, $event)"
          >
        </label>
      </div>
      <p
        v-if="modalErrorMessage"
        class="text-sm text-text-secondary"
      >
        {{ modalErrorMessage }}
      </p>
      <div class="flex flex-wrap justify-end gap-2">
        <BaseButton
          type="button"
          variant="secondary"
          :disabled="isSaving"
          @click="closeCreationModal"
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

    <form
      v-else-if="activeCreationType === 'user'"
      class="flex flex-col gap-4"
      @submit.prevent="submitUser"
    >
      <BaseTextField
        :model-value="userForm.username"
        label="Usuario"
        required
        @update:model-value="userForm.username = String($event)"
      />
      <BaseTextField
        :model-value="userForm.password"
        label="Senha"
        type="password"
        required
        @update:model-value="userForm.password = String($event)"
      />
      <BaseTextField
        :model-value="userForm.passwordConfirmation"
        label="Confirmar senha"
        type="password"
        required
        @update:model-value="userForm.passwordConfirmation = String($event)"
      />
      <p
        v-if="modalErrorMessage"
        class="text-sm text-text-secondary"
      >
        {{ modalErrorMessage }}
      </p>
      <div class="flex flex-wrap justify-end gap-2">
        <BaseButton
          type="button"
          variant="secondary"
          :disabled="isSaving"
          @click="closeCreationModal"
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
  </BaseModal>
</template>
