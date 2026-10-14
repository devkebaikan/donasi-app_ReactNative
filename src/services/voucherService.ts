import {apiClient} from './apiClient';
import type {ApiResponse} from '@/types/api';
import type {VoucherResult} from '@/types/voucher';

export async function applyVoucher(
  code: string,
): Promise<ApiResponse<VoucherResult>> {
  const res = await apiClient.post<ApiResponse<VoucherResult>>(
    '/vouchers/apply',
    {code},
  );
  return res.data;
}
