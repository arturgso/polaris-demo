<script setup lang="ts">
import { Gift, LayoutDashboard, LogOut, Settings, ShoppingCart, Sidebar } from 'lucide-vue-next';
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { MOCK_AUTH_STORAGE_KEY } from '@/constants';
import { getEvents, getPersons, getShoppingItemCategories } from '@/services';
import type { Event, Person, ShoppingItemCategory } from '@/types';
import { Divider, SidebarButton, SidebarSection } from '@/components/ui/sidebar';

const router = useRouter();
const isCollapsed = ref<boolean>(false);
const shoppingCategories = ref<ShoppingItemCategory[]>([]);
const persons = ref<Person[]>([]);
const events = ref<Event[]>([]);
const isLoadingCategories = ref<boolean>(false);
const isLoadingPersons = ref<boolean>(false);
const isLoadingEvents = ref<boolean>(false);
const categoriesErrorMessage = ref<string>('');
const personsErrorMessage = ref<string>('');
const eventsErrorMessage = ref<string>('');

const props = withDefaults(defineProps<{
  isDrawer?: boolean;
  isDrawerOpen?: boolean;
}>(), {
  isDrawer: false,
  isDrawerOpen: false,
});

const emit = defineEmits<{
  collapse: [value: boolean];
  close: [];
}>();

const isContentCollapsed = computed(() => !props.isDrawer && isCollapsed.value);

function collapseSidebar() {
  if (props.isDrawer) {
    emit('close');
    return;
  }

  isCollapsed.value = !isCollapsed.value;

  emit('collapse', isCollapsed.value);
}

async function loadShoppingCategories() {
  isLoadingCategories.value = true;
  categoriesErrorMessage.value = '';

  try {
    shoppingCategories.value = await getShoppingItemCategories();
  } catch {
    categoriesErrorMessage.value = 'Nao foi possivel carregar categorias.';
  } finally {
    isLoadingCategories.value = false;
  }
}

async function loadPersons() {
  isLoadingPersons.value = true;
  personsErrorMessage.value = '';

  try {
    persons.value = await getPersons();
  } catch {
    personsErrorMessage.value = 'Nao foi possivel carregar pessoas.';
  } finally {
    isLoadingPersons.value = false;
  }
}

async function loadEvents() {
  isLoadingEvents.value = true;
  eventsErrorMessage.value = '';

  try {
    events.value = await getEvents();
  } catch {
    eventsErrorMessage.value = 'Nao foi possivel carregar eventos.';
  } finally {
    isLoadingEvents.value = false;
  }
}

function handleLogout() {
  localStorage.removeItem(MOCK_AUTH_STORAGE_KEY);
  void router.push('/login');
}

onMounted(() => {
  void loadShoppingCategories();
  void loadPersons();
  void loadEvents();
  window.addEventListener('polaris:persons-changed', loadPersons);
});

onUnmounted(() => {
  window.removeEventListener('polaris:persons-changed', loadPersons);
});
</script>

<template>
  <aside
    :class="[
      'fixed left-0 top-0 z-50 flex h-dvh flex-col justify-between border-r-2 border-border bg-surface transition-all duration-150',
      isDrawer ? 'w-72 max-w-[calc(100vw-2rem)] shadow-2xl lg:hidden' : 'hidden lg:flex',
      isDrawer ? (isDrawerOpen ? 'translate-x-0' : '-translate-x-full') : '',
      !isDrawer ? (isCollapsed ? 'w-14' : 'w-64') : ''
    ]"
  >
    <div class="min-h-0 overflow-y-auto">
      <div class="relative p-3">
        <div class="flex items-center justify-between gap-2">
          <h1
            v-if="!isContentCollapsed"
            class="text-2xl font-bold text-text-secondary"
          >
            Polaris
          </h1>

          <button
            type="button"
            :class="[
              'interactive-nudge rounded-md p-1 text-text-muted hover:bg-card hover:text-accent',
              isContentCollapsed ? 'mx-auto' : ''
            ]"
            aria-label="Alternar sidebar"
            @click="collapseSidebar"
          >
            <Sidebar :size="20" />
          </button>
        </div>
      </div>

      <Divider :class="[isContentCollapsed ? 'hidden' : '']" />

      <SidebarSection
        :enable-title="false"
        :is-sidebar-collapsed="isContentCollapsed"
      >
        <div :class="['flex flex-col', isContentCollapsed ? 'gap-2' : 'gap-1']">
          <SidebarButton
            :icon="LayoutDashboard"
            title="dashboard"
            :is-collapsed="isContentCollapsed"
            route-to="/"
          />
          <SidebarButton
            :icon="ShoppingCart"
            title="compras"
            :is-collapsed="isContentCollapsed"
            route-to="/shopping-list"
          />
          <SidebarButton
            :icon="Gift"
            title="presentes"
            :is-collapsed="isContentCollapsed"
            route-to="/gifts"
          />
        </div>
      </SidebarSection>

      <Divider />

      <SidebarSection
        :enable-title="true"
        title="Compras"
        :is-sidebar-collapsed="isContentCollapsed"
      >
        <div :class="['flex flex-col', isContentCollapsed ? 'gap-2' : 'gap-1']">
          <div
            v-if="isLoadingCategories"
            :class="[
              'text-xs text-text-muted',
              isContentCollapsed ? 'h-8 w-8 rounded-md bg-card' : 'px-2 py-1'
            ]"
          >
            <span v-if="!isContentCollapsed">Carregando...</span>
          </div>
          <div
            v-else-if="categoriesErrorMessage"
            :class="[
              'text-xs text-text-muted',
              isContentCollapsed ? 'h-8 w-8 rounded-md bg-card' : 'px-2 py-1'
            ]"
          >
            <span v-if="!isContentCollapsed">{{ categoriesErrorMessage }}</span>
          </div>
          <div
            v-else-if="shoppingCategories.length === 0"
            :class="[
              'text-xs text-text-muted',
              isContentCollapsed ? 'h-8 w-8 rounded-md bg-card' : 'px-2 py-1'
            ]"
          >
            <span v-if="!isContentCollapsed">Nenhuma categoria</span>
          </div>
          <template v-else>
            <div
              v-for="category in shoppingCategories"
              :key="category.id"
            >
              <SidebarButton
                :title="category.name"
                :color="category.color"
                :is-collapsed="isContentCollapsed"
                :route-to="{ path: '/shopping-list', query: { categoryId: category.id } }"
              />
            </div>
          </template>
        </div>
      </SidebarSection>

      <Divider />

      <SidebarSection
        :enable-title="true"
        title="Pessoas"
        :is-sidebar-collapsed="isContentCollapsed"
      >
        <div :class="['flex flex-col', isContentCollapsed ? 'gap-2' : 'gap-1']">
          <div
            v-if="isLoadingPersons"
            :class="[
              'text-xs text-text-muted',
              isContentCollapsed ? 'h-8 w-8 rounded-md bg-card' : 'px-2 py-1'
            ]"
          >
            <span v-if="!isContentCollapsed">Carregando...</span>
          </div>
          <div
            v-else-if="personsErrorMessage"
            :class="[
              'text-xs text-text-muted',
              isContentCollapsed ? 'h-8 w-8 rounded-md bg-card' : 'px-2 py-1'
            ]"
          >
            <span v-if="!isContentCollapsed">{{ personsErrorMessage }}</span>
          </div>
          <div
            v-else-if="persons.length === 0"
            :class="[
              'text-xs text-text-muted',
              isContentCollapsed ? 'h-8 w-8 rounded-md bg-card' : 'px-2 py-1'
            ]"
          >
            <span v-if="!isContentCollapsed">Nenhuma pessoa</span>
          </div>
          <template v-else>
            <div
              v-for="person in persons"
              :key="person.id"
            >
              <SidebarButton
                :use-random-color="true"
                :title="person.name"
                :is-collapsed="isContentCollapsed"
                :route-to="{ path: '/gifts', query: { personId: person.id } }"
              />
            </div>
          </template>
        </div>
      </SidebarSection>

      <Divider />

      <SidebarSection
        :enable-title="true"
        title="Eventos"
        :is-sidebar-collapsed="isContentCollapsed"
      >
        <div :class="['flex flex-col', isContentCollapsed ? 'gap-2' : 'gap-1']">
          <div
            v-if="isLoadingEvents"
            :class="[
              'text-xs text-text-muted',
              isContentCollapsed ? 'h-8 w-8 rounded-md bg-card' : 'px-2 py-1'
            ]"
          >
            <span v-if="!isContentCollapsed">Carregando...</span>
          </div>
          <div
            v-else-if="eventsErrorMessage"
            :class="[
              'text-xs text-text-muted',
              isContentCollapsed ? 'h-8 w-8 rounded-md bg-card' : 'px-2 py-1'
            ]"
          >
            <span v-if="!isContentCollapsed">{{ eventsErrorMessage }}</span>
          </div>
          <div
            v-else-if="events.length === 0"
            :class="[
              'text-xs text-text-muted',
              isContentCollapsed ? 'h-8 w-8 rounded-md bg-card' : 'px-2 py-1'
            ]"
          >
            <span v-if="!isContentCollapsed">Nenhum evento</span>
          </div>
          <template v-else>
            <div
              v-for="event in events"
              :key="event.id"
            >
              <SidebarButton
                :title="event.name"
                :color="event.color"
                :is-collapsed="isContentCollapsed"
                :route-to="{ path: '/gifts', query: { eventId: event.id } }"
              />
            </div>
          </template>
        </div>
      </SidebarSection>
    </div>
    <footer>
      <Divider />
      <div :class="[isContentCollapsed ? 'p-1' : 'p-3']">
        <SidebarButton
          :icon="Settings"
          title="configuracoes"
          :is-collapsed="isContentCollapsed"
          route-to="/settings"
        />
        <button
          type="button"
          :class="[isContentCollapsed ? 'interactive-nudge mb-2 flex w-full items-center justify-center rounded-md p-1 hover:bg-card hover:text-accent' : 'interactive-nudge flex w-full flex-row items-center gap-2 rounded-md px-2 py-1 hover:bg-card hover:text-accent']"
          @click="handleLogout"
        >
          <LogOut :size="18" />
          <span v-if="!isContentCollapsed">Sair</span>
        </button>
      </div>
    </footer>
  </aside>
</template>
