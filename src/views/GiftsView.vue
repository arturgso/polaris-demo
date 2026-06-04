<script setup lang="ts">
import { Edit2, Trash2 } from 'lucide-vue-next';
import { computed, onMounted, onUnmounted, ref, watch, watchEffect } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  BaseButton,
  BaseEmptyState,
  BaseModal,
  GiftCard,
  GiftForm,
  PersonForm,
} from '@/components';
import { BEATRIZ_PERSON_ID } from '@/constants';
import { showErrorToast, showSuccessToast, usePageHeader } from '@/composables';
import {
  deleteGift,
  deletePerson,
  getEvents,
  getGiftsByPerson,
  getGiftStatuses,
  getPerson,
  getPersons,
  updateGift,
  updatePerson,
} from '@/services';
import type {
  Event,
  Gift,
  GiftFilters,
  GiftFormData,
  GiftStatus,
  GiftWithPersonId,
  NewPersonDTO,
  Person,
  PersonFormData,
} from '@/types';

interface PersonGiftColumn {
  person: Person;
  gifts: GiftWithPersonId[];
}

const route = useRoute();
const router = useRouter();
const persons = ref<Person[]>([]);
const selectedPerson = ref<Person | null>(null);
const personGifts = ref<GiftWithPersonId[]>([]);
const giftColumns = ref<PersonGiftColumn[]>([]);
const events = ref<Event[]>([]);
const statuses = ref<GiftStatus[]>([]);
const isLoading = ref<boolean>(false);
const isSaving = ref<boolean>(false);
const isDeleting = ref<boolean>(false);
const errorMessage = ref<string>('');
const modalErrorMessage = ref<string>('');
const searchTerm = ref<string>('');
const selectedEventIds = ref<number[]>([]);
const selectedStatusIds = ref<number[]>([]);
const giftToEdit = ref<GiftWithPersonId | null>(null);
const giftToDelete = ref<GiftWithPersonId | null>(null);
const personToEdit = ref<Person | null>(null);
const personToDelete = ref<Person | null>(null);
const { resetPageHeader, setPageHeader } = usePageHeader();
let requestId = 0;
let searchTimeoutId: ReturnType<typeof setTimeout> | undefined;

const emptyPersonForm: PersonFormData = {
  name: '',
  birthdayMonth: '',
  birthdayDay: '',
};

const giftForm = ref<GiftFormData>({
  title: '',
  link: '',
  personId: 0,
  event: '',
  status: '',
});
const personForm = ref<PersonFormData>({ ...emptyPersonForm });

const currentPersonId = computed(() => getQueryId(route.query.personId));

const isPersonPage = computed(() => currentPersonId.value !== undefined);

const pageTitle = computed(() => {
  if (selectedPerson.value) {
    return `Presentes de ${selectedPerson.value.name}`;
  }

  return 'Presentes';
});

const hasActiveFilters = computed(() => selectedEventIds.value.length > 0 || selectedStatusIds.value.length > 0);

function toGiftWithPersonId(gift: Gift, personId: number): GiftWithPersonId {
  return {
    ...gift,
    personId,
  };
}

function getQueryId(value: unknown) {
  const queryValue = Array.isArray(value) ? value[0] : value;
  const parsedValue = Number(queryValue);

  return Number.isFinite(parsedValue) && parsedValue > 0 ? parsedValue : undefined;
}

function getQueryString(value: unknown) {
  const queryValue = Array.isArray(value) ? value[0] : value;

  return typeof queryValue === 'string' && queryValue ? queryValue : undefined;
}

function getSelectedTag(items: Array<{ id: number; tag: string }>, ids: number[], fallbackTag?: string) {
  const selectedId = ids.length === 1 ? ids[0] : undefined;

  return items.find((item) => item.id === selectedId)?.tag ?? fallbackTag;
}

function getGiftFilters(): GiftFilters {
  const title = searchTerm.value.trim();

  return {
    title: title || undefined,
    event: getSelectedTag(events.value, selectedEventIds.value, getQueryString(route.query.event)),
    status: getSelectedTag(statuses.value, selectedStatusIds.value, getQueryString(route.query.status)),
  };
}

function toggleFilter(filterValues: number[], value: number) {
  const isEventFilter = filterValues === selectedEventIds.value;
  const queryKey = isEventFilter ? 'event' : 'status';
  const selectedOption = (isEventFilter ? events.value : statuses.value).find((item) => item.id === value);

  if (!selectedOption) {
    return;
  }

  const currentTag = getQueryString(route.query[queryKey]);

  void router.replace({
    path: '/gifts',
    query: {
      ...route.query,
      eventId: undefined,
      statusId: undefined,
      [queryKey]: currentTag === selectedOption.tag ? undefined : selectedOption.tag,
    },
  });
}

function syncFiltersFromRoute() {
  const eventTag = getQueryString(route.query.event);
  const statusTag = getQueryString(route.query.status);
  const eventId = events.value.find((event) => event.tag === eventTag)?.id;
  const statusId = statuses.value.find((status) => status.tag === statusTag)?.id;

  selectedEventIds.value = eventId ? [eventId] : [];
  selectedStatusIds.value = statusId ? [statusId] : [];
}

function clearFilters() {
  void router.replace({
    path: '/gifts',
    query: {
      ...route.query,
      event: undefined,
      status: undefined,
      eventId: undefined,
      statusId: undefined,
    },
  });
}

function openEditGiftModal(gift: GiftWithPersonId) {
  giftForm.value = {
    title: gift.title,
    link: gift.link ?? '',
    personId: gift.personId,
    event: gift.event ?? events.value[0]?.tag ?? '',
    status: gift.status ?? statuses.value[0]?.tag ?? '',
  };
  modalErrorMessage.value = '';
  giftToEdit.value = gift;
}

function openDeleteGiftModal(gift: GiftWithPersonId) {
  modalErrorMessage.value = '';
  giftToDelete.value = gift;
}

function openEditPersonModal(person: Person) {
  personForm.value = {
    name: person.name,
    birthdayMonth: person.birthdayMonth ?? '',
    birthdayDay: person.birthdayDay ?? '',
  };
  modalErrorMessage.value = '';
  personToEdit.value = person;
}

function openDeletePersonModal(person: Person) {
  modalErrorMessage.value = '';
  personToDelete.value = person;
}

function toPersonPayload(): NewPersonDTO {
  return {
    name: personForm.value.name,
    birthdayMonth: personForm.value.birthdayMonth === '' ? undefined : personForm.value.birthdayMonth,
    birthdayDay: personForm.value.birthdayDay === '' ? undefined : personForm.value.birthdayDay,
  };
}

function notifyPersonsChanged() {
  window.dispatchEvent(new Event('polaris:persons-changed'));
}

async function loadOptions() {
  const [loadedEvents, loadedStatuses] = await Promise.all([
    getEvents(),
    getGiftStatuses(),
  ]);

  events.value = loadedEvents;
  statuses.value = loadedStatuses;
  syncFiltersFromRoute();
}

async function loadGiftsPage() {
  if (currentPersonId.value === BEATRIZ_PERSON_ID) {
    void router.replace({ path: '/', query: { vault: 'unlock' } });
    return;
  }

  const currentRequestId = requestId + 1;
  requestId = currentRequestId;
  isLoading.value = true;
  errorMessage.value = '';

  try {
    const loadedPersons = await getPersons();
    const loadedSelectedPerson = currentPersonId.value ? await getPerson(currentPersonId.value) : null;

    const visiblePersons = loadedPersons.filter((person) => person.id !== BEATRIZ_PERSON_ID);

    persons.value = visiblePersons;
    selectedPerson.value = loadedSelectedPerson;
    const filters = getGiftFilters();

    if (currentPersonId.value) {
      const gifts = await getGiftsByPerson(currentPersonId.value, filters);

      if (currentRequestId === requestId) {
        personGifts.value = gifts.map((gift) => toGiftWithPersonId(gift, currentPersonId.value as number));
        giftColumns.value = [];
      }

      return;
    }

    const giftsByPerson = await Promise.all(
      visiblePersons.map(async (person) => ({
        person,
        gifts: (await getGiftsByPerson(person.id, filters)).map((gift) => toGiftWithPersonId(gift, person.id)),
      })),
    );

    if (currentRequestId === requestId) {
      giftColumns.value = giftsByPerson;
      personGifts.value = [];
    }
  } catch {
    if (currentRequestId === requestId) {
      errorMessage.value = 'Nao foi possivel carregar presentes.';
      selectedPerson.value = null;
      giftColumns.value = [];
      personGifts.value = [];
    }
  } finally {
    if (currentRequestId === requestId) {
      isLoading.value = false;
    }
  }
}

async function submitGift() {
  const gift = giftToEdit.value;

  if (!gift) {
    return;
  }

  if (giftForm.value.personId === 0) {
    modalErrorMessage.value = 'Cadastre uma pessoa antes de salvar o presente.';
    return;
  }

  isSaving.value = true;
  modalErrorMessage.value = '';

  try {
    await updateGift(gift.id, {
      title: giftForm.value.title,
      link: giftForm.value.link || undefined,
      giftFor: giftForm.value.personId,
      event: giftForm.value.event || undefined,
      status: giftForm.value.status || undefined,
    });
    giftToEdit.value = null;

    await loadGiftsPage();
    window.dispatchEvent(new Event(giftForm.value.personId === BEATRIZ_PERSON_ID ? 'polaris:vault-changed' : 'polaris:gifts-changed'));
    showSuccessToast('Presente atualizado.');
  } catch {
    modalErrorMessage.value = 'Nao foi possivel salvar o presente.';
    showErrorToast('Nao foi possivel salvar o presente.');
  } finally {
    isSaving.value = false;
  }
}

async function confirmDeleteGift() {
  if (!giftToDelete.value) {
    return;
  }

  isDeleting.value = true;
  modalErrorMessage.value = '';

  try {
    await deleteGift(giftToDelete.value.id);
    giftToDelete.value = null;
    await loadGiftsPage();
    showSuccessToast('Presente deletado.');
  } catch {
    modalErrorMessage.value = 'Nao foi possivel deletar o presente.';
    showErrorToast('Nao foi possivel deletar o presente.');
  } finally {
    isDeleting.value = false;
  }
}

async function submitPerson() {
  if (!personToEdit.value) {
    return;
  }

  isSaving.value = true;
  modalErrorMessage.value = '';

  try {
    await updatePerson(personToEdit.value.id, toPersonPayload());
    personToEdit.value = null;

    notifyPersonsChanged();
    await loadGiftsPage();
    showSuccessToast('Pessoa atualizada.');
  } catch {
    modalErrorMessage.value = 'Nao foi possivel salvar a pessoa.';
    showErrorToast('Nao foi possivel salvar a pessoa.');
  } finally {
    isSaving.value = false;
  }
}

async function confirmDeletePerson() {
  if (!personToDelete.value) {
    return;
  }

  isDeleting.value = true;
  modalErrorMessage.value = '';

  try {
    const deletedPersonId = personToDelete.value.id;

    await deletePerson(deletedPersonId);
    personToDelete.value = null;
    notifyPersonsChanged();

    if (currentPersonId.value === deletedPersonId) {
      showSuccessToast('Pessoa deletada.');
      void router.push('/gifts');
      return;
    }

    await loadGiftsPage();
    showSuccessToast('Pessoa deletada.');
  } catch {
    modalErrorMessage.value = 'Nao foi possivel deletar a pessoa.';
    showErrorToast('Nao foi possivel deletar a pessoa.');
  } finally {
    isDeleting.value = false;
  }
}

onMounted(() => {
  void loadOptions();
  window.addEventListener('polaris:gifts-changed', loadGiftsPage);
  window.addEventListener('polaris:events-changed', loadOptions);
});

onUnmounted(() => {
  if (searchTimeoutId) {
    clearTimeout(searchTimeoutId);
  }

  window.removeEventListener('polaris:gifts-changed', loadGiftsPage);
  window.removeEventListener('polaris:events-changed', loadOptions);
  resetPageHeader();
});

watch(() => route.query, () => {
  syncFiltersFromRoute();
  void loadGiftsPage();
}, { immediate: true });

watch(searchTerm, () => {
  if (searchTimeoutId) {
    clearTimeout(searchTimeoutId);
  }

  searchTimeoutId = setTimeout(() => {
    void loadGiftsPage();
  }, 300);
});

watchEffect(() => {
  setPageHeader({
    title: pageTitle.value,
    subtitle: selectedPerson.value?.birthday ? `Aniversario: ${selectedPerson.value.birthday}` : '',
    searchTerm: searchTerm.value,
    searchPlaceholder: 'Pesquisar',
    filters: [
      {
        title: 'Eventos',
        items: events.value,
        selectedIds: selectedEventIds.value,
        onToggle: (id) => toggleFilter(selectedEventIds.value, id),
      },
      {
        title: 'Status',
        items: statuses.value,
        selectedIds: selectedStatusIds.value,
        onToggle: (id) => toggleFilter(selectedStatusIds.value, id),
      },
    ],
    hasActiveFilters: hasActiveFilters.value,
    onSearchTermChange: (value) => {
      searchTerm.value = value;
    },
    onClearFilters: clearFilters,
  });
});
</script>

<template>
  <div class="flex h-full flex-col gap-8">
    <div
      v-if="selectedPerson"
      class="flex flex-wrap items-center gap-2 rounded-md border-2 border-border bg-card p-3"
    >
      <span class="text-sm font-semibold text-text-secondary">{{ selectedPerson.name }}</span>
      <BaseButton
        variant="ghost"
        @click="openEditPersonModal(selectedPerson)"
      >
        <template #icon>
          <Edit2 :size="16" />
        </template>
        Editar
      </BaseButton>
      <BaseButton
        variant="ghost"
        @click="openDeletePersonModal(selectedPerson)"
      >
        <template #icon>
          <Trash2 :size="16" />
        </template>
        Deletar
      </BaseButton>
    </div>

    <BaseEmptyState
      v-if="isLoading"
      message="Carregando presentes..."
    />

    <div
      v-else-if="errorMessage"
      class="flex w-full items-center justify-between gap-4 rounded-md border-2 border-border bg-card p-6"
    >
      <p class="text-sm text-text-secondary">
        {{ errorMessage }}
      </p>
      <BaseButton
        variant="primary"
        @click="loadGiftsPage"
      >
        Tentar novamente
      </BaseButton>
    </div>

    <BaseEmptyState
      v-else-if="persons.length === 0"
      message="Nenhuma pessoa cadastrada."
    />

    <template v-else-if="isPersonPage">
      <BaseEmptyState
        v-if="personGifts.length === 0"
        :message="hasActiveFilters || searchTerm.trim() ? 'Nenhum presente encontrado para os filtros atuais.' : 'Nenhum presente encontrado para esta pessoa.'"
      />
      <div
        v-else
        class="grid w-full grid-cols-[repeat(auto-fit,minmax(min(100%,20rem),24rem))] items-start gap-5"
      >
        <div
          v-for="(gift, index) in personGifts"
          :key="gift.id"
          class="motion-card-enter"
          :style="{ '--motion-delay': `${index * 30}ms` }"
        >
          <GiftCard
            :gift="gift"
            :events="events"
            :statuses="statuses"
            @edit="openEditGiftModal(gift)"
            @delete="openDeleteGiftModal(gift)"
          />
        </div>
      </div>
    </template>

    <template v-else>
      <BaseEmptyState
        v-if="giftColumns.length === 0"
        message="Nenhum presente encontrado."
      />
      <BaseEmptyState
        v-else-if="(hasActiveFilters || searchTerm.trim()) && giftColumns.every((column) => column.gifts.length === 0)"
        message="Nenhum presente encontrado para os filtros atuais."
      />
      <div
        v-else
        class="grid w-full grid-cols-[repeat(auto-fit,minmax(min(100%,18rem),1fr))] items-start gap-5"
      >
        <section
          v-for="(column, columnIndex) in giftColumns"
          :key="column.person.id"
          class="motion-card-enter flex min-w-0 flex-col gap-3"
          :style="{ '--motion-delay': `${columnIndex * 35}ms` }"
        >
          <div class="flex items-center justify-between gap-2 rounded-md border-2 border-border bg-card p-3">
            <button
              type="button"
              class="min-w-0 truncate text-left text-sm font-bold text-text-primary transition duration-150 hover:text-accent"
              @click="router.push({ path: '/gifts', query: { personId: column.person.id } })"
            >
              {{ column.person.name }}
            </button>
            <div class="flex shrink-0 items-center gap-1">
              <button
                type="button"
                class="rounded-md p-1 text-text-muted transition duration-150 hover:bg-surface hover:text-text-primary"
                aria-label="Editar pessoa"
                @click="openEditPersonModal(column.person)"
              >
                <Edit2 :size="16" />
              </button>
              <button
                type="button"
                class="rounded-md p-1 text-text-muted transition duration-150 hover:bg-surface hover:text-text-primary"
                aria-label="Deletar pessoa"
                @click="openDeletePersonModal(column.person)"
              >
                <Trash2 :size="16" />
              </button>
            </div>
          </div>

          <BaseEmptyState
            v-if="column.gifts.length === 0"
            message="Sem presentes."
          />
          <div
            v-for="(gift, giftIndex) in column.gifts"
            :key="gift.id"
            class="motion-card-enter"
            :style="{ '--motion-delay': `${(columnIndex * 35) + ((giftIndex + 1) * 25)}ms` }"
          >
            <GiftCard
              :gift="gift"
              :events="events"
              :statuses="statuses"
              @edit="openEditGiftModal(gift)"
              @delete="openDeleteGiftModal(gift)"
            />
          </div>
        </section>
      </div>
    </template>
  </div>

  <BaseModal
    :is-open="giftToEdit !== null"
    title="Editar presente"
    @close="giftToEdit = null"
  >
    <GiftForm
      v-model="giftForm"
      :persons="persons"
      :events="events"
      :statuses="statuses"
      :is-saving="isSaving"
      :error-message="modalErrorMessage"
      @submit="submitGift"
      @cancel="giftToEdit = null"
    />
  </BaseModal>

  <BaseModal
    :is-open="personToEdit !== null"
    title="Editar pessoa"
    @close="personToEdit = null"
  >
    <PersonForm
      v-model="personForm"
      :is-saving="isSaving"
      :error-message="modalErrorMessage"
      @submit="submitPerson"
      @cancel="personToEdit = null"
    />
  </BaseModal>

  <BaseModal
    :is-open="giftToDelete !== null"
    title="Deletar presente"
    @close="giftToDelete = null"
  >
    <div class="flex flex-col gap-2">
      <p class="text-sm text-text-secondary">
        Tem certeza que deseja deletar este presente?
      </p>
      <p class="font-semibold text-text-primary">
        {{ giftToDelete?.title }}
      </p>
      <p
        v-if="modalErrorMessage"
        class="text-sm text-text-secondary"
      >
        {{ modalErrorMessage }}
      </p>
    </div>

    <template #footer>
      <BaseButton
        variant="secondary"
        :disabled="isDeleting"
        @click="giftToDelete = null"
      >
        Cancelar
      </BaseButton>
      <BaseButton
        variant="primary"
        :disabled="isDeleting"
        @click="confirmDeleteGift"
      >
        <template #icon>
          <Trash2 :size="16" />
        </template>
        {{ isDeleting ? 'Deletando...' : 'Deletar' }}
      </BaseButton>
    </template>
  </BaseModal>

  <BaseModal
    :is-open="personToDelete !== null"
    title="Deletar pessoa"
    @close="personToDelete = null"
  >
    <div class="flex flex-col gap-2">
      <p class="text-sm text-text-secondary">
        Tem certeza que deseja deletar esta pessoa?
      </p>
      <p class="font-semibold text-text-primary">
        {{ personToDelete?.name }}
      </p>
      <p
        v-if="modalErrorMessage"
        class="text-sm text-text-secondary"
      >
        {{ modalErrorMessage }}
      </p>
    </div>

    <template #footer>
      <BaseButton
        variant="secondary"
        :disabled="isDeleting"
        @click="personToDelete = null"
      >
        Cancelar
      </BaseButton>
      <BaseButton
        variant="primary"
        :disabled="isDeleting"
        @click="confirmDeletePerson"
      >
        <template #icon>
          <Trash2 :size="16" />
        </template>
        {{ isDeleting ? 'Deletando...' : 'Deletar' }}
      </BaseButton>
    </template>
  </BaseModal>
</template>
