import {apiClient} from './apiClient';
import type {ApiResponse} from '@/types/api';
import type {
  RecurringDonation,
  RecurringDonationDetail,
  UpdateRecurringDonationPayload,
} from '@/types/recurringDonation';

// Seluruh data donasi rutin sekarang datang dari dua sumber mock yang sama
// dengan fitur lain — mockRouter.ts (aktif saat USE_MOCK_DATA=true, ini yang
// jalan di APK demo) dan json-server/middleware.js. Sebelumnya file ini
// memegang seed, riwayat, dan mutasinya sendiri tanpa pernah menyentuh
// apiClient, satu-satunya service di project ini yang begitu.
// Lihat docs/08-features/donasi-rutin/donasi-rutin-mock.md.
//
// Latensi tidak diatur di sini: apiClient sudah menambahkan MOCK_LATENCY_MS
// untuk semua request mock.

export async function getRecurringDonations(): Promise<
  ApiResponse<RecurringDonation[]>
> {
  const res = await apiClient.get<ApiResponse<RecurringDonation[]>>(
    '/recurring-donations',
  );
  return res.data;
}

export async function getRecurringDonationDetail(
  recurringId: string,
): Promise<ApiResponse<RecurringDonationDetail>> {
  const res = await apiClient.get<ApiResponse<RecurringDonationDetail>>(
    `/recurring-donations/${recurringId}`,
  );
  return res.data;
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
  const res = await apiClient.patch<ApiResponse<RecurringDonation>>(
    `/recurring-donations/${recurringId}/pause`,
  );
  return res.data;
}

export async function resumeRecurringDonation(
  recurringId: string,
): Promise<ApiResponse<RecurringDonation>> {
  const res = await apiClient.patch<ApiResponse<RecurringDonation>>(
    `/recurring-donations/${recurringId}/resume`,
  );
  return res.data;
}

export async function stopRecurringDonation(
  recurringId: string,
): Promise<ApiResponse<null>> {
  const res = await apiClient.delete<ApiResponse<null>>(
    `/recurring-donations/${recurringId}`,
  );
  return res.data;
}
