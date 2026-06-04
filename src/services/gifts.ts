import { api } from '@/services/api';
import type { Gift, GiftFilters, NewGiftDTO, UpdateGiftDTO } from '@/types';
import { BEATRIZ_PERSON_ID } from '../constants';
import {
  createGiftForBeatriz,
  moveGiftToVault,
} from './vault';

export async function getGifts(filters: GiftFilters = {}) {
  const { data } = await api.get<Gift[]>('/gifts', {
    params: filters,
  });

  return data;
}

export async function getGiftsByPerson(personId: number, filters: GiftFilters = {}) {
  const { data } = await api.get<Gift[]>('/gifts/by-person', {
    params: {
      personId,
      ...filters,
    },
  });

  return data;
}

export async function createGift(payload: NewGiftDTO) {
  if (payload.personId === BEATRIZ_PERSON_ID) {
    return createGiftForBeatriz(payload);
  }

  const { data } = await api.post<Gift>('/gifts', payload);

  return data;
}

export async function updateGift(giftId: number, payload: UpdateGiftDTO) {
  if (payload.giftFor === BEATRIZ_PERSON_ID) {
    moveGiftToVault(payload);
    await deleteGift(giftId);
    return;
  }

  await api.patch(`/gifts/${giftId}`, payload);
}

export async function deleteGift(giftId: number) {
  await api.delete(`/gifts/${giftId}`);
}
