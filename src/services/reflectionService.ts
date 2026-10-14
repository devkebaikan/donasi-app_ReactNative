import {apiClient} from './apiClient';
import type {ApiResponse} from '@/types/api';
import type {Reflection, ReflectionDetail} from '@/types/reflection';

export interface ReflectionListParams {
  page: number;
  search: string;
}

export interface ReflectionListResult {
  items: Reflection[];
  hasMore: boolean;
}

export async function getReflectionList(
  params: ReflectionListParams,
): Promise<ApiResponse<ReflectionListResult>> {
  // Bukan URLSearchParams — tidak tersedia di runtime React Native/Hermes
  // tanpa polyfill tambahan (belum terinstall di project ini).
  const searchParam = params.search
    ? `&search=${encodeURIComponent(params.search)}`
    : '';
  const res = await apiClient.get<ApiResponse<ReflectionListResult>>(
    `/reflections?page=${params.page}${searchParam}`,
  );
  return res.data;
}

export async function getReflectionDetail(
  reflectionId: string,
): Promise<ApiResponse<ReflectionDetail>> {
  const res = await apiClient.get<ApiResponse<ReflectionDetail>>(
    `/reflections/${reflectionId}`,
  );
  return res.data;
}
