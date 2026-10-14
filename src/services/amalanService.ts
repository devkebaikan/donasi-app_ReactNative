import {apiClient} from './apiClient';
import type {ApiResponse} from '@/types/api';
import type {
  Amalan,
  AmalanDayResult,
  AmalanPayload,
  AmalanPreset,
  AmalanSummary,
  AmalanToggleResult,
} from '@/types/amalan';

export async function getAmalanDay(
  date: string,
): Promise<ApiResponse<AmalanDayResult>> {
  // Bukan URLSearchParams — tidak tersedia di runtime React Native/Hermes
  // tanpa polyfill tambahan (belum terinstall di project ini).
  const res = await apiClient.get<ApiResponse<AmalanDayResult>>(
    `/amalan?date=${date}`,
  );
  return res.data;
}

export async function getAmalanPresets(): Promise<ApiResponse<AmalanPreset[]>> {
  const res = await apiClient.get<ApiResponse<AmalanPreset[]>>(
    '/amalan/presets',
  );
  return res.data;
}

export async function getAmalanSummary(
  start: string,
  end: string,
): Promise<ApiResponse<AmalanSummary[]>> {
  const res = await apiClient.get<ApiResponse<AmalanSummary[]>>(
    `/amalan/summary?start=${start}&end=${end}`,
  );
  return res.data;
}

export async function createAmalan(
  payload: AmalanPayload,
): Promise<ApiResponse<Amalan>> {
  const res = await apiClient.post<ApiResponse<Amalan>>('/amalan', payload);
  return res.data;
}

export async function updateAmalan(
  amalanId: string,
  payload: AmalanPayload,
): Promise<ApiResponse<Amalan>> {
  const res = await apiClient.put<ApiResponse<Amalan>>(
    `/amalan/${amalanId}`,
    payload,
  );
  return res.data;
}

export async function toggleAmalanComplete(
  amalanId: string,
): Promise<ApiResponse<AmalanToggleResult>> {
  // Tanpa body: status dibalik server, bukan dikirim client, supaya dua tap
  // beruntun tidak saling menimpa dengan nilai basi.
  const res = await apiClient.post<ApiResponse<AmalanToggleResult>>(
    `/amalan/${amalanId}/complete`,
  );
  return res.data;
}

export async function deleteAmalan(
  amalanId: string,
): Promise<ApiResponse<null>> {
  const res = await apiClient.delete<ApiResponse<null>>(`/amalan/${amalanId}`);
  return res.data;
}
