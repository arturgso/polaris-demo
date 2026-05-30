import { api } from './api';
import type {
  NewShoppingItemCategoryDTO,
  NewShoppingItemDTO,
  ShoppingItem,
  ShoppingItemCategory,
  ShoppingItemFilters,
  ShoppingItemStatus,
  UpdateShoppingItemDTO,
} from '../types/ShoppingList';

export async function getShoppingItems(filters: ShoppingItemFilters = {}) {
  const { data } = await api.get<ShoppingItem[]>('/shopping-items', {
    params: filters,
  });

  return data;
}

export async function createShoppingItem(payload: NewShoppingItemDTO) {
  const { data } = await api.post<ShoppingItem>('/shopping-items', payload);

  return data;
}

export async function updateShoppingItem(itemId: number, payload: UpdateShoppingItemDTO) {
  const { data } = await api.patch<ShoppingItem>(`/shopping-items/${itemId}`, payload);

  return data;
}

export async function deleteShoppingItem(itemId: number) {
  await api.delete(`/shopping-items/${itemId}`);
}

export async function getShoppingItemStatuses() {
  const { data } = await api.get<ShoppingItemStatus[]>('/shopping-item-statuses');

  return data;
}

export async function getShoppingItemCategories() {
  const { data } = await api.get<ShoppingItemCategory[]>('/shopping-item-categories');

  return data;
}

export async function createShoppingItemCategory(payload: NewShoppingItemCategoryDTO) {
  const { data } = await api.post<ShoppingItemCategory>('/shopping-item-categories', payload);

  return data;
}

export async function deleteShoppingItemCategory(id: number) {
  await api.delete(`/shopping-item-categories/${id}`);
}
