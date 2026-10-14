import {apiClient} from './apiClient';
import type {ApiResponse} from '@/types/api';
import type {TopupPayload, TopupResult} from '@/types/wallet';

export async function topupWallet(
  payload: TopupPayload,
): Promise<ApiResponse<TopupResult>> {
  const res = await apiClient.post<ApiResponse<TopupResult>>(
    '/wallet/topup',
    payload,
  );
  return res.data;
}
