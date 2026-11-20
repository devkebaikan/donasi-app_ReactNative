import {apiClient} from './apiClient';
import type {PaymentMethod} from '@/types/payment';

export interface CampaignRoutinePackage {
  nominal: number;
  dailyText: string;
  monthlyText: string;
  days: number;
  total: number;
  label?: string;
  isPopular?: boolean;
}

export const ROUTINE_PACKAGES: CampaignRoutinePackage[] = [
  {
    nominal: 1000,
    dailyText: 'Rp1.000 / hari',
    monthlyText: 'Rp30.000 / 30 hari',
    days: 30,
    total: 30000,
    label: '1.000 x 30',
    isPopular: false,
  },
  {
    nominal: 2000,
    dailyText: 'Rp2.000 / hari',
    monthlyText: 'Rp60.000 / 30 hari',
    days: 30,
    total: 60000,
    label: '2.000 x 30',
    isPopular: false,
  },
  {
    nominal: 3000,
    dailyText: 'Rp3.000 / hari',
    monthlyText: 'Rp90.000 / 30 hari',
    days: 30,
    total: 90000,
    label: '3.000 x 30',
    isPopular: false,
  },
  {
    nominal: 5000,
    dailyText: 'Rp5.000 / hari',
    monthlyText: 'Rp150.000 / 30 hari',
    days: 30,
    total: 150000,
    label: '5.000 x 30',
    isPopular: true,
  },
  {
    nominal: 10000,
    dailyText: 'Rp10.000 / hari',
    monthlyText: 'Rp300.000 / 30 hari',
    days: 30,
    total: 300000,
    label: '10.000 x 30',
    isPopular: false,
  },
];

export interface StoreCampaignRoutinePayload {
  programId?: number | string;
  total: number;
  nominal: number;
  days?: number;
  paymentMethodId: number | string;
  name: string;
  phone: string;
  email?: string;
  atas_nama?: string;
  doa?: string;
  is_anonymous?: number;
}

export interface StoreCampaignRoutineResult {
  invoice: string;
  donationId: string;
  totalAmount: number;
  accountNumber?: string;
  bankName?: string;
}

export async function getDefaultRoutineProgramId(): Promise<string> {
  try {
    const res = await apiClient.get<{data?: {value?: string}}>('/program-setup/rutin');
    return res.data?.data?.value ?? '3';
  } catch {
    return '3';
  }
}

export async function storeCampaignRoutine(
  payload: StoreCampaignRoutinePayload,
): Promise<StoreCampaignRoutineResult> {
  const programId = payload.programId || (await getDefaultRoutineProgramId());
  const body = {
    program_id: Number(programId),
    total: payload.total,
    nominal: payload.nominal,
    commitment: payload.days || 30,
    type: 'commitment',
    payment_method_id: Number(payload.paymentMethodId),
    status: 'Pending',
    name: payload.name,
    phone: payload.phone,
    ...(payload.email ? {email: payload.email} : {}),
    ...(payload.atas_nama ? {atas_nama: payload.atas_nama} : {}),
    ...(payload.doa ? {doa: payload.doa} : {}),
    ...(payload.is_anonymous ? {is_anonymous: payload.is_anonymous} : {}),
  };

  const res = await apiClient.post<{
    data?: {
      invoice?: string;
      id?: number | string;
      total?: number;
      account_number?: string;
      bank_name?: string;
    };
  }>('/rutin/store', body);

  const inv = res.data?.data?.invoice || `RUT-${Date.now()}`;
  return {
    invoice: inv,
    donationId: String(res.data?.data?.id || inv),
    totalAmount: Number(res.data?.data?.total || payload.total),
    accountNumber: res.data?.data?.account_number,
    bankName: res.data?.data?.bank_name,
  };
}
