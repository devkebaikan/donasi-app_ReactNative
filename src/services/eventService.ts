import {apiClient} from './apiClient';
import type {ApiResponse} from '@/types/api';
import type {Event} from '@/types/event';

// Path singular mengikuti gaya /amalan — endpoint ini mengembalikan satu objek
// event yang sedang dibuka, atau null kalau tidak ada. Bukan koleksi.
export async function getEvent(): Promise<ApiResponse<Event | null>> {
  const res = await apiClient.get<ApiResponse<Event | null>>('/event');
  return res.data;
}
