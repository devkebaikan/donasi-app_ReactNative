import {createPaymentInvoiceResult} from './donationService';
import type {ApiResponse} from '@/types/api';
import type {CreateDonationResult} from '@/types/payment';
import type {InfakPayload} from '@/types/infak';

export async function createInfak(
  payload: InfakPayload,
): Promise<ApiResponse<CreateDonationResult>> {
  const data = await createPaymentInvoiceResult(
    'infak',
    payload.paymentMethodId,
    payload.amount,
  );

  return {success: true, message: 'Infak berhasil dibuat', data};
}
