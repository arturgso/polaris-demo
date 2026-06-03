export type ShoppingItemStatusName = 'IDEA' | 'PLANNED' | 'TO_BUY' | 'BOUGHT' | 'CANCELED';

export type ShoppingItemCategoryName = 'TECH' | 'HEALTH' | 'MAKEUP' | 'OTHER';

export interface ShoppingItemStatus {
  id: number;
  name: ShoppingItemStatusName;
  color: string;
}

export interface ShoppingItemCategory {
  id: number;
  name: ShoppingItemCategoryName;
  color: string;
  createdAt?: string;
}

export interface ShoppingItem {
  id: number;
  title: string;
  link: string;
  price: number;
  category: ShoppingItemCategory;
  status: ShoppingItemStatus;
  createdAt: string;
  updatedAt: string;
}

export interface NewShoppingItemDTO {
  title: string;
  link: string;
  price: number;
  categoryId: number;
  statusId: number;
}

export interface UpdateShoppingItemDTO {
  title?: string;
  link?: string;
  price?: number;
  categoryId?: number;
  statusId?: number;
}

export interface NewShoppingItemCategoryDTO {
  name: ShoppingItemCategoryName;
  color: string;
}

export interface ShoppingItemFilters {
  title?: string;
  statusId?: number;
  categoryId?: number;
}
