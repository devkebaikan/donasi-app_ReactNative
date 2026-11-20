import {apiClient} from './apiClient';
import type {ApiResponse} from '@/types/api';
import type {
  RecurringDonation,
  RecurringDonationDetail,
  UpdateRecurringDonationPayload,
} from '@/types/recurringDonation';

export interface MyRutinItem {
  id: string | number;
  status?: string;
  nominal?: number;
  range_type?: 'daily' | 'weekly' | 'monthly';
  range?: number | string;
  time?: string;
  program?: {
    id?: number | string;
    image?: string;
    title?: string;
    link?: string;
  };
}

export interface MyRutinListResponse {
  data: MyRutinItem[];
  meta?: {
    current_page: number;
    last_page: number;
    total: number;
  };
}

export interface RutinDetailData {
  id: string | number;
  status: string;
  invoicing?: {
    status: string;
    invoice: string;
    total: number;
  } | null;
  program?: {
    id?: number | string;
    title?: string;
    image?: string;
    link?: string;
  };
  nominal: number;
  time: string;
  range_type: string;
  range: string | number;
  commitment?: number | null;
  created_at?: string;
  summary?: {
    frekuensi_donasi?: number;
    total_donasi?: number;
  };
}

/**
 * Fetch list donasi rutin donatur
 * GET /dashboard/donatur/my-rutin?page=1
 */
export async function getMyRutinList(
  page = 1,
): Promise<ApiResponse<MyRutinItem[]>> {
  try {
    const res = await apiClient.get<any>(`/dashboard/donatur/my-rutin?page=${page}`);
    return {
      success: res.data?.status === 200 || res.data?.status === 'success' || Boolean(res.data?.data),
      data: res.data?.data ?? [],
      message: res.data?.message ?? '',
    };
  } catch (error: any) {
    return {
      success: false,
      data: [],
      message: error?.response?.data?.message || 'Gagal memuat donasi rutin',
    };
  }
}

/**
 * Fetch detail donasi rutin
 * GET /rutin/detail/:slug
 */
export async function getRutinDetail(
  slug: string | number,
): Promise<ApiResponse<RutinDetailData>> {
  try {
    const res = await apiClient.get<any>(`/rutin/detail/${slug}`);
    return {
      success: Boolean(res.data?.data || res.data?.id),
      data: res.data?.data ?? res.data,
      message: res.data?.message ?? '',
    };
  } catch (error: any) {
    return {
      success: false,
      data: null as unknown as RutinDetailData,
      message: error?.response?.data?.message || 'Gagal memuat detail donasi rutin',
    };
  }
}

/**
 * Hentikan donasi rutin
 * POST /dashboard/my-rutin/:id/stop
 */
export async function stopMyRutin(
  id: string | number,
): Promise<ApiResponse<any>> {
  try {
    const res = await apiClient.post<any>(`/dashboard/my-rutin/${id}/stop`);
    return {
      success: res.data?.status === 200 || res.data?.success === true,
      data: res.data?.data,
      message: res.data?.message ?? 'Donasi rutin berhasil dihentikan',
    };
  } catch (error: any) {
    return {
      success: false,
      data: null,
      message: error?.response?.data?.message || 'Gagal menghentikan donasi rutin',
    };
  }
}

/**
 * Program khusus donasi rutin
 * GET /program-show/rutin
 */
export async function getRutinPrograms(): Promise<ApiResponse<any[]>> {
  try {
    const res = await apiClient.get<any>('/program-show/rutin');
    return {
      success: Boolean(res.data?.data || Array.isArray(res.data)),
      data: Array.isArray(res.data) ? res.data : res.data?.data ?? [],
      message: '',
    };
  } catch (error: any) {
    return {
      success: false,
      data: [],
      message: error?.response?.data?.message || 'Gagal memuat program rutin',
    };
  }
}

/**
 * Program setup donasi rutin
 * GET /program-setup/:type
 */
export async function getProgramSetup(
  type = 'rutin',
): Promise<ApiResponse<any>> {
  try {
    const res = await apiClient.get<any>(`/program-setup/${type}`);
    return {
      success: true,
      data: res.data?.data ?? res.data,
      message: '',
    };
  } catch (error: any) {
    return {
      success: false,
      data: null,
      message: error?.response?.data?.message || '',
    };
  }
}

/**
 * Submit simpan komitmen donasi rutin
 * POST /rutin/store
 */
export async function storeRutin(
  payload: any,
): Promise<ApiResponse<any>> {
  try {
    const res = await apiClient.post<any>('/rutin/store', payload);
    return {
      success: res.data?.status === 200 || res.data?.status === 'success' || Boolean(res.data?.data),
      data: res.data?.data ?? res.data,
      message: res.data?.message ?? '',
    };
  } catch (error: any) {
    return {
      success: false,
      data: null,
      message: error?.response?.data?.message || 'Gagal menyimpan donasi rutin',
    };
  }
}

// Legacy fallback methods to support existing hooks during migration
export async function getRecurringDonations(): Promise<
  ApiResponse<RecurringDonation[]>
> {
  const res = await getMyRutinList(1);
  const items: RecurringDonation[] = (res.data || []).map(item => ({
    id: String(item.id),
    programTitle: item.program?.title ?? 'Donasi Rutin',
    programImageUrl: item.program?.image ?? '',
    amount: item.nominal ?? 0,
    frequency: (item.range_type || 'daily') as any,
    scheduleTime: item.time || '08:00',
    startDate: '',
    status: (item.status === 'active' ? 'AKTIF' : 'JEDA') as any,
    totalDonated: item.nominal ?? 0,
  }));
  return {
    success: true,
    data: items,
    message: '',
  };
}

export async function getRecurringDonationDetail(
  recurringId: string,
): Promise<ApiResponse<RecurringDonationDetail>> {
  const res = await getRutinDetail(recurringId);
  const item = res.data;
  return {
    success: res.success,
    data: {
      id: String(item?.id ?? recurringId),
      programTitle: item?.program?.title ?? 'Donasi Rutin',
      programImageUrl: item?.program?.image ?? '',
      amount: item?.nominal ?? 0,
      frequency: (item?.range_type || 'daily') as any,
      scheduleTime: item?.time || '08:00',
      startDate: item?.created_at ?? '',
      status: (item?.status === 'active' ? 'AKTIF' : 'JEDA') as any,
      totalDonated: item?.summary?.total_donasi ?? item?.nominal ?? 0,
      history: [],
    },
    message: res.message,
  };
}

export async function updateRecurringDonation(
  recurringId: string,
  payload: UpdateRecurringDonationPayload,
): Promise<ApiResponse<RecurringDonation>> {
  const res = await apiClient.put<ApiResponse<RecurringDonation>>(
    `/recurring-donations/${recurringId}`,
    payload,
  );
  return res.data;
}

export async function pauseRecurringDonation(
  recurringId: string,
): Promise<ApiResponse<RecurringDonation>> {
  return stopMyRutin(recurringId);
}

export async function resumeRecurringDonation(
  recurringId: string,
): Promise<ApiResponse<RecurringDonation>> {
  return {success: true, data: {} as any, message: ''};
}

export async function stopRecurringDonation(
  recurringId: string,
): Promise<ApiResponse<null>> {
  const res = await stopMyRutin(recurringId);
  return {success: res.success, data: null, message: res.message};
}
