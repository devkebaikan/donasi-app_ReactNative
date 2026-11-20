import {apiClient} from './apiClient';
import type {ApiResponse} from '@/types/api';
import type {Program} from '@/types/program';
import type {GoldPrice} from '@/types/zakat';

export interface NishabItem {
  id: number;
  name: string;
  value: string;
  type: string;
  created_at?: string;
  updated_at?: string;
}

export interface ZakatSetup {
  id: number;
  link: string;
}

/**
 * Mengambil data nishab dari live endpoint `GET /zakat/nishab`
 */
export async function getNishabData(): Promise<{
  emasPerGram: number;
  berasPerKg: number;
  updatedAt: string | null;
}> {
  try {
    const res = await apiClient.get<{data: NishabItem[]; status: number}>('/zakat/nishab');
    const items = res.data?.data || [];
    const emas = items.find(i => i.name.toLowerCase() === 'emas') || items[1];
    const beras = items.find(i => i.name.toLowerCase() === 'beras') || items[0];

    const emasPerGram = Number(emas?.value) || 2_540_000;
    const berasPerKg = Number(beras?.value) || 11_000;
    const updatedAt = emas?.updated_at || null;

    return {emasPerGram, berasPerKg, updatedAt};
  } catch (err) {
    // Fallback defensif jika offline/gagal
    return {
      emasPerGram: 2_540_000,
      berasPerKg: 11_000,
      updatedAt: null,
    };
  }
}

/**
 * Mengambil setup program zakat dari live endpoint `GET /program-setup/zakat`
 */
export async function getZakatProgramSetup(): Promise<ZakatSetup> {
  try {
    const res = await apiClient.get<{
      data?: {id: number; name: string; value: string; value_type: string};
      status: number;
    }>('/program-setup/zakat');

    if (res.data?.data?.value) {
      const parsed = JSON.parse(res.data.data.value);
      return {
        id: Number(parsed?.id) || 4,
        link: parsed?.link || 'zakatpenghasilan',
      };
    }
    return {id: 4, link: 'zakatpenghasilan'};
  } catch (err) {
    return {id: 4, link: 'zakatpenghasilan'};
  }
}

/**
 * Backward compatibility untuk hook useZakatKalkulator
 */
export async function getGoldPrice(): Promise<ApiResponse<GoldPrice>> {
  const {emasPerGram} = await getNishabData();
  return {
    success: true,
    message: 'OK',
    data: {
      pricePerGram: emasPerGram,
      nisabGrams: 85,
    },
  };
}

export async function getZakatCategoryId(): Promise<number | null> {
  const setup = await getZakatProgramSetup();
  return setup.id || 4;
}

export async function getZakatPrograms(): Promise<ApiResponse<Program[]>> {
  try {
    const res = await apiClient.get<{data: any}>('/programs', {
      params: {category_slug: 'zakat', limit: 10},
    });
    const items = Array.isArray(res.data?.data)
      ? res.data.data
      : Array.isArray(res.data?.data?.items)
        ? res.data.data.items
        : [];
    return {success: true, message: 'OK', data: items};
  } catch {
    return {success: true, message: 'OK', data: []};
  }
}
