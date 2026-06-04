import { createRouter, createWebHistory } from 'vue-router';
import {
  DashboardView,
  GiftsView,
  LoginView,
  SettingsView,
  ShoppingListView,
  VaultView,
} from '../views';
import { hasAuthSession, hasVaultSession } from '../services';

const routes = [
  {
    path: '/',
    name: 'dashboard',
    component: DashboardView,
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: '/login',
    name: 'login',
    component: LoginView,
  },
  {
    path: '/shopping-list',
    name: 'shoppingList',
    component: ShoppingListView,
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: '/gifts',
    name: 'gifts',
    component: GiftsView,
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: '/vault',
    name: 'vault',
    component: VaultView,
    meta: {
      requiresAuth: true,
      requiresVault: true,
    },
  },
  {
    path: '/settings',
    name: 'settings',
    component: SettingsView,
    meta: {
      requiresAuth: true,
    },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to) => {
  const isAuthenticated = hasAuthSession();

  if (to.meta.requiresAuth && !isAuthenticated) {
    return { path: '/login' };
  }

  if (to.meta.requiresVault && !hasVaultSession()) {
    return { path: '/', query: { vault: 'unlock' } };
  }

  if (to.path === '/login' && isAuthenticated) {
    return { path: '/' };
  }
});

export default router;
