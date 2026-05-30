<script setup lang="ts">
import { Gift, LayoutDashboard, LogOut, Settings, ShoppingCart, Sidebar } from 'lucide-vue-next';
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import SidebarButton from './SidebarButton.vue';
import SidebarSection from './SidebarSection.vue';
import Divider from './Divider.vue';
import { MOCK_AUTH_STORAGE_KEY } from '../../../constants/mockAuth';
import { eventsButtons } from '../../../mocks/sidebarButtons.mock.ts';
import { getShoppingItemCategories } from '../../../services/shoppingItems';
import type { ShoppingItemCategory } from '../../../types/ShoppingList';

const persons: string[] = ["Beatriz", "Itallo", "Heloisa", "Mauricio", "Brenda", "Carlos"];

const router = useRouter();
const isCollapsed = ref<boolean>(false);
const shoppingCategories = ref<ShoppingItemCategory[]>([]);
const isLoadingCategories = ref<boolean>(false);
const categoriesErrorMessage = ref<string>('');

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

function handleLogout() {
  localStorage.removeItem(MOCK_AUTH_STORAGE_KEY);
  void router.push('/login');
}

onMounted(() => {
  void loadShoppingCategories();
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
              'rounded-md p-1 text-text-muted transition duration-150 hover:bg-card hover:text-accent',
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
            v-for="person in persons"
            :key="person"
          >
            <SidebarButton
              :use-random-color="true"
              :title="person"
              :is-collapsed="isContentCollapsed"
              :route-to="person"
            />
          </div>
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
            v-for="button in eventsButtons"
            :key="button.title"
          >
            <SidebarButton
              :icon="button.icon"
              :title="button.title"
              :is-collapsed="isContentCollapsed"
              :route-to="button.title"
            />
          </div>
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
          :class="[isContentCollapsed ? 'mb-2 flex w-full items-center justify-center rounded-md p-1 hover:bg-card hover:text-accent' : 'flex w-full flex-row items-center gap-2 rounded-md px-2 py-1 hover:bg-card hover:text-accent']"
          @click="handleLogout"
        >
          <LogOut :size="18" />
          <span v-if="!isContentCollapsed">Sair</span>
        </button>
      </div>
    </footer>
  </aside>
</template>
