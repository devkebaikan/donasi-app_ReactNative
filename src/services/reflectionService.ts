import {apiClient} from './apiClient';
import type {ApiResponse} from '@/types/api';
import type {Reflection, ReflectionDetail} from '@/types/reflection';
import localReflections from '@/assets/json/reflections.json';

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
  try {
    const searchParam = params.search
      ? `&search=${encodeURIComponent(params.search)}`
      : '';
    const res = await apiClient.get<ApiResponse<ReflectionListResult>>(
      `/reflections?page=${params.page}${searchParam}`,
    );
    if (res.data?.data?.items) {
      return res.data;
    }
  } catch (_e) {
    // Fallback defensif jika endpoint live backend 404
  }

  const all = (localReflections as unknown as ReflectionDetail[]) || [];
  const query = (params.search || '').trim().toLowerCase();
  const filtered = query
    ? all.filter(r => r.title.toLowerCase().includes(query))
    : all;
  const pageSize = 10;
  const start = Math.max(0, (params.page - 1) * pageSize);
  const pagedItems = filtered.slice(start, start + pageSize);

  return {
    status: 200,
    success: true,
    message: 'OK',
    data: {
      items: pagedItems,
      hasMore: start + pageSize < filtered.length,
    },
  };
}

export async function getReflectionDetail(
  reflectionId: string,
): Promise<ApiResponse<ReflectionDetail>> {
  try {
    const res = await apiClient.get<ApiResponse<ReflectionDetail>>(
      `/reflections/${reflectionId}`,
    );
    if (res.data?.data) {
      return res.data;
    }
  } catch (_e) {
    // Fallback defensif jika endpoint live backend 404
  }

  const all = (localReflections as unknown as ReflectionDetail[]) || [];
  const found: ReflectionDetail = all.find(r => r.id === reflectionId) ?? all[0] ?? {
    id: reflectionId,
    title: 'Renungan',
    imageUrl: '',
    publishedAt: new Date().toISOString(),
    shareUrl: '',
    imageWidth: 800,
    imageHeight: 1000,
  };

  return {
    status: 200,
    success: true,
    message: 'OK',
    data: found,
  };
}
