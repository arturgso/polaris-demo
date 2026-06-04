import {
  BEATRIZ_PERSON_ID,
  VAULT_GIFT_LISTS_STORAGE_KEY,
  VAULT_ITEMS_STORAGE_KEY,
  VAULT_PASSWORD,
} from '../constants';
import type {
  Gift,
  GiftFilters,
  NewGiftDTO,
  UpdateGiftDTO,
  VaultGiftItem,
  VaultGiftList,
} from '../types';

const INITIAL_GIFT_LIST_NAMES = ['Dia dos Namorados', 'Aniversario', 'Mesversario'];
let isVaultUnlocked = false;

function now() {
  return new Date().toISOString();
}

function parseStoredArray<T>(key: string): T[] {
  const value = localStorage.getItem(key);

  if (value === null) {
    return [];
  }

  try {
    const parsed = JSON.parse(value);

    return Array.isArray(parsed) ? parsed as T[] : [];
  } catch {
    return [];
  }
}

function saveStoredArray<T>(key: string, items: T[]) {
  localStorage.setItem(key, JSON.stringify(items));
}

function getNextId(items: Array<{ id: number }>) {
  return items.reduce((highestId, item) => Math.max(highestId, item.id), 0) + 1;
}

function notifyVaultChanged() {
  window.dispatchEvent(new Event('polaris:vault-changed'));
}

function normalizeOptional(value?: string) {
  const normalized = value?.trim();

  return normalized ? normalized : undefined;
}

function itemMatchesFilters(item: VaultGiftItem, filters: GiftFilters) {
  const title = filters.title?.trim().toLowerCase();
  const link = filters.link?.trim().toLowerCase();

  if (title && !item.title.toLowerCase().includes(title)) {
    return false;
  }

  if (link && !item.link?.toLowerCase().includes(link)) {
    return false;
  }

  if (filters.event && item.event !== filters.event) {
    return false;
  }

  if (filters.status && item.status !== filters.status) {
    return false;
  }

  return true;
}

function toGift(item: VaultGiftItem): Gift {
  return {
    id: item.id,
    title: item.title,
    link: item.link,
    giftFor: 'Beatriz',
    event: item.event,
    status: item.status,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}

function ensureVaultGiftListsSeeded() {
  const storedLists = parseStoredArray<VaultGiftList>(VAULT_GIFT_LISTS_STORAGE_KEY);

  if (storedLists.length > 0) {
    return storedLists;
  }

  const createdAt = now();
  const seededLists = INITIAL_GIFT_LIST_NAMES.map((name, index) => ({
    id: index + 1,
    name,
    createdAt,
    updatedAt: createdAt,
  }));

  saveStoredArray(VAULT_GIFT_LISTS_STORAGE_KEY, seededLists);

  return seededLists;
}

function ensureVaultGiftItemsSeeded() {
  const storedItems = parseStoredArray<VaultGiftItem>(VAULT_ITEMS_STORAGE_KEY);

  if (storedItems.length > 0) {
    return storedItems;
  }

  const lists = ensureVaultGiftListsSeeded();
  const createdAt = now();
  const seededItems: VaultGiftItem[] = [
    {
      id: 1,
      title: 'Buque de flores secas',
      link: 'https://example.com/buque-flores-secas',
      event: 'dia-dos-namorados',
      status: 'ideia',
      giftListId: lists[0]?.id,
      createdAt,
      updatedAt: createdAt,
    },
    {
      id: 2,
      title: 'Colar delicado dourado',
      link: 'https://example.com/colar-dourado',
      event: 'aniversario',
      status: 'pesquisando',
      giftListId: lists[1]?.id,
      createdAt,
      updatedAt: createdAt,
    },
    {
      id: 3,
      title: 'Livro de poesia contemporanea',
      event: 'aniversario',
      status: 'comprar',
      giftListId: lists[1]?.id,
      createdAt,
      updatedAt: createdAt,
    },
    {
      id: 4,
      title: 'Caixa de chocolates artesanais',
      link: 'https://example.com/chocolates-artesanais',
      event: 'mesversario',
      status: 'ideia',
      giftListId: lists[2]?.id,
      createdAt,
      updatedAt: createdAt,
    },
    {
      id: 5,
      title: 'Ingresso para jantar especial',
      event: 'dia-dos-namorados',
      status: 'reservado',
      giftListId: lists[0]?.id,
      createdAt,
      updatedAt: createdAt,
    },
  ];

  saveStoredArray(VAULT_ITEMS_STORAGE_KEY, seededItems);

  return seededItems;
}

export function unlockVault(password: string) {
  isVaultUnlocked = password === VAULT_PASSWORD;

  return isVaultUnlocked;
}

export function lockVault() {
  isVaultUnlocked = false;
}

export function hasVaultSession() {
  return isVaultUnlocked;
}

export function isBeatrizPerson(personId?: number) {
  return personId === BEATRIZ_PERSON_ID;
}

export function getVaultGiftItems(filters: GiftFilters = {}, giftListId?: number) {
  return ensureVaultGiftItemsSeeded()
    .filter((item) => giftListId === undefined || item.giftListId === giftListId)
    .filter((item) => itemMatchesFilters(item, filters));
}

export function getVaultGiftLists() {
  return ensureVaultGiftListsSeeded();
}

export function createVaultGiftList(name: string) {
  const lists = getVaultGiftLists();
  const timestamp = now();
  const list: VaultGiftList = {
    id: getNextId(lists),
    name: name.trim(),
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  saveStoredArray(VAULT_GIFT_LISTS_STORAGE_KEY, [...lists, list]);
  notifyVaultChanged();

  return list;
}

export function updateVaultGiftList(listId: number, name: string) {
  const lists = getVaultGiftLists();
  const updatedLists = lists.map((list) => (
    list.id === listId
      ? {
          ...list,
          name: name.trim(),
          updatedAt: now(),
        }
      : list
  ));

  saveStoredArray(VAULT_GIFT_LISTS_STORAGE_KEY, updatedLists);
  notifyVaultChanged();
}

export function deleteVaultGiftList(listId: number) {
  const lists = getVaultGiftLists().filter((list) => list.id !== listId);
  const items = parseStoredArray<VaultGiftItem>(VAULT_ITEMS_STORAGE_KEY).map((item) => (
    item.giftListId === listId
      ? {
          ...item,
          giftListId: undefined,
          updatedAt: now(),
        }
      : item
  ));

  saveStoredArray(VAULT_GIFT_LISTS_STORAGE_KEY, lists);
  saveStoredArray(VAULT_ITEMS_STORAGE_KEY, items);
  notifyVaultChanged();
}

export function createVaultGiftItem(payload: NewGiftDTO & { giftListId?: number }) {
  const items = parseStoredArray<VaultGiftItem>(VAULT_ITEMS_STORAGE_KEY);
  const timestamp = now();
  const item: VaultGiftItem = {
    id: getNextId(items),
    title: payload.title,
    link: normalizeOptional(payload.link),
    event: normalizeOptional(payload.event),
    status: normalizeOptional(payload.status),
    giftListId: payload.giftListId,
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  saveStoredArray(VAULT_ITEMS_STORAGE_KEY, [...items, item]);
  notifyVaultChanged();

  return item;
}

export function updateVaultGiftItem(itemId: number, payload: UpdateGiftDTO & { giftListId?: number }) {
  const items = parseStoredArray<VaultGiftItem>(VAULT_ITEMS_STORAGE_KEY);
  const updatedItems = items.map((item) => (
    item.id === itemId
      ? {
          ...item,
          title: payload.title ?? item.title,
          link: normalizeOptional(payload.link),
          event: normalizeOptional(payload.event),
          status: normalizeOptional(payload.status),
          giftListId: payload.giftListId,
          updatedAt: now(),
        }
      : item
  ));

  saveStoredArray(VAULT_ITEMS_STORAGE_KEY, updatedItems);
  notifyVaultChanged();
}

export function deleteVaultGiftItem(itemId: number) {
  const items = parseStoredArray<VaultGiftItem>(VAULT_ITEMS_STORAGE_KEY).filter((item) => item.id !== itemId);

  saveStoredArray(VAULT_ITEMS_STORAGE_KEY, items);
  notifyVaultChanged();
}

export function createGiftForBeatriz(payload: NewGiftDTO) {
  return toGift(createVaultGiftItem(payload));
}

export function moveGiftToVault(payload: UpdateGiftDTO) {
  createVaultGiftItem({
    title: payload.title ?? 'Presente',
    link: payload.link,
    personId: BEATRIZ_PERSON_ID,
    event: payload.event,
    status: payload.status,
  });
}
