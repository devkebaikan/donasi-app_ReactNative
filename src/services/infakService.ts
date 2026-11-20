import {apiClient} from './apiClient';
import type {PaymentMethod} from '@/types/payment';

export interface InfakQrData {
  name: string;
  image_url: string;
  link?: string;
}

export interface InfakDonor {
  id: number;
  invoice: string;
  date: string;
  time?: string;
  created_at?: string;
  name: string;
  nominal_donasi: number;
  bank_name?: string;
  type?: string;
  account_behalf?: string;
  doa?: string | null;
  amin?: number;
  liked?: number;
  source?: string;
}

export interface InfakTransactionPayload {
  infaqId?: number;
  amount: number;
  paymentMethodId: number | string;
  name: string;
  phone: string;
  doa?: string;
  atas_nama?: string;
  is_anonymous?: number;
}

export interface InfakTransactionResult {
  invoice: string;
  donationId: string;
  invoiceId: string;
  paymentMethod?: string;
  bankName?: string;
  accountNumber?: string;
  qrCodeUrl?: string;
  amount: number;
  totalAmount: number;
  adminFee: number;
  expiredAt?: string;
}

export async function getInfakQrCode(): Promise<InfakQrData | null> {
  try {
    const res = await apiClient.get<{data?: InfakQrData; status: number}>('/infaq/qr-code');
    return res.data?.data || null;
  } catch {
    return {
      name: 'Infaq QR code',
      image_url: 'https://cdn.beramalbersama.com/settings/1790646965245_aa25a2_qris-beramal.webp',
      link: 'qr',
    };
  }
}

export async function getInfakProgramSetup(): Promise<number> {
  try {
    const res = await apiClient.get<{data?: {value?: string}; status: number}>('/program-setup/infaq');
    const val = res.data?.data?.value;
    return val ? Number(val) : 399;
  } catch {
    return 399;
  }
}

export async function getInfakDonors(limit = 15): Promise<InfakDonor[]> {
  try {
    const res = await apiClient.get<{data?: any}>('/programs/link/infaq/donors', {
      params: {limit},
    });
    const list = Array.isArray(res.data?.data)
      ? res.data.data
      : Array.isArray(res.data?.data?.data)
        ? res.data.data.data
        : [];
    return list;
  } catch {
    return [];
  }
}

export async function getInfakPaymentMethods(): Promise<PaymentMethod[]> {
  try {
    const res = await apiClient.get<{data?: any}>('/payment/payment-method', {
      params: {status: 'true', program_link: 'infaq'},
    });
    const items = Array.isArray(res.data?.data)
      ? res.data.data
      : Array.isArray(res.data?.data?.items)
        ? res.data.data.items
        : [];

    return items.map((m: any) => ({
      id: String(m.id),
      name: m.name || m.title || '',
      type: m.type || 'bank_transfer',
      code: m.code || String(m.id),
      image_url: m.image_url || m.logo || '',
      logoUrl: m.image_url || m.logo || '',
      account_number: m.account_number || '',
      account_behalf: m.account_holder || m.behalf_of || 'Sahabat Beramal Bersama',
      fee: Number(m.fee || m.admin_fee || 0),
      adminFee: Number(m.fee || m.admin_fee || 0),
      minimun_nominal: Number(m.min_amount || 1000),
      is_active: true,
    }));
  } catch {
    return [];
  }
}

export async function createInfak(payload: any): Promise<any> {
  const res = await submitInfakTransaction({
    amount: payload.amount,
    paymentMethodId: payload.paymentMethodId,
    name: payload.donaturName || 'Sahabat Kebaikan',
    phone: payload.donaturPhone || '',
    doa: payload.prayer,
    atas_nama: payload.onBehalfOf,
    is_anonymous: payload.isAnonymous ? 1 : 0,
  });
  return {success: true, message: 'OK', data: res};
}
export async function submitInfakTransaction(
  payload: InfakTransactionPayload,
): Promise<InfakTransactionResult> {
  const infaqId = payload.infaqId || 399;
  const rawBody: Record<string, any> = {
    type: 'donation',
    program_type: 'infaq',
    items: [infaqId],
    total: [payload.amount],
    payment_method_id: payload.paymentMethodId,
    name: payload.name,
    phone: payload.phone,
    status: 'Pending',
    ...(payload.doa ? {doa: payload.doa} : {}),
    ...(payload.atas_nama ? {atas_nama: payload.atas_nama} : {}),
    ...(payload.is_anonymous ? {is_anonymous: payload.is_anonymous} : {}),
  };

  const res = await apiClient.post<{
    data?: {
      invoice?: string;
      id?: number | string;
      donation_id?: number | string;
      amount?: number;
      total?: number;
      total_amount?: number;
      admin_fee?: number;
      va_number?: string;
      account_number?: string;
      qr_code?: string;
      expired_at?: string;
    };
  }>('/transactions', rawBody);

  const d = res.data?.data;
  const invoice = d?.invoice || `INF-${Date.now()}`;
  return {
    invoice,
    donationId: String(d?.donation_id || d?.id || invoice),
    invoiceId: invoice,
    accountNumber: d?.va_number || d?.account_number,
    qrCodeUrl: d?.qr_code,
    amount: payload.amount,
    totalAmount: Number(d?.total_amount || d?.total || payload.amount),
    adminFee: Number(d?.admin_fee || 0),
    expiredAt: d?.expired_at,
  };
}
