import {apiClient} from './apiClient';
import type {ApiResponse} from '@/types/api';
import type {
  CreateDoaPayload,
  Doa,
  DoaBanner,
  DoaListResult,
  DoaTab,
  DoaToggleResult,
} from '@/types/doa';

export interface DoaListParams {
  page: number; // mulai dari 1
  tab: DoaTab;
}

export async function getDoaList(
  params: DoaListParams,
): Promise<ApiResponse<DoaListResult>> {
  // Bukan URLSearchParams — tidak tersedia di runtime React Native/Hermes
  // tanpa polyfill tambahan (belum terinstall di project ini).
  const res = await apiClient.get<ApiResponse<DoaListResult>>(
    `/doa?tab=${params.tab}&page=${params.page}`,
  );
  return res.data;
}

export async function getDoaBanners(): Promise<ApiResponse<DoaBanner[]>> {
  const res = await apiClient.get<ApiResponse<DoaBanner[]>>('/doa/banners');
  return res.data;
}

export async function createDoa(
  payload: CreateDoaPayload,
): Promise<ApiResponse<Doa>> {
  const res = await apiClient.post<ApiResponse<Doa>>('/doa', payload);
  return res.data;
}

export async function toggleDoaAmiin(
  doaId: string,
): Promise<ApiResponse<DoaToggleResult>> {
  const res = await apiClient.post<ApiResponse<DoaToggleResult>>(
    `/doa/${encodeURIComponent(doaId)}/amiin`,
  );
  return res.data;
}

export async function toggleDoaFavorite(
  doaId: string,
): Promise<ApiResponse<DoaToggleResult>> {
  const res = await apiClient.post<ApiResponse<DoaToggleResult>>(
    `/doa/${encodeURIComponent(doaId)}/favorite`,
  );
  return res.data;
}

export async function reportDoa(doaId: string): Promise<ApiResponse<null>> {
  const res = await apiClient.post<ApiResponse<null>>(
    `/doa/${encodeURIComponent(doaId)}/report`,
  );
  return res.data;
}
