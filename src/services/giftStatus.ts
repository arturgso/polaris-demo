import { api } from '@/services/api';
import type { GiftStatus } from '@/types';

export async function getGiftStatuses() {
  const { data } = await api.get<GiftStatus[]>('/gift-statuses');

  return data;
}
